/**
 * Vercel: /api/* → esta función. serverless-http envuelve Express para el runtime serverless.
 */
console.log('[api/index] Cargando módulo...');
const t0 = Date.now();

const path = require('path');
console.log(`[api/index] path OK (+${Date.now() - t0}ms)`);

const serverless = require(path.join(__dirname, '..', 'BackEnd', 'node_modules', 'serverless-http'));
console.log(`[api/index] serverless-http OK (+${Date.now() - t0}ms)`);

const { app } = require('../BackEnd/server');
console.log(`[api/index] server.js OK (+${Date.now() - t0}ms)`);

const handler = serverless(app);
console.log(`[api/index] handler listo (+${Date.now() - t0}ms)`);

module.exports = async (req, res) => {
  console.log(`[api/index] Invocación: ${req.method} ${req.url}`);
  return handler(req, res);
};
