/************************************************
* *
* aps-sql v0.3.0 API *
* *
************************************************/

declare module "aps-sql" {

    /**
     * Must be called first.
     * Sets the connection string to be used by all other calls to the aps-sql library.
     *
     * @param {string} str The connection string to use.
     */
    export function connectionString(str: string): void;

    /**
     * Executes a query and returns the result.  Must have called 'connectionString()' first.
     * 
     * *Important Note: converts all results from the database into JS.  Don't just return everything otherwise you may run out of memory.
     *
     * @param {string} command The SQL command string to run
     * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
     * @returns An array of arrays.  First element contains the header row, all remaining arrays contain the data for the row.
     */
    export function executeQuery(command: string, params?: {}): any;
    /**
     * Executes a query that does not have a result.  Must have called 'connectionString()' first.
     *
     * @param {string} command The SQL command string to run
     * @param {object} params An optional object containing a list of @ parameters & values that are used in the previous command string.
     */
    export function executeNonQuery(command: string, params?: {}): void;
    
    /**
     * Begins a new transaction.  Must have called 'connectionString()' first.
     *
     * @returns A Transaction object which can be used to execute queries, and commit or cancel the transaction.
     */
    export function beginTransaction() : Transaction;

    export interface Transaction {
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

}