const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const onVercel = Boolean(process.env.VERCEL);

function envTrim(k) {
  return String(process.env[k] || '').trim();
}

function cleanConnectionString(raw) {
  if (!raw) return raw;
  return raw.replace(/[&?]supa=[^&]*/gi, '');
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
  // TCP directo desde Vercel al pooler de Supabase cuelga (probado con pg).
  // @neondatabase/serverless conecta vía WebSocket — compatible con pool.query().
  const { Pool: NeonPool, neonConfig } = require('@neondatabase/serverless');
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
  neonConfig.useSecureWebSocket = true;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;

  try {
    const u = new URL(connectionString.replace(/^postgres(ql)?:/i, 'http:'));
    console.log(`[db] Origen: ${connectionSource} | host: ${u.hostname} | puerto: ${u.port || '5432'} | driver: neon-serverless (ws)`);
  } catch {
    console.log(`[db] Origen: ${connectionSource} | driver: neon-serverless (ws)`);
  }

  pool = new NeonPool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on('connect', () => console.log('[db] Conexión WS establecida OK'));
  pool.on('error', (err) => console.error('[db] Pool error:', err.message));
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
