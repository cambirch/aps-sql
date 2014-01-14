///<reference path='node.d.ts'/>
var aps;
(function (aps) {
    var edge = require('edge');

    var conStr = '';
    function connectionString(str) {
        conStr = str;
    }
    aps.connectionString = connectionString;

    function executeQuery(command, params) {
        return functions({ fn: 'executeSync', conStr: conStr, command: command, params: params }, true).Result;
    }
    aps.executeQuery = executeQuery;

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
