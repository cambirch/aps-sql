///<reference path='node.d.ts'/>
var aps;
(function (aps) {
    var edge = require('edge');

    var conStr = '';

    /**
    * Must be called first.
    * Sets the connection string to be used by all other calls to the aps-sql library.
    *
    * @param {string} str The connection string to use.
    */
    function connectionString(str) {
        conStr = str;
    }
    aps.connectionString = connectionString;

    /**
    * Executes a query and returns the result.  Must have called 'connectionString()' first.
    *
    * *Important Note: converts all results from the database into JS.  Don't just return everything otherwise you may run out of memory.
    *
    * @param {string} command The SQL command string to run
    * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
    * @returns An array of arrays.  First element contains the header row, all remaining arrays contain the data for the row.
    */
    function executeQuery(command, params) {
        return functions({ fn: 'executeSync', conStr: conStr, command: command, params: params }, true).Result;
    }
    aps.executeQuery = executeQuery;

    /**
    * Executes a query that does not have a result.  Must have called 'connectionString()' first.
    *
    * @param {string} command The SQL command string to run
    * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
    */
    function executeNonQuery(command, params) {
        functions({ fn: 'nonQuerySync', conStr: conStr, command: command, params: params }, true);
    }
    aps.executeNonQuery = executeNonQuery;

    //#region Edge Function Inits
    var functions = edge.func({
        source: __dirname + "/.cs/Sql.cs",
        typeName: 'aps_sql_cs.Sql',
        methodName: 'Invoke',
        references: ['System.dll', 'System.Data.dll']
    });
})(aps || (aps = {}));

exports.connectionString = aps.connectionString;
exports.executeQuery = aps.executeQuery;
exports.executeNonQuery = aps.executeNonQuery;
