///<reference path='node.d.ts'/>

module aps {
    var edge = require('edge');

    var conStr: string = '';
    /**
     * Must be called first.
     * Sets the connection string to be used by all other calls to the aps-sql library.
     *
     * @param {string} str The connection string to use.
     */
    export function connectionString(str: string): void {
        conStr = str;
    }

    /**
     * Executes a query and returns the result.  Must have called 'connectionString()' first.
     * 
     * *Important Note: converts all results from the database into JS.  Don't just return everything otherwise you may run out of memory.
     *
     * @param {string} command The SQL command string to run
     * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
     * @returns An array of arrays.  First element contains the header row, all remaining arrays contain the data for the row.
     */
    export function executeQuery(command: string, params?: {}): any {
        return functions({ fn: 'executeSync', conStr: conStr, command: command, params: params}, true).Result;
    }

    /**
     * Executes a query that does not have a result.  Must have called 'connectionString()' first.
     *
     * @param {string} command The SQL command string to run
     * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
     */
    export function executeNonQuery(command: string, params?: {}): void {
        functions({ fn: 'nonQuerySync', conStr: conStr, command: command, params: params }, true);
    }

    /**
     * Begins a new transaction.  Must have called 'connectionString()' first.
     *
     * @returns A Transaction object which can be used to execute queries, and commit or cancel the transaction.
     */
    export function beginTransaction(): Transaction {
        var transCode = functions({ fn: 'beginTransaction', conStr: conStr }, true);
        return new Transaction(transCode);
    }


    export class Transaction {
        constructor(private transaction: any) {
        }

        /**
         * Executes a query and returns the result.
         * 
         * *Important Note: converts all results from the database into JS.  Don't just return everything otherwise you may run out of memory.
         *
         * @param {string} command The SQL command string to run
         * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
         * @returns An array of arrays.  First element contains the header row, all remaining arrays contain the data for the row.
         */
        public executeQuery(command: string, params?: {}): any {
            return functions({ fn: 'transactionExecuteSync', transaction: this.transaction, conStr: conStr, command: command, params: params }, true).Result;
        }
        /**
         * Executes a query that does not have a result.
         *
         * @param {string} command The SQL command string to run
         * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
         */
        public executeNonQuery(command: string, params?: {}): any {
            return functions({ fn: 'transactionNonQuerySync', transaction: this.transaction, conStr: conStr, command: command, params: params }, true).Result;
        }

        /**
         * Commits the transaction and closes the database connection.
         */
        public commit(): void {
            return functions({ fn: 'commitTransaction', transaction: this.transaction }, true);
        }
        /**
         * Rolls back the transaction and closes the database connection.
         */
        public cancel(): void {
            return functions({ fn: 'cancelTransaction', transaction: this.transaction }, true);
        }

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
exports.beginTransaction = aps.beginTransaction;