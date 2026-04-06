const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/secrets');

const JWT_SECRET = getJwtSecret();

// Middleware para verificar autenticación
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acceso requerido',
        authenticated: false
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado',
        authenticated: false
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        authenticated: false
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        authenticated: false
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      authenticated: false
    });
  }
};

// Middleware para verificar si el usuario es admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Autenticación requerida',
      authenticated: false
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de administrador',
      authenticated: true,
      authorized: false
    });
  }

  next();
};

// Middleware para verificar si el usuario tiene un rol específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        authenticated: false
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado. Permisos insuficientes',
        authenticated: true,
        authorized: false
      });
    }

    next();
  };
};

/** Ver detalle de usuario solo el propio o un admin */
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticación requerida',
      authenticated: false,
    });
  }
  if (req.user.role === 'admin') {
    return next();
  }
  if (parseInt(req.params.id, 10) === req.user.id) {
    return next();
  }
  return res.status(403).json({
    error: 'Acceso denegado',
    authenticated: true,
    authorized: false,
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole,
  requireSelfOrAdmin,
}; 