/**
 * Genera el codigo legible de un registro: PREFIJO-AAAA-MM-DD-NN
 * NN es correlativo por dia y por tabla, calculado contra CURRENT_DATE de la DB
 * (evita desfasajes de huso horario entre el server y la base).
 */
const pool = require('../config/db');

function pad2(n) {
  return String(n).padStart(2, '0');
}

async function nextCodigo(tableName, prefix) {
  const { rows } = await pool.query(
    `SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS today,
            COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS count
     FROM "${tableName}"`
  );
  const { today, count } = rows[0];
  return `${prefix}-${today}-${pad2(Number(count) + 1)}`;
}

/**
 * Ejecuta insertFn(codigo) reintentando con el siguiente numero si el
 * codigo generado choca con uno ya insertado (carrera entre dos altas
 * casi simultaneas). insertFn debe hacer el INSERT y devolver la fila creada.
 */
async function createWithCodigo(tableName, prefix, insertFn) {
  const MAX_ATTEMPTS = 5;
  let lastErr;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const codigo = await nextCodigo(tableName, prefix);
    try {
      return await insertFn(codigo);
    } catch (err) {
      lastErr = err;
      if (err.code === '23505') continue; // violacion de unicidad en codigo: reintentar
      throw err;
    }
  }
  throw lastErr;
}

module.exports = { createWithCodigo };
