const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  port:'33066',
  user: 'root',
  password: '',
  database: 'manutencao',
  dateStrings: true, 
});

module.exports = pool;
