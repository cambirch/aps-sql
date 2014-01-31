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

                case "beginTransaction":
                    return BeginTransaction(connectionString, parameters);
                case "commitTransaction":
                    return CommitTransaction(parameters);
                case "cancelTransaction":
                    return CancelTransaction(parameters);

                case "transactionExecute":
                    return await TransactionExecuteQuery(connectionString, parameters);
                case "transactionNonQuery":
                    return await TransactionExecuteNonQuery(connectionString, parameters);
                case "transactionExecuteSync": {
                        var val = TransactionExecuteQuery(connectionString, parameters);
                        val.Wait();
                        return val;
                    }
                case "transactionNonQuerySync": {
                        var val = TransactionExecuteNonQuery(connectionString, parameters);
                        val.Wait();
                        return val;
                    }
            }

            throw new InvalidOperationException("Unknown function requested");
        }

        public async Task<object> ExecuteQuery(string connectionString, IDictionary<string, object> parameters) {
            var commandString = (string)parameters["command"];

            using (var connection = new SqlConnection(connectionString)) {
                using (var command = new SqlCommand(commandString, connection)) {
                    SetParametersOnCommand(command, parameters);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync(CommandBehavior.CloseConnection)) {
                        return await ReaderToFieldData(reader);
                    }
                }
            }
        }
        public async Task<object> ExecuteNonQuery(string connectionString, IDictionary<string, object> parameters) {
            var commandString = (string)parameters["command"];
            
            using (var connection = new SqlConnection(connectionString)) {
                using (var command = new SqlCommand(commandString, connection)) {
                    SetParametersOnCommand(command, parameters);

                    await connection.OpenAsync();
                    return await command.ExecuteNonQueryAsync();
                }
            }
        }

        private object BeginTransaction(string connectionString, IDictionary<string, object> parameters) {
            var connection = new SqlConnection(connectionString);
            var transaction = connection.BeginTransaction(IsolationLevel.Unspecified);

            var transObj = new TransactionObject {Connection = connection, Transaction = transaction};
            return AddToCache(transObj);
        }
        private object CommitTransaction(IDictionary<string, object> parameters) {
            var transactionKey = (int)parameters["transaction"];
            var tranObj = (TransactionObject)KeyedCache[transactionKey];

            tranObj.Transaction.Commit();
            tranObj.Transaction.Dispose();
            tranObj.Connection.Close();
            tranObj.Connection.Dispose();

            KeyedCache.Remove(transactionKey);

            return null;
        }
        private object CancelTransaction(IDictionary<string, object> parameters) {
            var transactionKey = (int)parameters["transaction"];
            var tranObj = (TransactionObject)KeyedCache[transactionKey];

            tranObj.Transaction.Rollback();
            tranObj.Transaction.Dispose();
            tranObj.Connection.Close();
            tranObj.Connection.Dispose();

            KeyedCache.Remove(transactionKey);

            return null;
        }
        public async Task<object> TransactionExecuteQuery(string connectionString, IDictionary<string, object> parameters) {
            var commandString = (string)parameters["command"];
            var transactionKey = (int)parameters["transaction"];
            var tranObj = (TransactionObject)KeyedCache[transactionKey];

            var connection = tranObj.Connection;
            var transaction = tranObj.Transaction;

            using (var command = new SqlCommand(commandString, connection, transaction)) {
                SetParametersOnCommand(command, parameters);

                await connection.OpenAsync();
                using (SqlDataReader reader = await command.ExecuteReaderAsync(CommandBehavior.SingleResult)) {
                    return await ReaderToFieldData(reader);
                }
            }
        }
        public async Task<object> TransactionExecuteNonQuery(string connectionString, IDictionary<string, object> parameters) {
            var commandString = (string)parameters["command"];
            var transactionKey = (int)parameters["transaction"];
            var tranObj = (TransactionObject)KeyedCache[transactionKey];

            var connection = tranObj.Connection;
            var transaction = tranObj.Transaction;

            using (var command = new SqlCommand(commandString, connection, transaction)) {
                SetParametersOnCommand(command, parameters);

                await connection.OpenAsync();
                return await command.ExecuteNonQueryAsync();
            }
        }


        #region Transaction Objects

        private class TransactionObject
        {
            public SqlConnection Connection { get; set; }
            public SqlTransaction Transaction { get; set; }
        }

        #endregion

        #region Caching Elements

        private int uniqueKey = 0;
        private int GetKey() {
            return uniqueKey++;
        }
        private readonly Dictionary<int, object> KeyedCache = new Dictionary<int, object>();
        private int AddToCache(object itemToCache) {
            int key;

            key = GetKey();
            KeyedCache.Add(key, itemToCache);
            return key;
        }

        #endregion

        #region Utility Methods

        private void SetParametersOnCommand(SqlCommand command, IDictionary<string, object> parameters) {
            var paramObj = (IDictionary<string, object>)parameters["params"] ?? new Dictionary<string, object>();

            // Add any passed parameters
            foreach (var param in paramObj) {
                var paramKey = param.Key;
                if (!paramKey.StartsWith("@")) paramKey = "@" + paramKey;

                command.Parameters.AddWithValue(paramKey, param.Value);
            }
        }

        private async Task<List<object>> ReaderToFieldData(SqlDataReader reader) {
            var rows = new List<object>();

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

            return rows;
        }

        #endregion
    }
}
