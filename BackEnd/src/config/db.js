const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { Pool } = require('pg');
const { getPgSslOptions } = require('./pgSsl');

const onVercel = Boolean(process.env.VERCEL);

/**
 * Vercel + integración Supabase suele inyectar POSTGRES_*; el código histórico usa DATABASE_URL.
 * En serverless, Supabase recomienda el Transaction pooler (6543 / POSTGRES_PRISMA_URL) antes que sesión directa.
 */
function pickConnectionString() {
  const envTrim = (k) => String(process.env[k] || '').trim();
  const ordered = onVercel
    ? [
        ['DATABASE_URL', envTrim('DATABASE_URL')],
        ['POSTGRES_PRISMA_URL', envTrim('POSTGRES_PRISMA_URL')],
        ['POSTGRES_URL_NON_POOLING', envTrim('POSTGRES_URL_NON_POOLING')],
        ['POSTGRES_URL', envTrim('POSTGRES_URL')],
      ]
    : [['DATABASE_URL', envTrim('DATABASE_URL')]];

  for (const [key, c] of ordered) {
    if (!c || /supa=base-pooler/i.test(c)) continue;
    return { url: c, source: key };
  }
  return null;
}

const picked = pickConnectionString();

if (!picked) {
  throw new Error(
    'Falta URI de Postgres: definí DATABASE_URL o (en Vercel) POSTGRES_URL_NON_POOLING / POSTGRES_PRISMA_URL desde la integración Supabase.'
  );
}

const { url: connectionString, source: connectionSource } = picked;

if (onVercel) {
  console.log(`[db] Origen de conexión: ${connectionSource}`);
}

if (
  onVercel &&
  /db\.\w+\.supabase\.co:5432/i.test(connectionString) &&
  !/pooler\.supabase\.com/i.test(connectionString)
) {
  console.warn(
    '[db] Estás usando host db.*.supabase.co:5432 en Vercel; suele colgar. Usá pooler (POSTGRES_URL_NON_POOLING / PRISMA) o cambiá DATABASE_URL.'
  );
}

if (
  onVercel &&
  !/pooler\.supabase\.com/i.test(connectionString) &&
  !/:6543\b/.test(connectionString)
) {
  console.warn(
    '[db] En Vercel conviene pooler (*.pooler.supabase.com, 5432 session o 6543 transaction).'
  );
}

/** En serverless: timeouts en la URI (no agregamos pgbouncer=true: con node-pg a veces empeora o no aplica). */
function resolveConnectionString(raw) {
  if (!onVercel) return raw;
  const extra = [];
  if (!/connect_timeout=/i.test(raw)) extra.push('connect_timeout=10');
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
      connectionTimeoutMillis: 10_000,
      // Evita que una consulta colgada consuma toda la lambda hasta el maxDuration (60s).
      query_timeout: 12_000,
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

pool.on('connect', () => {});

pool.on('error', () => {});

module.exports = pool;
