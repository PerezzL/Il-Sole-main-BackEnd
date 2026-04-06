const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { Pool } = require('pg');
const { getPgSslOptions } = require('./pgSsl');

const onVercel = Boolean(process.env.VERCEL);

function envTrim(k) {
  return String(process.env[k] || '').trim();
}

/**
 * Limpia la URI: quita parámetros que pgbouncer / node-pg no entienden
 * y que pueden hacer que la conexión se cuelgue silenciosamente.
 */
function cleanConnectionString(raw) {
  if (!raw) return raw;
  try {
    const u = new URL(raw.replace(/^postgres(ql)?:/i, 'http:'));
    const badParams = ['supa'];
    for (const key of [...u.searchParams.keys()]) {
      if (badParams.includes(key)) u.searchParams.delete(key);
    }
    const proto = raw.match(/^(postgres(?:ql)?:)/i)?.[1] || 'postgres:';
    return proto + '//' + u.username + (u.password ? ':' + u.password : '') +
      '@' + u.hostname + (u.port ? ':' + u.port : '') + u.pathname +
      (u.search || '');
  } catch {
    return raw.replace(/[&?]supa=[^&]*/gi, '');
  }
}

/**
 * En Vercel con pooler Supabase: usar puerto 6543 (Transaction mode) en vez de 5432 (Session).
 * Session pooler (5432) suele colgar desde serverless por la forma en que mantiene conexiones.
 */
function forceTransactionPooler(raw) {
  if (!onVercel || !raw) return raw;
  if (!/pooler\.supabase\.com/i.test(raw)) return raw;
  if (/:6543\b/.test(raw)) return raw;
  return raw.replace(/:5432\b/, ':6543');
}

function pickConnectionString() {
  const candidates = onVercel
    ? [
        ['DATABASE_URL', envTrim('DATABASE_URL')],
        ['POSTGRES_PRISMA_URL', envTrim('POSTGRES_PRISMA_URL')],
        ['POSTGRES_URL_NON_POOLING', envTrim('POSTGRES_URL_NON_POOLING')],
        ['POSTGRES_URL', envTrim('POSTGRES_URL')],
      ]
    : [['DATABASE_URL', envTrim('DATABASE_URL')]];

  for (const [key, raw] of candidates) {
    if (!raw) continue;
    const cleaned = forceTransactionPooler(cleanConnectionString(raw));
    if (cleaned) return { url: cleaned, source: key };
  }
  return null;
}

const picked = pickConnectionString();

if (!picked) {
  throw new Error(
    'Falta URI de Postgres: definí DATABASE_URL o (en Vercel) POSTGRES_PRISMA_URL / POSTGRES_URL desde la integración Supabase.'
  );
}

const { url: connectionString, source: connectionSource } = picked;

function addConnectParams(raw) {
  if (!onVercel) return raw;
  const extra = [];
  if (!/connect_timeout=/i.test(raw)) extra.push('connect_timeout=10');
  if (!/sslmode=/i.test(raw)) extra.push('sslmode=require');
  if (extra.length === 0) return raw;
  return raw + (raw.includes('?') ? '&' : '?') + extra.join('&');
}

const connectionStringResolved = addConnectParams(connectionString);

if (onVercel) {
  try {
    const u = new URL(connectionString.replace(/^postgres(ql)?:/i, 'http:'));
    console.log(`[db] Origen: ${connectionSource} | host: ${u.hostname} | puerto: ${u.port || '5432'}`);
  } catch {
    console.log(`[db] Origen: ${connectionSource}`);
  }
  console.log(`[db] SSL: ${JSON.stringify(getPgSslOptions(connectionStringResolved))}`);
}

const pool = onVercel
  ? new Pool({
      connectionString: connectionStringResolved,
      ssl: getPgSslOptions(connectionStringResolved),
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      query_timeout: 15_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
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

pool.on('connect', () => {
  if (onVercel) console.log('[db] Conexión establecida OK');
});

pool.on('error', (err) => {
  if (onVercel) console.error('[db] Pool error:', err.message);
});

module.exports = pool;
