const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const onVercel = Boolean(process.env.VERCEL);

function envTrim(k) {
  return String(process.env[k] || '').trim();
}

function cleanConnectionString(raw) {
  if (!raw) return raw;
  let cleaned = raw.replace(/[&?]supa=[^&]*/gi, '');
  cleaned = cleaned.replace(/[&?]pgbouncer=[^&]*/gi, '');
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
  // @neondatabase/serverless parchea net.Socket → WebSocket, haciendo que pg funcione
  // sin TCP directo. Esto resuelve el cuelgue de TCP desde Vercel al pooler de Supabase.
  const { Pool: NeonPool, neonConfig } = require('@neondatabase/serverless');
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
  neonConfig.useSecureWebSocket = true;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;

  // Usar puerto 5432 (Session pooler) para WebSocket — 6543 (Transaction) no soporta bien WS.
  let connStr = connectionString;
  if (/pooler\.supabase\.com/i.test(connStr)) {
    connStr = connStr.replace(/:6543\b/, ':5432');
  }

  try {
    const u = new URL(connStr.replace(/^postgres(ql)?:/i, 'http:'));
    console.log(`[db] Origen: ${connectionSource} | host: ${u.hostname} | puerto: ${u.port || '5432'} | driver: neon-ws`);
  } catch {
    console.log(`[db] Origen: ${connectionSource} | driver: neon-ws`);
  }

  pool = new NeonPool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  });

  pool.on('connect', () => console.log('[db] Conexión WS OK'));
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
