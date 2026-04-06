/**
 * Configuración SSL para el cliente `pg`.
 *
 * Por defecto: TLS con verificación de certificado (recomendado para Supabase, Neon, RDS, etc.).
 * Si tu red usa un proxy que reemplaza certificados (MITM corporativo), definí en .env:
 *   DATABASE_SSL_INSECURE=1
 * Solo usar en desarrollo / redes controladas.
 */

function hostnameFromConnectionString(connectionString) {
  if (!connectionString || typeof connectionString !== 'string') return '';
  try {
    const u = new URL(connectionString.replace(/^postgresql:/i, 'http:'));
    return (u.hostname || '').toLowerCase();
  } catch {
    return '';
  }
}

function getPgSslOptions(connectionString) {
  if (!connectionString || typeof connectionString !== 'string') {
    return undefined;
  }

  if (/sslmode=disable/i.test(connectionString)) {
    return false;
  }

  if (
    process.env.DATABASE_SSL_INSECURE === '1' ||
    /^true$/i.test(process.env.DATABASE_SSL_INSECURE || '')
  ) {
    return { rejectUnauthorized: false };
  }

  const host = hostnameFromConnectionString(connectionString);
  const local =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1';

  if (local && !/sslmode=require/i.test(connectionString)) {
    return false;
  }

  // Supabase pooler (*.pooler.supabase.com) necesita rejectUnauthorized: false
  // porque el certificado del pooler no coincide con el hostname del proyecto.
  if (/pooler\.supabase\.com/i.test(host) || /supabase/i.test(host)) {
    return { rejectUnauthorized: false };
  }

  return { rejectUnauthorized: true };
}

module.exports = { getPgSslOptions };
