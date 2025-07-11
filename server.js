// server.js
require("dotenv").config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const express = require("express");
const cors = require("cors");
const pool = require('./src/config/db');

const app = express();
const port = process.env.PORT || 5000;

// Conexion a PostgreSQL


console.log('Iniciando importación de rutas...');
const productRoutes = require('./src/routes/productRoutes');
console.log('productRoutes importado');
const userRoutes = require('./src/routes/userRoutes');
console.log('userRoutes importado');
const produccionRoutes = require('./src/routes/produccionRoutes');
console.log('produccionRoutes importado');
const controlPesadoRoutes = require('./src/routes/controlPesadoRoutes');
console.log('controlPesadoRoutes importado');
const envasadoRoutes = require('./src/routes/envasadoRoutes');
console.log('envasadoRoutes importado');
const recepcionRoutes = require('./src/routes/recepcionRoutes');
console.log('recepcionRoutes importado');
const expendioRoutes = require('./src/routes/expendioRoutes');
console.log('expendioRoutes importado');

console.log('Aplicando middlewares...');
app.use(cors());
app.use(express.json()); // Para parsear JSON

console.log('Registrando rutas principales...');
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/production', produccionRoutes);
app.use('/api/control-pesado', controlPesadoRoutes);
app.use('/api/envasado', envasadoRoutes);
app.use('/api/recepcion', recepcionRoutes);
app.use('/api/expendio', expendioRoutes);

console.log('Intentando iniciar el servidor en el puerto', port);
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});

