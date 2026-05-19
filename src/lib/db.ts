import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MARIADB_HOST,
  database: process.env.MARIADB_DATABASE,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 2,
  idleTimeout: 15000,
  connectTimeout: 3000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
})

export default pool
