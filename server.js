// server.js
require("dotenv").config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

// Conexion a PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  pool.connect()
    .then(() => console.log("✅ Conectado a la base de datos"))
    .catch((err) => console.error("❌ Error al conectar la base de datos", err));

// Importar rutas
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const produccionRoutes = require('./src/routes/produccionRoutes');
const controlPesadoRoutes = require('./src/routes/controlPesadoRoutes');
const envasadoRoutes = require('./src/routes/envasadoRoutes');
const recepcionRoutes = require('./src/routes/recepcionRoutes');
const expendioRoutes = require('./src/routes/expendioRoutes');

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear JSON

// Rutas principales
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/production', produccionRoutes);
app.use('/api/control-pesado', controlPesadoRoutes);
app.use('/api/envasado', envasadoRoutes);
app.use('/api/recepcion', recepcionRoutes);
app.use('/api/expendio', expendioRoutes);

