const Trazabilidad = require('../models/Trazabilidad');
const TrazabilidadLote = require('../models/TrazabilidadLote');

class TrazabilidadController {
  /**
   * ========================================================================
   * NUEVO: Obtener trazabilidad completa por lote de producción
   * GET /api/trazabilidad/lote/:loteProduccion
   * ========================================================================
   * 
   * Este es el endpoint principal para consultar la trazabilidad.
   * Recibe un lote de producción y devuelve toda la cadena de trazabilidad:
   * 
   * EXPENDIO → ENVASADO → PRODUCCIÓN → PESADO → RECEPCIÓN
   */
  static async getByLoteProduccion(req, res) {
    try {
      const { loteProduccion } = req.params;      
      // Validar parámetro
      if (!loteProduccion || loteProduccion.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'El lote de producción es requerido'
        });
      }

      // Obtener trazabilidad completa
      const resultado = await TrazabilidadLote.getByLoteProduccion(loteProduccion.trim());      
      res.json({
        success: true,
        data: resultado,
        message: `Trazabilidad completada para lote: ${loteProduccion}`
      });
      
    } catch (error) {      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }
  /**
   * Obtener trazabilidad completa de un registro
   * GET /api/trazabilidad/:tipo/:id
   */
  static async getTrace(req, res) {
    try {
      const { tipo, id } = req.params;      
      // Validar parámetros
      if (!tipo || !id) {
        return res.status(400).json({
          error: 'Parámetros requeridos: tipo y id'
        });
      }

      // Validar tipo de tabla
      const tiposValidos = ['expendio', 'envasado', 'produccion', 'pesado', 'controlpesado', 'recepcion', 'semielaborado'];
      if (!tiposValidos.includes(tipo.toLowerCase())) {
        return res.status(400).json({
          error: `Tipo de tabla no válido. Tipos permitidos: ${tiposValidos.join(', ')}`
        });
      }

      // Validar que el ID sea numérico
      const registroId = parseInt(id);
      if (isNaN(registroId)) {
        return res.status(400).json({
          error: 'El ID debe ser un número válido'
        });
      }

      // Obtener trazabilidad
      const resultado = await Trazabilidad.getCompleteTrace(registroId, tipo);      
      res.json({
        success: true,
        data: resultado,
        message: `Trazabilidad completada para ${tipo} ID: ${id}`
      });
      
    } catch (error) {      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Búsqueda de trazabilidad por lote
   * GET /api/trazabilidad/buscar/:lote
   */
  static async searchByLote(req, res) {
    try {
      const { lote } = req.params;
      
      if (!lote) {
        return res.status(400).json({
          error: 'Parámetro requerido: lote'
        });
      }      
      // Buscar en todas las tablas que contengan este lote
      const resultados = await TrazabilidadController.findRegistrosByLote(lote);
      
      res.json({
        success: true,
        data: resultados,
        message: `Búsqueda completada para lote: ${lote}`
      });
      
    } catch (error) {      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Verificar integridad de trazabilidad
   * GET /api/trazabilidad/verificar/:tipo/:id
   */
  static async verifyIntegrity(req, res) {
    try {
      const { tipo, id } = req.params;
      
      // Obtener trazabilidad completa
      const resultado = await Trazabilidad.getCompleteTrace(parseInt(id), tipo);
      
      // Analizar integridad
      const analisis = TrazabilidadController.analyzeIntegrity(resultado);
      
      res.json({
        success: true,
        data: {
          trazabilidad: resultado,
          integridad: analisis
        },
        message: 'Verificación de integridad completada'
      });
      
    } catch (error) {      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Buscar registros por lote en todas las tablas
   */
  static async findRegistrosByLote(lote) {
    const pool = require('../config/db');
    
    const resultados = {
      expendio: [],
      envasado: [],
      produccion: [],
      pesado: [],
      recepcion: [],
      semielaborado: []
    };

    try {
      // Buscar en Expendio
      const expendios = await pool.query('SELECT * FROM "Expendio" WHERE lote = $1', [lote]);
      resultados.expendio = expendios.rows;

      // Buscar en Envasado (loteProd y loteEnvasado)
      const envasados = await pool.query(
        'SELECT * FROM "Envasado" WHERE loteProd = $1 OR loteEnvasado = $1', 
        [lote]
      );
      resultados.envasado = envasados.rows;

      // Buscar en Producción
      const producciones = await pool.query('SELECT * FROM "Produccion" WHERE lote = $1', [lote]);
      resultados.produccion = producciones.rows;

      // Buscar en Control Pesado (loteMateriaPrima)
      const pesados = await pool.query('SELECT * FROM "ControlPesado" WHERE loteMateriaPrima = $1', [lote]);
      resultados.pesado = pesados.rows;

      // Buscar en Recepción
      const recepciones = await pool.query('SELECT * FROM "Recepcion" WHERE lote = $1', [lote]);
      resultados.recepcion = recepciones.rows;

      try {
        const semi = await pool.query(
          'SELECT * FROM "Semielaborado" WHERE lote = $1 OR lotemateriaprima = $1',
          [lote]
        );
        resultados.semielaborado = semi.rows;
      } catch (e) {
        resultados.semielaborado = [];
      }

      return resultados;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Analizar integridad de la trazabilidad
   */
  static analyzeIntegrity(resultado) {
    const analisis = {
      score: 0,
      maxScore: 100,
      problemas: [],
      recomendaciones: [],
      estado: 'incompleto'
    };

    // Verificar presencia de cada etapa (20 puntos cada una)
    const etapas = ['recepcion', 'pesado', 'produccion', 'envasado', 'expendio'];
    etapas.forEach(etapa => {
      if (resultado[etapa].length > 0) {
        analisis.score += 20;
      } else {
        analisis.problemas.push(`Falta etapa: ${etapa}`);
        analisis.recomendaciones.push(`Verificar registros de ${etapa}`);
      }
    });

    // Verificar consistencia de fechas
    if (resultado.produccion.length > 0 && resultado.envasado.length > 0) {
      // Lógica de verificación de fechas
      // ... (se puede expandir según necesidades)
    }

    // Determinar estado
    if (analisis.score >= 100) analisis.estado = 'completo';
    else if (analisis.score >= 80) analisis.estado = 'bueno';
    else if (analisis.score >= 60) analisis.estado = 'aceptable';
    else analisis.estado = 'incompleto';

    return analisis;
  }

  /**
   * Exportar trazabilidad a PDF
   * GET /api/trazabilidad/export/pdf/:tipo/:id
   */
  static async exportToPDF(req, res) {
    try {
      const { tipo, id } = req.params;
      
      // Obtener trazabilidad
      const resultado = await Trazabilidad.getCompleteTrace(parseInt(id), tipo);
      
      // Aquí se podría implementar generación de PDF
      // Por ahora retornamos los datos para implementar en frontend
      
      res.json({
        success: true,
        data: resultado,
        exportType: 'pdf',
        message: 'Datos preparados para exportación PDF'
      });
      
    } catch (error) {      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }
}

module.exports = TrazabilidadController;
