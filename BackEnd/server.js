// server.js
require('dotenv').config();
// Vercel + Supabase: a veces IPv6 queda colgado; IPv4 suele conectar al pooler.
if (process.env.VERCEL) {
  try {
    require('dns').setDefaultResultOrder('ipv4first');
  } catch (_) {
    /* ignore */
  }
}
const { getJwtSecret, isProd } = require('./src/config/secrets');
getJwtSecret();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./src/config/db');

const app = express();
app.set('trust proxy', true);
const port = process.env.PORT || 5000;

// CORS: con NODE_ENV distinto de production se permiten localhost (Vite, CRA, etc.).
// Si corrés en local con NODE_ENV=production, agregá CORS_ALLOW_LOCALHOST=1 o incluí el origen en CORS_ORIGINS.
const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:8080',
];

function localhostCorsEnabled() {
  if (!isProd) return true;
  const v = String(process.env.CORS_ALLOW_LOCALHOST || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function getCorsAllowedOrigins() {
  const set = new Set();
  if (localhostCorsEnabled()) {
    defaultDevOrigins.forEach((o) => set.add(o));
  }
  if (process.env.VERCEL_URL) {
    const host = String(process.env.VERCEL_URL).replace(/^https?:\/\//i, '').split('/')[0];
    if (host) {
      set.add(`https://${host}`);
    }
  }
  (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((o) => set.add(o));
  return set;
}

const corsAllowedOrigins = getCorsAllowedOrigins();

if (isProd && corsAllowedOrigins.size === 0) {
  console.warn(
    '[seguridad] CORS_ORIGINS vacía: el front en internet no podrá llamar a la API. Ej: CORS_ORIGINS=https://tu-proyecto.vercel.app'
  );
}

const corsStatic = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Conexion a PostgreSQL

const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const produccionRoutes = require('./src/routes/produccionRoutes');
const controlPesadoRoutes = require('./src/routes/controlPesadoRoutes');
const envasadoRoutes = require('./src/routes/envasadoRoutes');
const recepcionRoutes = require('./src/routes/recepcionRoutes');
const expendioRoutes = require('./src/routes/expendioRoutes');
const materiaPrimaRoutes = require('./src/routes/materiaPrimaRoutes');
const productoMateriaPrimaRoutes = require('./src/routes/productoMateriaPrimaRoutes');
const authRoutes = require('./src/routes/authRoutes');
const trazabilidadRoutes = require('./src/routes/trazabilidadRoutes');
const semielaboradoRoutes = require('./src/routes/semielaboradoRoutes');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((req, res, next) => {
  cors({
    ...corsStatic,
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (corsAllowedOrigins.has(origin)) {
        return callback(null, true);
      }
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
        .split(',')[0]
        .trim();
      const proto = String(req.headers['x-forwarded-proto'] || 'https')
        .split(',')[0]
        .trim();
      if (process.env.VERCEL && host && origin === `${proto}://${host}`) {
        return callback(null, true);
      }
      console.warn(
        `CORS rechazado: ${origin} — agregá en CORS_ORIGINS o usá el mismo dominio que el Host (${host}).`
      );
      return callback(null, false);
    },
  })(req, res, next);
});
app.use(express.json({ limit: '10mb' })); // Para parsear JSON con límite aumentado
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Para parsear datos de formulario

app.get('/api/health', async (req, res) => {
  try {
    let dbOk = false;
    try {
      await pool.query('SELECT 1');
      dbOk = true;
    } catch {
      dbOk = false;
    }
    if (isProd) {
      return res.status(dbOk ? 200 : 503).json({ ok: dbOk });
    }
    return res.json({
      ok: true,
      database: dbOk ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
});

if (!isProd) {
  app.get('/api/db-test', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
      res.json({
        message: 'Conexión a base de datos exitosa',
        current_time: result.rows[0].current_time,
        db_version: result.rows[0].db_version,
      });
    } catch (err) {
      res.status(500).json({
        error: 'Error de conexión a la base de datos',
        details: err.message,
        code: err.code,
      });
    }
  });

  app.get('/api/test-tables', async (req, res) => {
    try {
      const productCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'Product'
        );
      `);
      const produccionCheck = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Produccion'
        ORDER BY ordinal_position;
      `);
      const produccionSample = await pool.query('SELECT * FROM "Produccion" LIMIT 1');
      let productCount = 0;
      let produccionCount = 0;
      if (productCheck.rows[0].exists) {
        const productResult = await pool.query('SELECT COUNT(*) as count FROM "Product"');
        productCount = parseInt(productResult.rows[0].count, 10);
      }
      const produccionCountResult = await pool.query('SELECT COUNT(*) as count FROM "Produccion"');
      produccionCount = parseInt(produccionCountResult.rows[0].count, 10);
      res.json({
        message: 'Verificación de tablas completada',
        tables: {
          Product: { exists: productCheck.rows[0].exists, count: productCount },
          Produccion: {
            exists: true,
            count: produccionCount,
            columns: produccionCheck.rows,
            sampleData: produccionSample.rows[0] || null,
          },
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Error al verificar tablas', details: err.message });
    }
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/production', produccionRoutes);
app.use('/api/control-pesado', controlPesadoRoutes);
app.use('/api/envasado', envasadoRoutes);
app.use('/api/recepcion', recepcionRoutes);
app.use('/api/expendio', expendioRoutes);
app.use('/api/materia-prima', materiaPrimaRoutes);
app.use('/api/producto-materia-prima', productoMateriaPrimaRoutes);
app.use('/api/trazabilidad', trazabilidadRoutes);
app.use('/api/semielaborado', semielaboradoRoutes);

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  const body = { error: 'Ruta no encontrada' };
  if (!isProd) {
    body.path = req.originalUrl;
    body.method = req.method;
  }
  res.status(404).json(body);
});

module.exports = { app };

if (require.main === module && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
  });
}
