const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { Pool } = require('pg');
const { getPgSslOptions } = require('./pgSsl');

const onVercel = Boolean(process.env.VERCEL);

function badConnectionString(c) {
  return !c || /supa=base-pooler/i.test(c);
}

/**
 * Host db.PROJECT.supabase.co (puerto implícito 5432) desde Vercel suele colgar; hay que usar pooler.
 */
function isDirectSupabaseDbHost(url) {
  if (!url || badConnectionString(url)) return false;
  if (/pooler\.supabase\.com/i.test(url)) return false;
  if (/:6543\b/.test(url)) return false;
  return /db\.[^.]+\.supabase\.co\b/i.test(url);
}

/**
 * Vercel: si DATABASE_URL es el host directo de Supabase y existen POSTGRES_*, usamos el pooler primero.
 * Para forzar el host directo (no recomendado): ALLOW_DIRECT_SUPABASE_DB=1
 */
function pickConnectionString() {
  const envTrim = (k) => String(process.env[k] || '').trim();
  const forceDirect = /^1|true|yes$/i.test(envTrim('ALLOW_DIRECT_SUPABASE_DB'));

  const dbUrl = envTrim('DATABASE_URL');
  const poolerCandidates = [
    ['POSTGRES_PRISMA_URL', envTrim('POSTGRES_PRISMA_URL')],
    ['POSTGRES_URL_NON_POOLING', envTrim('POSTGRES_URL_NON_POOLING')],
    ['POSTGRES_URL', envTrim('POSTGRES_URL')],
  ];

  if (!onVercel) {
    if (!badConnectionString(dbUrl)) return { url: dbUrl, source: 'DATABASE_URL' };
    return null;
  }

  const ordered = [];
  const useDatabaseUrlFirst =
    dbUrl &&
    !badConnectionString(dbUrl) &&
    (forceDirect || !isDirectSupabaseDbHost(dbUrl));

  if (useDatabaseUrlFirst) {
    ordered.push(['DATABASE_URL', dbUrl]);
  }
  for (const row of poolerCandidates) {
    if (!badConnectionString(row[1])) ordered.push(row);
  }
  if (dbUrl && !badConnectionString(dbUrl) && !useDatabaseUrlFirst) {
    ordered.push(['DATABASE_URL', dbUrl]);
  }

  const seen = new Set();
  for (const [key, url] of ordered) {
    if (seen.has(url)) continue;
    seen.add(url);
    return { url, source: key };
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
  const dbUrl = String(process.env.DATABASE_URL || '').trim();
  if (
    dbUrl &&
    isDirectSupabaseDbHost(dbUrl) &&
    connectionSource !== 'DATABASE_URL'
  ) {
    console.warn(
      `[db] DATABASE_URL usa host directo db.*.supabase.co (colgaba en serverless); conectando vía ${connectionSource}. Opcional: reemplazá DATABASE_URL en Vercel por la URI del pooler.`
    );
  }
  if (
    isDirectSupabaseDbHost(connectionString) &&
    !/^1|true|yes$/i.test(String(process.env.ALLOW_DIRECT_SUPABASE_DB || ''))
  ) {
    console.warn(
      '[db] Seguís con host directo Supabase sin pooler; en Vercel suele dar 504. Agregá POSTGRES_PRISMA_URL (integración) o la URI Transaction pooler en DATABASE_URL.'
    );
  }
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
