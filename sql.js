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

    /**
    * Begins a new transaction.  Must have called 'connectionString()' first.
    *
    * @returns A Transaction object which can be used to execute queries, and commit or cancel the transaction.
    */
    function beginTransaction() {
        var transCode = functions({ fn: 'beginTransaction', conStr: conStr }, true);
        return new Transaction(transCode);
    }
    aps.beginTransaction = beginTransaction;

    var Transaction = (function () {
        function Transaction(transaction) {
            this.transaction = transaction;
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
        Transaction.prototype.executeQuery = function (command, params) {
            return functions({ fn: 'transactionExecuteSync', transaction: this.transaction, conStr: conStr, command: command, params: params }, true).Result;
        };

        /**
        * Executes a query that does not have a result.
        *
        * @param {string} command The SQL command string to run
        * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
        */
        Transaction.prototype.executeNonQuery = function (command, params) {
            return functions({ fn: 'transactionNonQuerySync', transaction: this.transaction, conStr: conStr, command: command, params: params }, true).Result;
        };

        /**
        * Commits the transaction and closes the database connection.
        */
        Transaction.prototype.commit = function () {
            return functions({ fn: 'commitTransaction', transaction: this.transaction }, true);
        };

        /**
        * Rolls back the transaction and closes the database connection.
        */
        Transaction.prototype.cancel = function () {
            return functions({ fn: 'cancelTransaction', transaction: this.transaction }, true);
        };
        return Transaction;
    })();
    aps.Transaction = Transaction;

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
exports.beginTransaction = aps.beginTransaction;
