import mysql from 'mysql2/promise'

function readPositiveInt(name: string, fallback: number) {
  const value = Number(process.env[name])
  return Number.isInteger(value) && value > 0 ? value : fallback
}

function readNonNegativeInt(name: string, fallback: number) {
  const value = Number(process.env[name])
  return Number.isInteger(value) && value >= 0 ? value : fallback
}

const pool = mysql.createPool({
  host: process.env.MARIADB_HOST,
  database: process.env.MARIADB_DATABASE,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  waitForConnections: true,
  connectionLimit: readPositiveInt('MARIADB_CONNECTION_LIMIT', 4),
  maxIdle: readNonNegativeInt('MARIADB_MAX_IDLE', 0),
  idleTimeout: readPositiveInt('MARIADB_IDLE_TIMEOUT_MS', 5000),
  connectTimeout: readPositiveInt('MARIADB_CONNECT_TIMEOUT_MS', 3000),
  enableKeepAlive: process.env.MARIADB_KEEP_ALIVE === 'true',
  charset: 'utf8mb4',
})

let isClosing = false

async function closePool() {
  if (isClosing) return
  isClosing = true

  try {
    await pool.end()
  } catch (error) {
    console.warn('Failed to close MariaDB pool:', error)
  }
}

if (process.env.NODE_ENV === 'production') {
  process.once('SIGTERM', closePool)
  process.once('SIGINT', closePool)
}

export default pool
