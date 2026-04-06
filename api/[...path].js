/**
 * Vercel serverless catch-all for /api/*
 */
const serverless = require('serverless-http');
const { app } = require('../BackEnd/server');

module.exports = serverless(app);