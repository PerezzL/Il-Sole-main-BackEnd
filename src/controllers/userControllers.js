const { User } = require('../models');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
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
    res.json(user);
  } catch (err) {
    console.error(err);
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
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Actualizar un usuario existente
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, email, role } = req.body;
  try {
    const userData = {};
    if (username) userData.username = username;
    if (password) userData.password = password;
    if (email) userData.email = email;
    if (role) userData.role = role;
    
    const user = await User.update(id, userData);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.delete(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el usuario' });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Obtener usuarios por rol
exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const users = await User.findByRole(role);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Obtener todos los administradores
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.findAdmins();
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los administradores' });
  }
};

// Obtener todos los usuarios normales
exports.getNormalUsers = async (req, res) => {
  try {
    const users = await User.findNormalUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios normales' });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
  }
};
