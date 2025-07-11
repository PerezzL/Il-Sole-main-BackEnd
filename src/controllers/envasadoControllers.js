const { Envasado } = require('../models');

// Obtener todos los envasados
exports.getAllEnvasados = async (req, res) => {
  try {
    const envasados = await Envasado.findAll();
    res.json(envasados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los envasados' });
  }
};

// Obtener un envasado por ID
exports.getEnvasadoById = async (req, res) => {
  const { id } = req.params;
  try {
    const envasado = await Envasado.findById(id);
    if (!envasado) {
      return res.status(404).json({ error: 'Envasado no encontrado' });
    }
    res.json(envasado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el envasado' });
  }
};

// Crear un nuevo envasado
exports.createEnvasado = async (req, res) => {
  const {
    loteProd,
    loteEnvasado,
    producto,
    cantEnvases,
    cantDescarte,
    observaciones
  } = req.body;
  
  try {
    const envasadoData = {
      loteProd,
      loteEnvasado,
      producto,
      cantEnvases,
      cantDescarte,
      observaciones
    };
    
    const envasado = await Envasado.create(envasadoData);
    res.status(201).json(envasado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el envasado' });
  }
};

// Actualizar un envasado existente
exports.updateEnvasado = async (req, res) => {
  const { id } = req.params;
  const {
    loteProd,
    loteEnvasado,
    producto,
    cantEnvases,
    cantDescarte,
    observaciones
  } = req.body;
  
  try {
    const envasadoData = {};
    if (loteProd) envasadoData.loteProd = loteProd;
    if (loteEnvasado) envasadoData.loteEnvasado = loteEnvasado;
    if (producto) envasadoData.producto = producto;
    if (cantEnvases) envasadoData.cantEnvases = cantEnvases;
    if (cantDescarte !== undefined) envasadoData.cantDescarte = cantDescarte;
    if (observaciones !== undefined) envasadoData.observaciones = observaciones;
    
    const envasado = await Envasado.update(id, envasadoData);
    if (!envasado) {
      return res.status(404).json({ error: 'Envasado no encontrado' });
    }
    res.json(envasado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el envasado' });
  }
};

// Eliminar un envasado
exports.deleteEnvasado = async (req, res) => {
  const { id } = req.params;
  try {
    const envasado = await Envasado.delete(id);
    if (!envasado) {
      return res.status(404).json({ error: 'Envasado no encontrado' });
    }
    res.json({ message: 'Envasado eliminado correctamente', envasado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el envasado' });
  }
};

// Buscar envasados por producto
exports.getEnvasadosByProducto = async (req, res) => {
  const { producto } = req.params;
  try {
    const envasados = await Envasado.findByProducto(producto);
    res.json(envasados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar envasados' });
  }
};

// Buscar envasados por lote de producción
exports.getEnvasadosByLoteProd = async (req, res) => {
  const { loteProd } = req.params;
  try {
    const envasados = await Envasado.findByLoteProd(loteProd);
    res.json(envasados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar envasados' });
  }
};

// Buscar envasados por lote de envasado
exports.getEnvasadosByLoteEnvasado = async (req, res) => {
  const { loteEnvasado } = req.params;
  try {
    const envasados = await Envasado.findByLoteEnvasado(loteEnvasado);
    res.json(envasados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar envasados' });
  }
};

// Buscar envasados por rango de envases
exports.getEnvasadosByCantEnvasesRange = async (req, res) => {
  const { cantMin, cantMax } = req.query;
  try {
    const envasados = await Envasado.findByCantEnvasesRange(cantMin, cantMax);
    res.json(envasados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar envasados' });
  }
};

// Buscar envasados por rango de descarte
exports.getEnvasadosByCantDescarteRange = async (req, res) => {
  const { descarteMin, descarteMax } = req.query;
  try {
    const envasados = await Envasado.findByCantDescarteRange(descarteMin, descarteMax);
    res.json(envasados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar envasados' });
  }
};

// Obtener estadísticas de envasado
exports.getEstadisticasEnvasado = async (req, res) => {
  try {
    const estadisticas = await Envasado.getEstadisticasEnvasado();
    res.json(estadisticas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Obtener envasados agrupados por lote
exports.getEnvasadosPorLote = async (req, res) => {
  try {
    const envasadosPorLote = await Envasado.getEnvasadosPorLote();
    res.json(envasadosPorLote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener envasados por lote' });
  }
};
