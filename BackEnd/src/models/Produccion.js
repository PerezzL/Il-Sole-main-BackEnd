const pool = require('../config/db');

class Produccion {
  static async findAll() {
    try {      const result = await pool.query('SELECT * FROM "Produccion" ORDER BY created_at DESC');      
      // Log simple de confirmación
      if (result.rows.length > 0) {      } else {      }
      
      return result.rows;
    } catch (error) {      throw error;
    }
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM "Produccion" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(produccionData) {
    const { 
      producto, 
      materiaPrima, 
      lote, 
      lotePesada,
      loteMateriaPrima,
      planProduccion, 
      produccion, 
      pesoDescarte, 
      fechaElaboracion,
      observaciones, 
      comentarios,
      responsable,
      usuario_id
    } = produccionData;
    
    // Validar y limpiar datos
    const cleanData = {
      producto: producto || '',
      materiaPrima: materiaPrima || '',
      lote: lote || '',
      lotePesada: lotePesada || null,
      loteMateriaPrima: loteMateriaPrima || null,
      planProduccion: planProduccion || null,
      produccion: produccion || 0,
      pesoDescarte: pesoDescarte || 0,
      fechaElaboracion: fechaElaboracion || null,
      observaciones: observaciones || '',
      comentarios: comentarios || '',
      responsable: responsable || 'Usuario desconocido',
      usuario_id: usuario_id || null
    };    
    const result = await pool.query(
      'INSERT INTO "Produccion" (producto, materiaprima, lote, lotepesada, lotemateriaprima, planproduccion, produccion, pesodescarte, fechaelaboracion, observaciones, comentarios, responsable, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [cleanData.producto, cleanData.materiaPrima, cleanData.lote, cleanData.lotePesada, cleanData.loteMateriaPrima, cleanData.planProduccion, cleanData.produccion, cleanData.pesoDescarte, cleanData.fechaElaboracion, cleanData.observaciones, cleanData.comentarios, cleanData.responsable, cleanData.usuario_id]
    );
    return result.rows[0];
  }

  static async update(id, produccionData) {
    const { 
      producto, 
      materiaPrima, 
      lote, 
      lotePesada,
      loteMateriaPrima,
      planProduccion, 
      produccion, 
      pesoDescarte, 
      fechaElaboracion,
      observaciones, 
      comentarios 
    } = produccionData;
    
    const result = await pool.query(
      'UPDATE "Produccion" SET producto = $1, materiaprima = $2, lote = $3, lotepesada = $4, lotemateriaprima = $5, planproduccion = $6, produccion = $7, pesodescarte = $8, fechaelaboracion = $9, observaciones = $10, comentarios = $11 WHERE id = $12 RETURNING *',
      [producto, materiaPrima, lote, lotePesada, loteMateriaPrima, planProduccion, produccion, pesoDescarte, fechaElaboracion, observaciones, comentarios, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM "Produccion" WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByProducto(producto) {
    const result = await pool.query('SELECT * FROM "Produccion" WHERE producto ILIKE $1', [`%${producto}%`]);
    return result.rows;
  }

  static async findByMateriaPrima(materiaPrima) {
    const result = await pool.query('SELECT * FROM "Produccion" WHERE materiaprima ILIKE $1', [`%${materiaPrima}%`]);
    return result.rows;
  }

  static async findByLote(lote) {
    const result = await pool.query('SELECT * FROM "Produccion" WHERE lote = $1', [lote]);
    return result.rows;
  }

  static async findByPlanProduccion(planProduccion) {
    const result = await pool.query('SELECT * FROM "Produccion" WHERE planproduccion = $1', [planProduccion]);
    return result.rows;
  }

  static async findByProduccionRange(produccionMin, produccionMax) {
    const result = await pool.query(
      'SELECT * FROM "Produccion" WHERE produccion BETWEEN $1 AND $2 ORDER BY produccion DESC',
      [produccionMin, produccionMax]
    );
    return result.rows;
  }

  static async findByPesoDescarteRange(pesoMin, pesoMax) {
    const result = await pool.query(
      'SELECT * FROM "Produccion" WHERE pesoDescarte BETWEEN $1 AND $2 ORDER BY pesoDescarte DESC',
      [pesoMin, pesoMax]
    );
    return result.rows;
  }

  static async getEstadisticasProduccion() {
    const result = await pool.query(`
      SELECT 
        producto,
        COUNT(*) as total_producciones,
        AVG(produccion) as promedio_produccion,
        SUM(produccion) as total_produccion,
        AVG(pesoDescarte) as promedio_descarte,
        SUM(pesoDescarte) as total_descarte
      FROM "Produccion" 
      GROUP BY producto
      ORDER BY total_produccion DESC
    `);
    return result.rows;
  }
}

module.exports = Produccion; 