const User = require('../models/User');

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
  const { username, password, email, role = 'user' } = req.body;
  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Validar que el rol sea válido
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin"' });
    }

    const newUser = await User.create({ username, password, email, role });
    res.status(201).json(newUser);
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
    // Validar que el rol sea válido si se proporciona
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin"' });
    }

    const updatedUser = await User.update(id, { username, password, email, role });
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.delete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente', user: deletedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

// Buscar usuarios por nombre de usuario
exports.searchUsersByUsername = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar el usuario' });
  }
};

// Buscar usuarios por email
exports.searchUsersByEmail = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar el usuario' });
  }
};

// Obtener todos los administradores
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAdmins();
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los administradores' });
  }
};

// Obtener todos los usuarios normales
exports.getAllNormalUsers = async (req, res) => {
  try {
    const users = await User.findNormalUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios normales' });
  }
};

// Buscar usuarios por rol
exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;
  try {
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin"' });
    }
    
    const users = await User.findByRole(role);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios por rol' });
  }
};

// Actualizar rol de usuario
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin"' });
    }

    const updatedUser = await User.updateRole(id, role);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
  }
}; 