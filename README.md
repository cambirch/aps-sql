aps-sql v0.2.0
=======

A node.js library that uses Edge.js and ADO.NET to allow for proper SQL use from a node.js app.

### Installing for use ###

This module is **not** published to NPM nor will it be anytime soon.  This is important at this point!

Using this module requires a few simple steps in order to install it as a natural NPM module.

- Clone the repository into a local directory
- Open an Administrator command prompt
- Browse to the directory that the repository is cloned into
- Use the cmd: `npm link`
- Browse to the directory that you are building a node project that requires the aps-sql module
- Use the cmd: `npm link aps-sql`
- Use the module as you would any other `require('aps-sql')`

## Using ##

    var sql = require('aps-sql');
    sql.connectionString('Data Source=devtest;Initial Catalog=entCustomer;User Id=sa;Password=admin;');
    
    // Perform a select
    console.log(sql.executeQuery('Select top 3 assetID from asset'));
	// Perform an insert
    sql.executeNonQuery("Insert INTO asset (AssetID) VALUES ( 'abc' )");

With **Transaction** support:

    var sql = require('aps-sql');
    sql.connectionString('Data Source=devtest;Initial Catalog=entCustomer;User Id=sa;Password=admin;');
    
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
