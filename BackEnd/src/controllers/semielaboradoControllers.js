const Semielaborado = require('../models/Semielaborado');
const { notificarRegistroEditado } = require('../utils/notificaciones');

// Obtener todos los registros de semielaborados
exports.getAllSemielaborados = async (req, res) => {
  try {    const semielaborados = await Semielaborado.findAll();    res.json(semielaborados);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener los registros de semielaborados', details: err.message });
  }
};

// Nombres de semielaborados ya cargados, para el dropdown del formulario
exports.getSemielaboradosNombres = async (req, res) => {
  try {
    const nombres = await Semielaborado.findDistinctNames();
    res.json(nombres);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los nombres de semielaborados', details: err.message });
  }
};

// Obtener un registro de semielaborado por ID
exports.getSemielaboradoById = async (req, res) => {
  const { id } = req.params;
  try {
    const semielaborado = await Semielaborado.findById(id);
    if (!semielaborado) {
      return res.status(404).json({ error: 'Registro de semielaborado no encontrado' });
    }
    res.json(semielaborado);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener el registro de semielaborado' });
  }
};

// Crear un nuevo registro de semielaborado
exports.createSemielaborado = async (req, res) => {
  const { semielaborado, ingrediente, loteMateriaPrima, lote, peso, fecha, observaciones } = req.body;
  try {
    // Obtener información del usuario autenticado
    const responsable = req.user?.username || req.user?.name || 'Usuario desconocido';
    const usuario_id = req.user?.id;    
    const nuevoSemielaborado = await Semielaborado.create({
      semielaborado,
      ingrediente,
      loteMateriaPrima,
      lote,
      peso,
      fecha,
      observaciones,
      responsable,
      usuario_id
    });    
    res.status(201).json(nuevoSemielaborado);
  } catch (err) {    res.status(500).json({ error: 'Error al crear el registro de semielaborado', details: err.message });
  }
};

// Actualizar un registro de semielaborado
exports.updateSemielaborado = async (req, res) => {
  const { id } = req.params;
  const { semielaborado, ingrediente, loteMateriaPrima, lote, peso, fecha, observaciones } = req.body;
  try {
    const semielaboradoData = {};
    if (semielaborado) semielaboradoData.semielaborado = semielaborado;
    if (ingrediente) semielaboradoData.ingrediente = ingrediente;
    if (loteMateriaPrima !== undefined) semielaboradoData.loteMateriaPrima = loteMateriaPrima;
    if (lote !== undefined) semielaboradoData.lote = lote;
    if (peso) semielaboradoData.peso = peso;
    if (fecha) semielaboradoData.fecha = fecha;
    if (observaciones !== undefined) semielaboradoData.observaciones = observaciones;
    
    const semielaboradoActualizado = await Semielaborado.update(id, semielaboradoData);
    if (!semielaboradoActualizado) {
      return res.status(404).json({ error: 'Registro de semielaborado no encontrado' });
    }
    await notificarRegistroEditado({
      tabla: 'Semielaborado',
      codigo: semielaboradoActualizado.codigo,
      editor_id: req.user?.id,
      editor_nombre: req.user?.username,
    });
    res.json(semielaboradoActualizado);
  } catch (err) {    res.status(500).json({ error: 'Error al actualizar el registro de semielaborado' });
  }
};

// Eliminar un registro de semielaborado
exports.deleteSemielaborado = async (req, res) => {
  const { id } = req.params;
  try {
    const semielaborado = await Semielaborado.delete(id);
    if (!semielaborado) {
      return res.status(404).json({ error: 'Registro de semielaborado no encontrado' });
    }
    res.json({ message: 'Registro de semielaborado eliminado correctamente', semielaborado });
  } catch (err) {    res.status(500).json({ error: 'Error al eliminar el registro de semielaborado' });
  }
};
