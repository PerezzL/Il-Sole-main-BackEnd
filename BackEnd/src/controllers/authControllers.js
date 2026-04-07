const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/secrets');

const JWT_SECRET = getJwtSecret();

// Iniciar sesión
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Información del usuario (sin contraseña)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    res.json({
      message: 'Inicio de sesión exitoso',
      user: userData,
      token: token
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Error de conexión a la base de datos',
        details: 'No se puede conectar al servidor de base de datos'
      });
    }
    
    if (error.message && error.message.includes('timeout')) {
      return res.status(503).json({ 
        error: 'Timeout de conexión a la base de datos',
        details: 'La conexión a la base de datos tardó demasiado'
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error en el servidor'
    });
  }
};

// Verificar si el usuario está autenticado
exports.verifyAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token no proporcionado',
        authenticated: false
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar el usuario en la base de datos para verificar que aún existe
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado',
        authenticated: false
      });
    }

    res.json({ 
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: 'Token válido'
    });
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

// Cerrar sesión (opcional, ya que JWT es stateless)
exports.logout = async (req, res) => {
  try {
    // En una implementación más avanzada, podrías agregar el token a una blacklist
    res.json({
      message: 'Sesión cerrada exitosamente',
      authenticated: false
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
}; 