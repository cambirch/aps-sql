///<reference path='node.d.ts'/>

module aps {
    var edge = require('edge');

    var conStr: string = '';
    export function connectionString(str: string): void {
        conStr = str;
    }

    export function executeQuery(command: string, params?: {}): any {
        return functions({ fn: 'executeSync', conStr: conStr, command: command, params: params}, true).Result;
    }

    export function executeNonQuery(command: string, params?: {}): void {
        functions({ fn: 'nonQuerySync', conStr: conStr, command: command, params: params }, true);
    }

    //#region Edge Function Inits

    var functions = edge.func({
        source: __dirname + "/.cs/Sql.cs",
        typeName: 'aps_sql_cs.Sql',
        methodName: 'Invoke',
        references: ['System.dll', 'System.Data.dll']
    });

    //#endregion

}

exports.connectionString = aps.connectionString;
exports.executeQuery = aps.executeQuery;
exports.executeNonQuery = aps.executeNonQuery;