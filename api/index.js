/**
 * Vercel Serverless Function: /api/* → Express app.
 * Vercel rewrite convierte /api/auth/login → /api, perdiendo el path.
 * Restauramos el path original desde x-matched-path / x-vercel-forwarded-for / la URL real.
 */
const { app } = require('../BackEnd/server');

module.exports = (req, res) => {
  // El rewrite /api/(.*) → /api hace que req.url sea "/" o "".
  // Restauramos el path desde headers de Vercel (capture del rewrite).
  if (req.url === '/' || req.url === '') {
    const invokedPath = req.headers['x-invoke-path'] || '';
    const vercelPath = req.headers['x-now-route-matches'] || '';

    // Parsear x-now-route-matches que tiene formato "1=auth%2Flogin" (el capture group del rewrite)
    let restored = '';
    if (vercelPath) {
      const match = vercelPath.match(/1=([^&]+)/);
      if (match) {
        restored = '/api/' + decodeURIComponent(match[1]);
      }
    }

    if (restored) {
      req.url = restored;
    } else if (invokedPath && invokedPath !== '/api') {
      req.url = invokedPath;
    }
  }

  app(req, res);
};
