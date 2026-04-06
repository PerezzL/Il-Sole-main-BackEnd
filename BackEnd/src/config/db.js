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

const onVercel = Boolean(process.env.VERCEL);

if (
  onVercel &&
  !/pooler\.supabase\.com|:6543\b/i.test(connectionString)
) {
  console.warn(
    '[db] En Vercel usá la URI del Transaction pooler de Supabase (puerto 6543 / host …pooler.supabase.com) en DATABASE_URL; la conexión directa suele colgar y da 504 a los 10s.'
  );
}

/** En serverless: timeouts cortos en la URI + pgbouncer para Supabase pooler */
function resolveConnectionString(raw) {
  if (!onVercel) return raw;
  const extra = [];
  if (!/connect_timeout=/i.test(raw)) extra.push('connect_timeout=8');
  if (/pooler\.supabase\.com/i.test(raw) && !/pgbouncer=/i.test(raw)) {
    extra.push('pgbouncer=true');
  }
  if (!/sslmode=/i.test(raw)) extra.push('sslmode=require');
  if (extra.length === 0) return raw;
  return raw + (raw.includes('?') ? '&' : '?') + extra.join('&');
}

const connectionStringResolved = resolveConnectionString(connectionString);

const pool = onVercel
  ? new Pool({
      connectionString: connectionStringResolved,
      ssl: getPgSslOptions(connectionStringResolved),
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 6_000,
    })
  : new Pool({
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
