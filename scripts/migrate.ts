import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env.local')
  try {
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // .env.local not found, use existing env
  }
}

async function migrate() {
  loadEnvFile()

  const connection = await mysql.createConnection({
    host: process.env.MARIADB_HOST,
    database: process.env.MARIADB_DATABASE,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    charset: 'utf8mb4',
  })

  console.log('Connected to MariaDB. Running migration...')

  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        role ENUM('member', 'staff', 'admin') DEFAULT 'member',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_status (status),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ users table ready')

    const [pointCols] = await connection.execute(`SHOW COLUMNS FROM users LIKE 'points_balance'`)
    if (Array.isArray(pointCols) && pointCols.length === 0) {
      await connection.execute(`
        ALTER TABLE users
          ADD COLUMN points_balance INT UNSIGNED NOT NULL DEFAULT 0 AFTER status
      `)
      console.log('✓ users table altered (points_balance)')
    } else {
      console.log('✓ users points column ready')
    }

    // Create sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token(255)),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ sessions table ready')

    // Create staff_permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff_permissions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        permission VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uk_user_permission (user_id, permission),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ staff_permissions table ready')

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address_line1 VARCHAR(500) NOT NULL,
        address_line2 VARCHAR(500) DEFAULT NULL,
        subdistrict VARCHAR(255) DEFAULT NULL,
        district VARCHAR(255) NOT NULL,
        province VARCHAR(255) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'Thailand',
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_default (user_id, is_default),
        INDEX idx_user_address (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ user_addresses table ready')

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(40) UNIQUE NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        address_id BIGINT UNSIGNED DEFAULT NULL,
        status ENUM('pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'THB',
        customer_note TEXT DEFAULT NULL,
        shipping_snapshot_json JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (address_id) REFERENCES user_addresses(id) ON DELETE SET NULL,
        INDEX idx_user_orders (user_id, created_at),
        INDEX idx_order_status (status),
        INDEX idx_order_number (order_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ orders table ready')

    const [trackingCols] = await connection.execute(
      `SHOW COLUMNS FROM orders LIKE 'tracking_number'`,
    )
    if (Array.isArray(trackingCols) && trackingCols.length === 0) {
      await connection.execute(`
        ALTER TABLE orders
          ADD COLUMN shipping_carrier VARCHAR(100) DEFAULT NULL AFTER customer_note,
          ADD COLUMN tracking_number VARCHAR(100) DEFAULT NULL AFTER shipping_carrier
      `)
      console.log('✓ orders table altered (shipping_carrier, tracking_number)')
    } else {
      console.log('✓ orders tracking columns ready')
    }

    const [paymentCols] = await connection.execute(
      `SHOW COLUMNS FROM orders LIKE 'payment_slip_url'`,
    )
    if (Array.isArray(paymentCols) && paymentCols.length === 0) {
      await connection.execute(`
        ALTER TABLE orders
          ADD COLUMN payment_status ENUM('unpaid', 'submitted', 'verified', 'rejected') NOT NULL DEFAULT 'unpaid' AFTER tracking_number,
          ADD COLUMN payment_slip_url VARCHAR(500) DEFAULT NULL AFTER payment_status,
          ADD COLUMN payment_submitted_at DATETIME DEFAULT NULL AFTER payment_slip_url
      `)
      console.log('✓ orders table altered (payment fields)')
    } else {
      console.log('✓ orders payment columns ready')
    }

    const [orderPointCols] = await connection.execute(
      `SHOW COLUMNS FROM orders LIKE 'points_awarded_at'`,
    )
    if (Array.isArray(orderPointCols) && orderPointCols.length === 0) {
      await connection.execute(`
        ALTER TABLE orders
          ADD COLUMN points_awarded INT UNSIGNED NOT NULL DEFAULT 0 AFTER payment_submitted_at,
          ADD COLUMN points_awarded_at DATETIME DEFAULT NULL AFTER points_awarded
      `)
      console.log('✓ orders table altered (points fields)')
    } else {
      console.log('✓ orders points columns ready')
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        order_id BIGINT UNSIGNED DEFAULT NULL,
        points INT NOT NULL,
        type ENUM('earn', 'redeem', 'adjust') NOT NULL DEFAULT 'earn',
        description VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
        UNIQUE KEY uk_order_earn (order_id, type),
        INDEX idx_loyalty_user (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ loyalty_transactions table ready')

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT UNSIGNED NOT NULL,
        product_slug VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_name_en VARCHAR(255) DEFAULT NULL,
        weight VARCHAR(100) DEFAULT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INT UNSIGNED NOT NULL,
        line_total DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_items_order (order_id),
        INDEX idx_order_items_product (product_slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ order_items table ready')

    // Alter existing articles table (safe — ignores if columns already exist)
    const [cols] = await connection.execute(`SHOW COLUMNS FROM articles LIKE 'author_id'`)
    if (Array.isArray(cols) && cols.length === 0) {
      await connection.execute(`
        ALTER TABLE articles
          ADD COLUMN author_id BIGINT UNSIGNED DEFAULT NULL AFTER status,
          ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL AFTER image_prompt,
          ADD COLUMN meta_description TEXT DEFAULT NULL AFTER meta_title,
          ADD FOREIGN KEY fk_articles_author (author_id) REFERENCES users(id) ON DELETE SET NULL
      `)
      console.log('✓ articles table altered (author_id, meta_title, meta_description)')
    } else {
      console.log('✓ articles table already migrated, skipping ALTER')
    }

    // Seed admin account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@khua.lab'
    const adminPassword = process.env.ADMIN_PASSWORD || 'khuaadmin2026'
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail],
    )

    if (Array.isArray(existing) && existing.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 12)
      const [result] = await connection.execute(
        'INSERT INTO users (email, password_hash, name, role, status) VALUES (?, ?, ?, ?, ?)',
        [adminEmail, passwordHash, 'Super Admin', 'admin', 'active'],
      )
      const userId = (result as mysql.ResultSetHeader).insertId

      // Grant all permissions to admin
      const perms = ['manage_articles', 'manage_members', 'manage_staff', 'manage_products']
      for (const perm of perms) {
        await connection.execute(
          'INSERT INTO staff_permissions (user_id, permission) VALUES (?, ?)',
          [userId, perm],
        )
      }

      console.log(`✓ Admin seeded: ${adminEmail}`)
    } else {
      console.log('✓ Admin already exists, skipping seed')
    }

    console.log('\nMigration complete.')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await connection.end()
  }
}

migrate().catch(() => process.exit(1))
