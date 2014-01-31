var sql = require('../aps-sql');

sql.connectionString('Data Source=devtest;Initial Catalog=entCustomer;User Id=sa;Password=admin;');

console.log(sql.executeQuery('Select top 3 assetID from asset'));
//sql.executeNonQuery();

var transaction = sql.beginTransaction();
console.log(transaction.executeQuery('Select top 3 assetID from asset'));
transaction.cancel();

console.log('done');