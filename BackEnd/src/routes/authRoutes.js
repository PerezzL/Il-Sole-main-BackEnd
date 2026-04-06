const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authControllers');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { error: 'Demasiados intentos de inicio de sesión. Probá más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Vercel/proxy: sin esto express-rate-limit puede tirar 500 al validar X-Forwarded-For / trust proxy
  validate: { xForwardedForHeader: false, trustProxy: false },
});

router.post('/login', loginLimiter, authController.login);

// Ruta para verificar autenticación
router.get('/verify', authController.verifyAuth);

// Ruta para cerrar sesión
router.post('/logout', authController.logout);

module.exports = router; 