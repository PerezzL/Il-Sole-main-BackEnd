const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { Pool } = require('pg');
const { getPgSslOptions } = require('./pgSsl');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL no está definida. Configurá la variable en BackEnd/.env (sin commitear secretos).'
  );
}

const pool = new Pool({
  connectionString,
  ssl: getPgSslOptions(connectionString),
  max: 20,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 120000,
  query_timeout: 120000,
  statement_timeout: 120000,
});

pool.on('connect', () => {});

pool.on('error', () => {});

module.exports = pool;
