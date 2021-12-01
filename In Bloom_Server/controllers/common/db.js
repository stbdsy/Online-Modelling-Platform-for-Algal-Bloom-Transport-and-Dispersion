var mysql  = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    port     : '3306',
    user     : 'root',
    password : '111111',
    database: 'inbloom',
    multipleStatements: true 
});
connection.connect();
module.exports = connection;