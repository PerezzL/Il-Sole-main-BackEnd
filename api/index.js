/**
 * Vercel: /api/* → esta función. serverless-http evita 500 por formato de request en runtime serverless.
 */
const path = require('path');
const serverless = require(path.join(__dirname, '..', 'BackEnd', 'node_modules', 'serverless-http'));
const { app } = require('../BackEnd/server');

module.exports = serverless(app);
