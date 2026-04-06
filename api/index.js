/**
 * Vercel: todas las rutas /api/* llegan acá; Express recibe la URL original.
 * @see https://vercel.com/kb/guide/using-express-with-vercel
 */
const { app } = require('../BackEnd/server');

module.exports = app;
