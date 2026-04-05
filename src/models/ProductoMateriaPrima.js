const pool = require('../config/db');
const Product = require('./Product');
const MateriaPrima = require('./MateriaPrima');

class ProductoMateriaPrima {
  // Obtener todas las relaciones con información completa
  static async findAll() {
    const query = `
      SELECT 
        pm.id,
        p.id as producto_id,
        p.name as producto_nombre,
        mp.id as materia_prima_id,
        mp.nombre as materia_prima_nombre,
        pm.activo,
        pm.created_at,
        pm.updated_at
      FROM "ProductoMateriaPrima" pm
      JOIN "Product" p ON pm.producto_id = p.id
      JOIN "MateriaPrima" mp ON pm.materia_prima_id = mp.id
      WHERE pm.activo = true
      ORDER BY p.name, mp.nombre
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener materias primas de un producto específico
  static async findByProductoId(productoId) {
    const query = `
      SELECT 
        pm.id,
        mp.id as materia_prima_id,
        mp.nombre as materia_prima_nombre,
        pm.activo
      FROM "ProductoMateriaPrima" pm
      JOIN "MateriaPrima" mp ON pm.materia_prima_id = mp.id
      WHERE pm.producto_id = $1 AND pm.activo = true
      ORDER BY mp.nombre
    `;
    const result = await pool.query(query, [productoId]);
    return result.rows;
  }

  // Obtener productos que usan una materia prima específica
  static async findByMateriaPrimaId(materiaPrimaId) {
    const query = `
      SELECT 
        pm.id,
        p.id as producto_id,
        p.name as producto_nombre,
        pm.activo
      FROM "ProductoMateriaPrima" pm
      JOIN "Product" p ON pm.producto_id = p.id
      WHERE pm.materia_prima_id = $1 AND pm.activo = true
      ORDER BY p.name
    `;
    const result = await pool.query(query, [materiaPrimaId]);
    return result.rows;
  }

  // Crear relación con auto-creación de productos y materias primas
  static async createWithAutoCreation(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar que los nombres no estén vacíos
      if (!data.producto_nombre || !data.producto_nombre.trim()) {
        throw new Error('El nombre del producto no puede estar vacío');
      }
      if (!data.materia_prima_nombre || !data.materia_prima_nombre.trim()) {
        throw new Error('El nombre de la materia prima no puede estar vacío');
      }

      // Buscar o crear el producto
      let producto = await Product.findByName(data.producto_nombre.trim());
      if (producto.length === 0) {
        // Crear el producto si no existe
        producto = await Product.create({
          name: data.producto_nombre.trim()
        });
      } else {
        producto = producto[0];
      }

      // Buscar o crear la materia prima
      let materiaPrima = await MateriaPrima.findByNombre(data.materia_prima_nombre.trim());
      if (materiaPrima.length === 0) {
        // Crear la materia prima si no existe
        materiaPrima = await MateriaPrima.create({
          nombre: data.materia_prima_nombre.trim()
        });
      } else {
        materiaPrima = materiaPrima[0];
      }

      // Crear la relación
      const result = await client.query(
        `INSERT INTO "ProductoMateriaPrima" 
         (producto_id, materia_prima_id) 
         VALUES ($1, $2) 
         ON CONFLICT (producto_id, materia_prima_id) 
         DO UPDATE SET 
           activo = true,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [producto.id, materiaPrima.id]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Crear múltiples relaciones para un producto
  static async createMultipleForProduct(productoData, materiasPrimas) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar que el nombre del producto no esté vacío
      if (!productoData.nombre || !productoData.nombre.trim()) {
        throw new Error('El nombre del producto no puede estar vacío');
      }

      // Buscar o crear el producto
      let producto = await Product.findByName(productoData.nombre.trim());
      if (producto.length === 0) {
        producto = await Product.create({
          name: productoData.nombre.trim()
        });
      } else {
        producto = producto[0];
      }

      const results = [];

      // Procesar cada materia prima
      for (const materiaPrimaData of materiasPrimas) {
        // Verificar que el nombre no esté vacío
        if (!materiaPrimaData.nombre || !materiaPrimaData.nombre.trim()) {
          continue; // Saltar materias primas vacías
        }
        
        // Buscar o crear la materia prima
        let materiaPrima = await MateriaPrima.findByNombre(materiaPrimaData.nombre.trim());
        if (materiaPrima.length === 0) {
          materiaPrima = await MateriaPrima.create({
            nombre: materiaPrimaData.nombre.trim()
          });
        } else {
          materiaPrima = materiaPrima[0];
        }

        // Crear la relación
        const result = await client.query(
          `INSERT INTO "ProductoMateriaPrima" 
           (producto_id, materia_prima_id) 
           VALUES ($1, $2) 
           ON CONFLICT (producto_id, materia_prima_id) 
           DO UPDATE SET 
             activo = true,
             updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [producto.id, materiaPrima.id]
        );

        results.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar relación
  static async update(id, data) {
    const result = await pool.query(
      `UPDATE "ProductoMateriaPrima" 
       SET activo = $1 
       WHERE id = $2 RETURNING *`,
      [data.activo, id]
    );
    return result.rows[0];
  }

  // Eliminar relación (soft delete)
  static async delete(id) {
    const result = await pool.query(
      'UPDATE "ProductoMateriaPrima" SET activo = false WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Obtener receta completa de un producto
  static async getReceta(productoId) {
    const query = `
      SELECT 
        p.id as producto_id,
        p.name as producto_nombre,
        json_agg(
          json_build_object(
            'materia_prima_id', mp.id,
            'materia_prima_nombre', mp.nombre
          )
        ) as materias_primas
      FROM "Product" p
      LEFT JOIN "ProductoMateriaPrima" pm ON p.id = pm.producto_id AND pm.activo = true
      LEFT JOIN "MateriaPrima" mp ON pm.materia_prima_id = mp.id
      WHERE p.id = $1
      GROUP BY p.id, p.name
    `;
    const result = await pool.query(query, [productoId]);
    return result.rows[0];
  }

  // Obtener todos los productos con sus materias primas
  static async getAllProductosConMateriasPrimas() {
    const query = `
      SELECT 
        p.id as producto_id,
        p.name as producto_nombre,
        json_agg(
          json_build_object(
            'materia_prima_id', mp.id,
            'materia_prima_nombre', mp.nombre
          )
        ) FILTER (WHERE mp.id IS NOT NULL) as materias_primas
      FROM "Product" p
      LEFT JOIN "ProductoMateriaPrima" pm ON p.id = pm.producto_id AND pm.activo = true
      LEFT JOIN "MateriaPrima" mp ON pm.materia_prima_id = mp.id
      GROUP BY p.id, p.name
      ORDER BY p.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Actualizar producto completo (nombre y materias primas)
  static async updateProductoCompleto(productoId, productoNombre, materiasPrimas) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Actualizar el producto
      await client.query(
        `UPDATE "Product" 
         SET name = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [productoNombre, productoId]
      );

      // Desactivar todas las relaciones existentes
      await client.query(
        `UPDATE "ProductoMateriaPrima" 
         SET activo = false, updated_at = CURRENT_TIMESTAMP
         WHERE producto_id = $1`,
        [productoId]
      );

             // Crear nuevas relaciones para las materias primas
       for (const materiaPrimaData of materiasPrimas) {
         // Verificar que el nombre no esté vacío
         if (!materiaPrimaData.materia_prima_nombre || !materiaPrimaData.materia_prima_nombre.trim()) {
           continue; // Saltar materias primas vacías
         }
         
         // Buscar o crear la materia prima
         let materiaPrima = await MateriaPrima.findByNombre(materiaPrimaData.materia_prima_nombre);
         if (materiaPrima.length === 0) {
           materiaPrima = await MateriaPrima.create({
             nombre: materiaPrimaData.materia_prima_nombre.trim()
           });
         } else {
           materiaPrima = materiaPrima[0];
         }

        // Crear o reactivar la relación
        await client.query(
          `INSERT INTO "ProductoMateriaPrima" 
           (producto_id, materia_prima_id, activo) 
           VALUES ($1, $2, true)
           ON CONFLICT (producto_id, materia_prima_id) 
           DO UPDATE SET 
             activo = true,
             updated_at = CURRENT_TIMESTAMP`,
          [productoId, materiaPrima.id]
        );
      }

      await client.query('COMMIT');

      // Retornar el producto actualizado
      return await this.getReceta(productoId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Agregar materia prima a un producto existente
  static async agregarMateriaPrimaAProducto(productoId, materiaPrimaNombre) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar que el nombre no esté vacío
      if (!materiaPrimaNombre || !materiaPrimaNombre.trim()) {
        throw new Error('El nombre de la materia prima no puede estar vacío');
      }

      // Buscar o crear la materia prima
      let materiaPrima = await MateriaPrima.findByNombre(materiaPrimaNombre.trim());
      if (materiaPrima.length === 0) {
        materiaPrima = await MateriaPrima.create({
          nombre: materiaPrimaNombre.trim()
        });
      } else {
        materiaPrima = materiaPrima[0];
      }

      // Crear la relación
      const result = await client.query(
        `INSERT INTO "ProductoMateriaPrima" 
         (producto_id, materia_prima_id, activo) 
         VALUES ($1, $2, true)
         ON CONFLICT (producto_id, materia_prima_id) 
         DO UPDATE SET 
           activo = true,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [productoId, materiaPrima.id]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Eliminar materia prima de un producto
  static async eliminarMateriaPrimaDeProducto(productoId, materiaPrimaId) {
    const result = await pool.query(
      `UPDATE "ProductoMateriaPrima" 
       SET activo = false, updated_at = CURRENT_TIMESTAMP
       WHERE producto_id = $1 AND materia_prima_id = $2
       RETURNING *`,
      [productoId, materiaPrimaId]
    );
    return result.rows[0];
  }

  // Eliminar producto completo (producto y todas sus relaciones)
  static async deleteProductoCompleto(productoId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener todas las materias primas asociadas al producto antes de eliminar
      const materiasPrimasResult = await client.query(
        `SELECT DISTINCT mp.id, mp.nombre
         FROM "MateriaPrima" mp
         INNER JOIN "ProductoMateriaPrima" pmp ON mp.id = pmp.materia_prima_id
         WHERE pmp.producto_id = $1 AND pmp.activo = true`,
        [productoId]
      );

      const materiasPrimas = materiasPrimasResult.rows;

      // Eliminar todas las relaciones del producto (hard delete)
      await client.query(
        `DELETE FROM "ProductoMateriaPrima" 
         WHERE producto_id = $1`,
        [productoId]
      );

      // Eliminar el producto
      const result = await client.query(
        `DELETE FROM "Product" WHERE id = $1 RETURNING *`,
        [productoId]
      );

      // Verificar cada materia prima y eliminarla si no tiene más relaciones
      for (const materiaPrima of materiasPrimas) {
        const relacionesRestantes = await client.query(
          `SELECT COUNT(*) as count
           FROM "ProductoMateriaPrima"
           WHERE materia_prima_id = $1 AND activo = true`,
          [materiaPrima.id]
        );

        // Si no hay más relaciones activas, eliminar la materia prima
        if (parseInt(relacionesRestantes.rows[0].count) === 0) {
          await client.query(
            `DELETE FROM "MateriaPrima" WHERE id = $1`,
            [materiaPrima.id]
          );
        }
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = ProductoMateriaPrima; 