const bcrypt = require('bcryptjs');
const User = require('../models/User');

function userSinPassword(row) {
  if (!row) return row;
  const { password: _p, ...rest } = row;
  return rest;
}

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users.map(userSinPassword));
  } catch (err) {
    res.status(500).json({
      error: 'Error al obtener usuarios',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      code: err.code,
    });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(userSinPassword(user));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    const userData = { username, password, email };
    if (role) userData.role = role;
    const user = await User.create(userData);
    res.status(201).json(userSinPassword(user));
  } catch (err) {
    res.status(500).json({
      error: 'Error al crear el usuario',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// Actualizar un usuario existente
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, email, role } = req.body;
  try {
    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    let passwordHashed = existing.password;
    if (password && String(password).length > 0) {
      passwordHashed = await bcrypt.hash(password, 10);
    }
    const user = await User.update(id, {
      username: username !== undefined ? username : existing.username,
      password: passwordHashed,
      email: email !== undefined ? email : existing.email,
      role: role !== undefined ? role : existing.role,
    });
    res.json(userSinPassword(user));
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar que el usuario no se esté eliminando a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ 
        error: 'No puedes eliminar tu propia cuenta' 
      });
    }

    const user = await User.delete(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente', user: userSinPassword(user) });
  } catch (err) {    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

// Buscar usuario por nombre de usuario
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Buscar usuario por email
exports.getUserByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Obtener usuarios por rol
exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const users = await User.findByRole(role);
    res.json(users);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Obtener todos los administradores
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.findAdmins();
    res.json(admins);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener los administradores' });
  }
};

// Obtener todos los usuarios normales
exports.getNormalUsers = async (req, res) => {
  try {
    const users = await User.findNormalUsers();
    res.json(users);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener los usuarios normales' });
  }
};

// Actualizar solo el rol de un usuario
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const user = await User.updateRole(id, role);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {    res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
  }
};
