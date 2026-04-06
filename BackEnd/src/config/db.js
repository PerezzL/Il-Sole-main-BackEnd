const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const onVercel = Boolean(process.env.VERCEL);

function envTrim(k) {
  return String(process.env[k] || '').trim();
}

function cleanConnectionString(raw) {
  if (!raw) return raw;
  let cleaned = raw.replace(/[&?]supa=[^&]*/gi, '');
  // En Vercel, forzar puerto 6543 (Transaction pooler) si es pooler Supabase con 5432
  if (onVercel && /pooler\.supabase\.com/i.test(cleaned)) {
    cleaned = cleaned.replace(/:5432\b/, ':6543');
    // pgbouncer param no es necesario con @neondatabase/serverless
    cleaned = cleaned.replace(/[&?]pgbouncer=[^&]*/gi, '');
  }
  return cleaned;
}

function pickConnectionString() {
  const keys = onVercel
    ? ['DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING', 'POSTGRES_URL']
    : ['DATABASE_URL'];

  for (const key of keys) {
    const val = cleanConnectionString(envTrim(key));
    if (val) return { url: val, source: key };
  }
  return null;
}

const picked = pickConnectionString();
if (!picked) {
  throw new Error('Falta URI de Postgres (DATABASE_URL o POSTGRES_*).');
}
const { url: connectionString, source: connectionSource } = picked;

let pool;

if (onVercel) {
  // TCP y WebSocket al pooler de Supabase cuelgan desde Vercel.
  // Usamos el modo HTTP de @neondatabase/serverless (sin conexión persistente).
  const { neon } = require('@neondatabase/serverless');

  try {
    const u = new URL(connectionString.replace(/^postgres(ql)?:/i, 'http:'));
    console.log(`[db] Origen: ${connectionSource} | host: ${u.hostname} | puerto: ${u.port || '5432'} | driver: neon-http`);
  } catch {
    console.log(`[db] Origen: ${connectionSource} | driver: neon-http`);
  }

  const sql = neon(connectionString, { fullResults: true });

  pool = {
    async query(text, params) {
      const start = Date.now();
      try {
        const result = await sql.query(text, params || []);
        const ms = Date.now() - start;
        if (ms > 5000) console.warn(`[db] Query lenta (${ms}ms): ${text.substring(0, 80)}`);
        return result;
      } catch (err) {
        console.error(`[db] Query error (${Date.now() - start}ms):`, err.message);
        throw err;
      }
    },
    async connect() {
      return {
        query: (text, params) => sql.query(text, params || []),
        release: () => {},
      };
    },
    on() {},
    end() {},
  };
} else {
  const { Pool } = require('pg');
  const { getPgSslOptions } = require('./pgSsl');

  pool = new Pool({
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
}

module.exports = pool;
