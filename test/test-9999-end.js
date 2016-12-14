var fs = require('fs'),
  mysql = require('mysql');
var connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: 'Amazon RDS',
  multipleStatements: true
});

describe('FINISH', function () {
  "use strict";

  it("should reset the database to initial state",function (done) {
    console.log('RESET DATABASE');
    connection.query(fs.readFileSync(__dirname + '/database-schema.sql', 'utf8'), function (err, res) {
      if (err) throw err;
      console.log("DATABASE SCHEMA LOADED");
      connection.query(fs.readFileSync(__dirname + '/database-test-data.sql', 'utf8'), function (err, res) {
        if (err) throw err;
        console.log("DATABASE TEST DATA LOADED");
        connection.end();
        done()
      });
    });
  });
});
