const { Produccion } = require('../models');

// Obtener todas las producciones
exports.getAllProducciones = async (req, res) => {
  try {
    const producciones = await Produccion.findAll();
    res.json(producciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las producciones' });
  }
};

// Obtener una producción por ID
exports.getProduccionById = async (req, res) => {
  const { id } = req.params;
  try {
    const produccion = await Produccion.findById(id);
    if (!produccion) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    res.json(produccion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la producción' });
  }
};

// Crear una nueva producción
exports.createProduccion = async (req, res) => {
  const {
    producto,
    materiaPrima,
    lote,
    planProduccion,
    produccion,
    pesoDescarte,
    observaciones,
    comentarios
  } = req.body;
  
  try {
    const produccionData = {
      producto,
      materiaPrima,
      lote,
      planProduccion,
      produccion,
      pesoDescarte,
      observaciones,
      comentarios
    };
    
    const newProduccion = await Produccion.create(produccionData);
    res.status(201).json(newProduccion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la producción' });
  }
};

// Actualizar una producción existente
exports.updateProduccion = async (req, res) => {
  const { id } = req.params;
  const {
    producto,
    materiaPrima,
    lote,
    planProduccion,
    produccion,
    pesoDescarte,
    observaciones,
    comentarios
  } = req.body;
  
  try {
    const produccionData = {};
    if (producto) produccionData.producto = producto;
    if (materiaPrima) produccionData.materiaPrima = materiaPrima;
    if (lote) produccionData.lote = lote;
    if (planProduccion !== undefined) produccionData.planProduccion = planProduccion;
    if (produccion) produccionData.produccion = produccion;
    if (pesoDescarte !== undefined) produccionData.pesoDescarte = pesoDescarte;
    if (observaciones !== undefined) produccionData.observaciones = observaciones;
    if (comentarios !== undefined) produccionData.comentarios = comentarios;
    
    const updatedProduccion = await Produccion.update(id, produccionData);
    if (!updatedProduccion) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    res.json(updatedProduccion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la producción' });
  }
};

// Eliminar una producción
exports.deleteProduccion = async (req, res) => {
  const { id } = req.params;
  try {
    const produccion = await Produccion.delete(id);
    if (!produccion) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    res.json({ message: 'Producción eliminada correctamente', produccion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la producción' });
  }
};

// Buscar producciones por producto
exports.getProduccionesByProducto = async (req, res) => {
  const { producto } = req.params;
  try {
    const producciones = await Produccion.findByProducto(producto);
    res.json(producciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar producciones' });
  }
};

// Buscar producciones por materia prima
exports.getProduccionesByMateriaPrima = async (req, res) => {
  const { materiaPrima } = req.params;
  try {
    const producciones = await Produccion.findByMateriaPrima(materiaPrima);
    res.json(producciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar producciones' });
  }
};

// Buscar producciones por lote
exports.getProduccionesByLote = async (req, res) => {
  const { lote } = req.params;
  try {
    const producciones = await Produccion.findByLote(lote);
    res.json(producciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar producciones' });
  }
};

// Buscar producciones por plan de producción
exports.getProduccionesByPlanProduccion = async (req, res) => {
  const { planProduccion } = req.params;
  try {
    const producciones = await Produccion.findByPlanProduccion(planProduccion);
    res.json(producciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar producciones' });
  }
};

// Buscar producciones por rango de producción
exports.getProduccionesByProduccionRange = async (req, res) => {
  const { produccionMin, produccionMax } = req.query;
  try {
    const producciones = await Produccion.findByProduccionRange(produccionMin, produccionMax);
    res.json(producciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar producciones' });
  }
};

// Buscar producciones por rango de descarte
exports.getProduccionesByPesoDescarteRange = async (req, res) => {
  const { pesoMin, pesoMax } = req.query;
  try {
    const producciones = await Produccion.findByPesoDescarteRange(pesoMin, pesoMax);
    res.json(producciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar producciones' });
  }
};

// Obtener estadísticas de producción
exports.getEstadisticasProduccion = async (req, res) => {
  try {
    const estadisticas = await Produccion.getEstadisticasProduccion();
    res.json(estadisticas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
