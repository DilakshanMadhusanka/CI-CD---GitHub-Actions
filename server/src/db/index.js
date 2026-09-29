const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction && !process.env.DISABLE_SSL ? { rejectUnauthorized: false } : false,
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'perndb',
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Helper function to initialize database tables from init.sql
async function initializeDatabase() {
  try {
    const initSqlPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(initSqlPath)) {
      const sql = fs.readFileSync(initSqlPath, 'utf8');
      await pool.query(sql);
      console.log('Database tables verified/initialized successfully.');
    }
  } catch (error) {
    console.warn('Note: Could not run init.sql automatically:', error.message);
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initializeDatabase,
};
