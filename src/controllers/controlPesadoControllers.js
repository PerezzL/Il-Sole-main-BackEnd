const ControlPesado = require('../models/ControlPesado');

// Obtener todos los registros de pesado
exports.getAllPesados = async (req, res) => {
  try {    const pesados = await ControlPesado.findAll();    res.json(pesados);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener los registros de pesado', details: err.message });
  }
};

// Obtener un registro de pesado por ID
exports.getPesadoById = async (req, res) => {
  const { id } = req.params;
  try {
    const pesado = await ControlPesado.findById(id);
    if (!pesado) {
      return res.status(404).json({ error: 'Registro de pesado no encontrado' });
    }
    res.json(pesado);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener el registro de pesado' });
  }
};

// Crear un nuevo registro de pesado
exports.createPesado = async (req, res) => {
  const { producto, materiaPrima, loteMateriaPrima, peso, fecha, observaciones } = req.body;
  try {
    // Obtener información del usuario autenticado
    const responsable = req.user?.username || req.user?.name || 'Usuario desconocido';
    const usuario_id = req.user?.id;    
    const pesado = await ControlPesado.create({
      producto,
      materiaPrima,
      loteMateriaPrima,
      peso,
      fecha,
      observaciones,
      responsable,
      usuario_id
    });    
    res.status(201).json(pesado);
  } catch (err) {    res.status(500).json({ error: 'Error al crear el registro de pesado', details: err.message });
  }
};

// Actualizar un registro de pesado
exports.updatePesado = async (req, res) => {
  const { id } = req.params;
  const { producto, materiaPrima, loteMateriaPrima, peso, fecha, observaciones } = req.body;
  try {
    const pesadoData = {};
    if (producto) pesadoData.producto = producto;
    if (materiaPrima) pesadoData.materiaPrima = materiaPrima;
    if (loteMateriaPrima !== undefined) pesadoData.loteMateriaPrima = loteMateriaPrima;
    if (peso) pesadoData.peso = peso;
    if (fecha) pesadoData.fecha = fecha;
    if (observaciones !== undefined) pesadoData.observaciones = observaciones;
    
    const pesado = await ControlPesado.update(id, pesadoData);
    if (!pesado) {
      return res.status(404).json({ error: 'Registro de pesado no encontrado' });
    }
    res.json(pesado);
  } catch (err) {    res.status(500).json({ error: 'Error al actualizar el registro de pesado' });
  }
};

// Eliminar un registro de pesado
exports.deletePesado = async (req, res) => {
  const { id } = req.params;
  try {
    const pesado = await ControlPesado.delete(id);
    if (!pesado) {
      return res.status(404).json({ error: 'Registro de pesado no encontrado' });
    }
    res.json({ message: 'Registro de pesado eliminado correctamente', pesado });
  } catch (err) {    res.status(500).json({ error: 'Error al eliminar el registro de pesado' });
  }
};
