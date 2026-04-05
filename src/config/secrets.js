/**
 * Secretos y validación para entornos seguros.
 */

const isProd = process.env.NODE_ENV === 'production';

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (s && String(s).trim().length >= 32) {
    return s.trim();
  }
  if (isProd) {
    throw new Error(
      'JWT_SECRET debe estar definida en .env y tener al menos 32 caracteres en producción.'
    );
  }
  if (s && s.length < 32) {
    console.warn(
      '[seguridad] JWT_SECRET es corta; usá al menos 32 caracteres incluso en desarrollo.'
    );
  }
  console.warn(
    '[seguridad] JWT_SECRET no configurada: usando secreto solo para desarrollo local.'
  );
  return 'dev-insecure-jwt-secret-do-not-use-in-production-min-32chars!!';
}

module.exports = { getJwtSecret, isProd };
