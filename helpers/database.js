const mysql = require('mysql2');
const { password } = require('../.env');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'node-complete',
  password,
});

module.exports = pool.promise();
