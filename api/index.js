/**
 * Entrada serverless para Vercel: mismo dominio que el front, rutas /api/*
 */
const serverless = require('serverless-http');
const { app } = require('../BackEnd/server');

module.exports = serverless(app);
