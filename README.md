aps-sql v0.3.0
=======

A node.js library that uses Edge.js and ADO.NET to allow for proper SQL use from a node.js app.

### Installing for use ###

Please note that this module is **not** published to NPM nor will it be anytime soon.

Installation has been simplified in this version.

    npm install camMCC/aps-sql --save

**NOTE:** The above command is CASE SENSITIVE.


## Using ##

    var sql = require('aps-sql');
    sql.connectionString('<the connection string>');
    
    // Perform a select
    console.log(sql.executeQuery('Select top 3 assetID from asset'));
	// Perform an insert
    sql.executeNonQuery("Insert INTO asset (AssetID) VALUES ( 'abc' )");

With **Transaction** support:

    var sql = require('aps-sql');
    sql.connectionString('<the connection string>');
    
    // Create the transaction
	var transaction = sql.beginTransaction();
	
    // Perform a select
    console.log(transaction.executeQuery('Select top 3 assetID from asset'));
	// Perform an insert
    transaction.executeNonQuery("Insert INTO asset (AssetID) VALUES ( 'abc' )");
	
	// Rollback the transaction
	transaction.cancel();
	
	// Commit the transaction
	transaction.commit();

Queries with parameters:

    var sql = require('aps-sql');
    sql.connectionString('<the connection string>');

    sql.executeQuery('Select AssetID From Asset Where AssetID = @param', {param: 'abc'});
    // or
    sql.executeQuery('Select AssetID From Asset Where AssetID = @param', {'@param': 'abc'});

## TypeScript ##

If using TypeScript include the TypeScript definitions:

    /// <reference path='aps-sql.d.ts'/>

## API ##
API description provided in Typescript syntax for ease.

    /**
     * Must be called first.
     * Sets the connection string to be used by all other calls to the aps-sql library.
     *
     * @param {string} str The connection string to use.
     */
    connectionString(str: string): void

    /**
     * Executes a query and returns the result.  Must have called 'connectionString()' first.
     * 
     * *Important Note: converts all results from the database into JS.  Don't just return everything otherwise you may run out of memory.
     *
     * @param {string} command The SQL command string to run
     * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
     * @returns An array of arrays.  First element contains the header row, all remaining arrays contain the data for the row.
     */
    executeQuery(command: string, params?: {}): any

    /**
     * Executes a query that does not have a result.  Must have called 'connectionString()' first.
     *
     * @param {string} command The SQL command string to run
     * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
     */
    executeNonQuery(command: string, params?: {}): void

    /**
     * Begins a new transaction.  Must have called 'connectionString()' first.
     *
     * @returns A Transaction object which can be used to execute queries, and commit or cancel the transaction.
     */
    beginTransaction() : Transaction;

    interface Transaction {
        /**
         * Executes a query and returns the result.
         * 
         * *Important Note: converts all results from the database into JS.  Don't just return everything otherwise you may run out of memory.
         *
         * @param {string} command The SQL command string to run
         * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
         * @returns An array of arrays.  First element contains the header row, all remaining arrays contain the data for the row.
         */
        executeQuery(command: string, params?: {}): any 
        /**
         * Executes a query that does not have a result.
         *
         * @param {string} command The SQL command string to run
         * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
         */
        executeNonQuery(command: string, params?: {}): any 
        /**
         * Commits the transaction and closes the database connection.
         */
        commit(): void
        /**
         * Rolls back the transaction and closes the database connection.
         */
        cancel(): void
    }
