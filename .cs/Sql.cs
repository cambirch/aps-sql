using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace aps_sql_cs
{
    public class Sql
    {

        public async Task<object> Invoke(object input) {
            var parameters = (IDictionary<string, object>)input;
            var functionName = (string)parameters["fn"];
            var connectionString = (string)parameters["conStr"];

            switch (functionName) {
                case "execute":
                    return await ExecuteQuery(connectionString, parameters);
                case "nonQuery":
                    return await ExecuteNonQuery(connectionString, parameters);
                case "executeSync": {
                    var val = ExecuteQuery(connectionString, parameters);
                    val.Wait();
                    return val;
                }
                case "nonQuerySync": {
                    var val = ExecuteNonQuery(connectionString, parameters);
                    val.Wait();
                    return val;
                }
            }

            throw new InvalidOperationException("Unknown function requested");
        }

        public async Task<object> ExecuteQuery(string connectionString, IDictionary<string, object> parameters) {
            var commandString = (string)parameters["command"];
            var paramObj = (IDictionary<string, object>)parameters["params"] ?? new Dictionary<string, object>();
            
            var rows = new List<object>();

            using (var connection = new SqlConnection(connectionString)) {
                using (var command = new SqlCommand(commandString, connection)) {
                    
                    // Add any passed parameters
                    foreach (var param in paramObj) {
                        var paramKey = param.Key;
                        if (!paramKey.StartsWith("@")) paramKey = "@" + paramKey;

                        command.Parameters.AddWithValue(paramKey, param.Value);
                    }

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync(CommandBehavior.CloseConnection)) {
                        var fieldNames = new object[reader.FieldCount];
                        for (int i = 0; i < reader.FieldCount; i++) {
                            fieldNames[i] = reader.GetName(i);
                        }
                        rows.Add(fieldNames);

                        var record = (IDataRecord)reader;
                        while (await reader.ReadAsync()) {
                            var resultRecord = new object[record.FieldCount];
                            record.GetValues(resultRecord);
                            for (int i = 0; i < record.FieldCount; i++) {
                                Type type = record.GetFieldType(i);
                                if (type == typeof(byte[]) || type == typeof(char[])) {
                                    resultRecord[i] = Convert.ToBase64String((byte[])resultRecord[i]);
                                } else if (type == typeof(Guid) || type == typeof(DateTime)) {
                                    resultRecord[i] = resultRecord[i].ToString();
                                } else if (type == typeof(IDataReader)) {
                                    resultRecord[i] = "<IDataReader>";
                                }
                            }

                            rows.Add(resultRecord);
                        }
                    }
                }
            }

            return rows;
        }
        public async Task<object> ExecuteNonQuery(string connectionString, IDictionary<string, object> parameters) {
            var commandString = (string)parameters["command"];
            var paramObj = (IDictionary<string, object>)parameters["params"] ?? new Dictionary<string, object>();
            
            
            using (var connection = new SqlConnection(connectionString)) {
                using (var command = new SqlCommand(commandString, connection)) {

                    // Add any passed parameters
                    foreach (var param in paramObj) {
                        var paramKey = param.Key;
                        if (!paramKey.StartsWith("@")) paramKey = "@" + paramKey;

                        command.Parameters.AddWithValue(paramKey, param.Value);
                    }


                    await connection.OpenAsync();
                    return await command.ExecuteNonQueryAsync();
                }
            }
        }

    }
}
