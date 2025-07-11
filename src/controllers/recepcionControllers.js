const { Recepcion } = require('../models');

// Obtener todas las recepciones
exports.getAllRecepciones = async (req, res) => {
  try {
    const recepciones = await Recepcion.findAll();
    res.json(recepciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las recepciones' });
  }
};

// Obtener una recepción por ID
exports.getRecepcionById = async (req, res) => {
  const { id } = req.params;
  try {
    const recepcion = await Recepcion.findById(id);
    if (!recepcion) {
      return res.status(404).json({ error: 'Recepción no encontrada' });
    }
    res.json(recepcion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la recepción' });
  }
};

// Crear una nueva recepción
exports.createRecepcion = async (req, res) => {
  const {
    materiaPrima,
    control1,
    control2,
    control3,
    marca,
    proveedor,
    cant,
    nroRemito,
    temp,
    fechaElaborado,
    fechaVTO,
    lote
  } = req.body;
  
  try {
    const recepcionData = {
      materiaPrima,
      control1,
      control2,
      control3,
      marca,
      proveedor,
      cant,
      nroRemito,
      temp,
      fechaElaborado,
      fechaVTO,
      lote
    };
    
    const recepcion = await Recepcion.create(recepcionData);
    res.status(201).json(recepcion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la recepción' });
  }
};

// Actualizar una recepción existente
exports.updateRecepcion = async (req, res) => {
  const { id } = req.params;
  const {
    materiaPrima,
    control1,
    control2,
    control3,
    marca,
    proveedor,
    cant,
    nroRemito,
    temp,
    fechaElaborado,
    fechaVTO,
    lote
  } = req.body;
  
  try {
    const recepcionData = {};
    if (materiaPrima) recepcionData.materiaPrima = materiaPrima;
    if (control1 !== undefined) recepcionData.control1 = control1;
    if (control2 !== undefined) recepcionData.control2 = control2;
    if (control3 !== undefined) recepcionData.control3 = control3;
    if (marca !== undefined) recepcionData.marca = marca;
    if (proveedor) recepcionData.proveedor = proveedor;
    if (cant) recepcionData.cant = cant;
    if (nroRemito) recepcionData.nroRemito = nroRemito;
    if (temp !== undefined) recepcionData.temp = temp;
    if (fechaElaborado) recepcionData.fechaElaborado = fechaElaborado;
    if (fechaVTO) recepcionData.fechaVTO = fechaVTO;
    if (lote) recepcionData.lote = lote;
    
    const recepcion = await Recepcion.update(id, recepcionData);
    if (!recepcion) {
      return res.status(404).json({ error: 'Recepción no encontrada' });
    }
    res.json(recepcion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la recepción' });
  }
};

// Eliminar una recepción
exports.deleteRecepcion = async (req, res) => {
  const { id } = req.params;
  try {
    const recepcion = await Recepcion.delete(id);
    if (!recepcion) {
      return res.status(404).json({ error: 'Recepción no encontrada' });
    }
    res.json({ message: 'Recepción eliminada correctamente', recepcion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la recepción' });
  }
};

// Buscar recepciones por materia prima
exports.getRecepcionesByMateriaPrima = async (req, res) => {
  const { materiaPrima } = req.params;
  try {
    const recepciones = await Recepcion.findByMateriaPrima(materiaPrima);
    res.json(recepciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar recepciones' });
  }
};

// Buscar recepciones por proveedor
exports.getRecepcionesByProveedor = async (req, res) => {
  const { proveedor } = req.params;
  try {
    const recepciones = await Recepcion.findByProveedor(proveedor);
    res.json(recepciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar recepciones' });
  }
};

// Buscar recepciones por lote
exports.getRecepcionesByLote = async (req, res) => {
  const { lote } = req.params;
  try {
    const recepciones = await Recepcion.findByLote(lote);
    res.json(recepciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar recepciones' });
  }
};

// Buscar recepciones por número de remito
exports.getRecepcionByNroRemito = async (req, res) => {
  const { nroRemito } = req.params;
  try {
    const recepcion = await Recepcion.findByNroRemito(nroRemito);
    if (!recepcion) {
      return res.status(404).json({ error: 'Recepción no encontrada' });
    }
    res.json(recepcion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar la recepción' });
  }
};

// Buscar recepciones por rango de fechas
exports.getRecepcionesByFechaRange = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  try {
    const recepciones = await Recepcion.findByFechaRange(fechaInicio, fechaFin);
    res.json(recepciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar recepciones' });
  }
};

// Buscar recepciones por fecha de vencimiento
exports.getRecepcionesByFechaVTO = async (req, res) => {
  const { fechaVTO } = req.params;
  try {
    const recepciones = await Recepcion.findByFechaVTO(fechaVTO);
    res.json(recepciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar recepciones' });
  }
}; 