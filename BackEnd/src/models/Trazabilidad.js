const pool = require('../config/db');
const TrazabilidadLote = require('./TrazabilidadLote');

class Trazabilidad {
  /**
   * Método principal para obtener trazabilidad completa
   * @param {number} registroId - ID del registro de origen
   * @param {string} tipoTabla - Tipo de tabla ('expendio', 'envasado', 'produccion', 'pesado', 'recepcion')
   * @returns {Object} Objeto con todos los registros relacionados
   */
  static async getCompleteTrace(registroId, tipoTabla) {
    try {
      const resultado = {
        recepcion: [],
        pesado: [],
        produccion: [],
        envasado: [],
        expendio: [],
        semielaborado: [],
        origen: {
          tipo: tipoTabla,
          id: registroId
        },
        resumen: {
          totalRegistros: 0,
          etapasEncontradas: 0,
          etapasTotales: 6,
          warnings: [],
          completitud: 'parcial'
        }
      };

      // Obtener todos los registros siguiendo la lógica del diagrama
      switch(tipoTabla.toLowerCase()) {
        case 'expendio':
          await this.traceFromExpendio(registroId, resultado);
          break;
        case 'envasado':
          await this.traceFromEnvasado(registroId, resultado);
          break;
        case 'produccion':
          await this.traceFromProduccion(registroId, resultado);
          break;
        case 'pesado':
        case 'controlpesado':
          await this.traceFromPesado(registroId, resultado);
          break;
        case 'recepcion':
          await this.traceFromRecepcion(registroId, resultado);
          break;
        case 'semielaborado':
          await this.traceFromSemielaborado(registroId, resultado);
          break;
        default:
          throw new Error(`Tipo de tabla no válido: ${tipoTabla}`);
      }

      this.calculateSummary(resultado);
      return resultado;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Trazabilidad desde Expendio - SIGUIENDO LA LÓGICA ESPECÍFICA
   */
  static async traceFromExpendio(expendioId, resultado) {
    const expendio = await pool.query('SELECT * FROM "Expendio" WHERE id = $1', [expendioId]);
    if (expendio.rows.length === 0) {
      throw new Error(`Expendio con ID ${expendioId} no encontrado`);
    }
    resultado.expendio = expendio.rows;

    const loteExpendio = expendio.rows[0].lote;
    const envasados = await pool.query('SELECT * FROM "Envasado" WHERE loteProd = $1', [loteExpendio]);
    resultado.envasado = envasados.rows;

    for (const envasado of envasados.rows) {
      if (envasado.fechaelaboracion) {
        const producciones = await pool.query(
          'SELECT * FROM "Produccion" WHERE fechaElaboracion = $1',
          [envasado.fechaelaboracion]
        );
        resultado.produccion.push(...producciones.rows);
      }
    }

    if (resultado.produccion.length > 0) {
      await this.continueTraceFromProduccion(resultado);
    }
  }

  /**
   * Trazabilidad desde Envasado - SIGUIENDO LA LÓGICA ESPECÍFICA
   */
  static async traceFromEnvasado(envasadoId, resultado) {
    const envasado = await pool.query('SELECT * FROM "Envasado" WHERE id = $1', [envasadoId]);
    if (envasado.rows.length === 0) {
      throw new Error(`Envasado con ID ${envasadoId} no encontrado`);
    }
    resultado.envasado = envasado.rows;

    const envasadoData = envasado.rows[0];
    const expendios = await pool.query('SELECT * FROM "Expendio" WHERE lote = $1', [envasadoData.loteprod]);
    resultado.expendio = expendios.rows;

    if (envasadoData.fechaelaboracion) {
      const producciones = await pool.query(
        'SELECT * FROM "Produccion" WHERE fechaElaboracion = $1',
        [envasadoData.fechaelaboracion]
      );
      resultado.produccion = producciones.rows;
    }

    const otrosEnvasados = await pool.query(
      'SELECT * FROM "Envasado" WHERE loteProd = $1 AND id != $2',
      [envasadoData.loteprod, envasadoId]
    );
    resultado.envasado.push(...otrosEnvasados.rows);

    if (resultado.produccion.length > 0) {
      await this.continueTraceFromProduccion(resultado);
    }
  }

  /**
   * Trazabilidad desde Producción - SIGUIENDO LA LÓGICA ESPECÍFICA
   */
  static async traceFromProduccion(produccionId, resultado) {
    const produccion = await pool.query('SELECT * FROM "Produccion" WHERE id = $1', [produccionId]);
    if (produccion.rows.length === 0) {
      throw new Error(`Producción con ID ${produccionId} no encontrado`);
    }
    resultado.produccion = produccion.rows;

    const produccionData = produccion.rows[0];
    let envasados;
    if (produccionData.fechaelaboracion) {
      envasados = await pool.query(
        'SELECT * FROM "Envasado" WHERE fechaElaboracion = $1',
        [produccionData.fechaelaboracion]
      );
      resultado.envasado = envasados.rows;
    } else {
      envasados = await pool.query('SELECT * FROM "Envasado" WHERE loteProd = $1', [produccionData.lote]);
      resultado.envasado = envasados.rows;
    }

    for (const envasado of envasados.rows) {
      if (envasado.loteprod) {
        const expendios = await pool.query('SELECT * FROM "Expendio" WHERE lote = $1', [envasado.loteprod]);
        resultado.expendio.push(...expendios.rows);
      }
    }

    if (produccionData.lotepesada) {
      const pesados = await pool.query('SELECT * FROM "ControlPesado" WHERE lote = $1', [produccionData.lotepesada]);
      resultado.pesado = pesados.rows;
    }

    if (produccionData.lotemateriaprima) {
      const recepciones = await pool.query('SELECT * FROM "Recepcion" WHERE lote = $1', [produccionData.lotemateriaprima]);
      resultado.recepcion.push(...recepciones.rows);
    }

    const otrasProducciones = await pool.query(
      'SELECT * FROM "Produccion" WHERE lote = $1 AND id != $2',
      [produccionData.lote, produccionId]
    );
    resultado.produccion.push(...otrasProducciones.rows);
  }

  /**
   * Trazabilidad desde Control Pesado - SIGUIENDO LA LÓGICA ESPECÍFICA
   */
  static async traceFromPesado(pesadoId, resultado) {
    const pesado = await pool.query('SELECT * FROM "ControlPesado" WHERE id = $1', [pesadoId]);
    if (pesado.rows.length === 0) {
      throw new Error(`Control Pesado con ID ${pesadoId} no encontrado`);
    }
    resultado.pesado = pesado.rows;

    const pesadoData = pesado.rows[0];
    const loteProduccion = this.fechaToLote(pesadoData.fecha);
    if (loteProduccion) {
      const producciones = await pool.query('SELECT * FROM "Produccion" WHERE lote = $1', [loteProduccion]);
      resultado.produccion = producciones.rows;
    }

    if (pesadoData.lotemateriaprima) {
      const recepciones = await pool.query('SELECT * FROM "Recepcion" WHERE lote = $1', [pesadoData.lotemateriaprima]);
      resultado.recepcion = recepciones.rows;
    }

    if (pesadoData.lotemateriaprima) {
      try {
        const semiP = await pool.query('SELECT * FROM "Semielaborado" WHERE lotemateriaprima = $1', [pesadoData.lotemateriaprima]);
        for (const s of semiP.rows) {
          if (!resultado.semielaborado.find(x => x.id === s.id)) resultado.semielaborado.push(s);
        }
      } catch (e) {
        /* ignore */
      }
    }

    const otrosPesados = await pool.query(
      'SELECT * FROM "ControlPesado" WHERE fecha = $1 AND id != $2',
      [pesadoData.fecha, pesadoId]
    );
    resultado.pesado.push(...otrosPesados.rows);

    if (resultado.produccion.length > 0) {
      await this.continueTraceFromProduccion(resultado);
    }
  }

  /**
   * Trazabilidad desde Recepción - SIGUIENDO LA LÓGICA ESPECÍFICA
   */
  static async traceFromRecepcion(recepcionId, resultado) {
    const recepcion = await pool.query('SELECT * FROM "Recepcion" WHERE id = $1', [recepcionId]);
    if (recepcion.rows.length === 0) {
      throw new Error(`Recepción con ID ${recepcionId} no encontrado`);
    }
    resultado.recepcion = recepcion.rows;

    const recepcionData = recepcion.rows[0];
    if (recepcionData.lote) {
      try {
        const semiR = await pool.query('SELECT * FROM "Semielaborado" WHERE lotemateriaprima = $1', [recepcionData.lote]);
        for (const s of semiR.rows) {
          if (!resultado.semielaborado.find(x => x.id === s.id)) resultado.semielaborado.push(s);
        }
      } catch (e) {
        /* ignore */
      }
    }

    const pesados = await pool.query('SELECT * FROM "ControlPesado" WHERE loteMateriaPrima = $1', [recepcionData.lote]);
    resultado.pesado = pesados.rows;

    for (const pesadoReg of resultado.pesado) {
      if (pesadoReg.fecha) {
        const loteProduccion = this.fechaToLote(pesadoReg.fecha);
        if (loteProduccion) {
          const prodsPorFecha = await pool.query('SELECT * FROM "Produccion" WHERE lote = $1', [loteProduccion]);
          for (const prod of prodsPorFecha.rows) {
            if (!resultado.produccion.find(p => p.id === prod.id)) {
              resultado.produccion.push(prod);
            }
          }
        }
      }
    }

    for (const prod of resultado.produccion) {
      if (prod.fechaelaboracion) {
        const envasados = await pool.query(
          'SELECT * FROM "Envasado" WHERE fechaElaboracion = $1',
          [prod.fechaelaboracion]
        );
        resultado.envasado.push(...envasados.rows);
      } else {
        const envasados = await pool.query('SELECT * FROM "Envasado" WHERE loteProd = $1', [prod.lote]);
        resultado.envasado.push(...envasados.rows);
      }
    }

    for (const envasado of resultado.envasado) {
      if (envasado.loteprod) {
        const expendios = await pool.query('SELECT * FROM "Expendio" WHERE lote = $1', [envasado.loteprod]);
        resultado.expendio.push(...expendios.rows);
      }
    }
  }

  /**
   * Trazabilidad desde Semielaborado (lote MP → recepción/pesado; lote/fecha → producción)
   */
  static async traceFromSemielaborado(semielaboradoId, resultado) {
    const row = await pool.query('SELECT * FROM "Semielaborado" WHERE id = $1', [semielaboradoId]);
    if (row.rows.length === 0) {
      throw new Error(`Semielaborado con ID ${semielaboradoId} no encontrado`);
    }
    resultado.semielaborado = row.rows;
    const d = row.rows[0];

    const lotesMpCandidatos = TrazabilidadLote.unirVariantesMP(
      [d.lotemateriaprima, d.lote].filter(Boolean)
    );

    if (lotesMpCandidatos.length > 0) {
      const rec = await pool.query('SELECT * FROM "Recepcion" WHERE lote = ANY($1)', [lotesMpCandidatos]);
      resultado.recepcion.push(...rec.rows);
      const pes = await pool.query(
        'SELECT * FROM "ControlPesado" WHERE lotemateriaprima = ANY($1)',
        [lotesMpCandidatos]
      );
      resultado.pesado.push(...pes.rows);

      const prodMp = await pool.query(
        'SELECT * FROM "Produccion" WHERE lotemateriaprima = ANY($1)',
        [lotesMpCandidatos]
      );
      for (const p of prodMp.rows) {
        if (!resultado.produccion.find(x => x.id === p.id)) resultado.produccion.push(p);
      }
    }

    if (d.lote) {
      const prod = await pool.query('SELECT * FROM "Produccion" WHERE lote = $1', [d.lote]);
      for (const p of prod.rows) {
        if (!resultado.produccion.find(x => x.id === p.id)) resultado.produccion.push(p);
      }
    }

    const loteFromFecha = this.fechaToLote(d.fecha);
    if (loteFromFecha) {
      const prodF = await pool.query('SELECT * FROM "Produccion" WHERE lote = $1', [loteFromFecha]);
      for (const p of prodF.rows) {
        if (!resultado.produccion.find(x => x.id === p.id)) resultado.produccion.push(p);
      }
    }

    if (resultado.produccion.length > 0) {
      await this.continueTraceFromProduccion(resultado);
    } else {
      for (const pesadoReg of resultado.pesado) {
        if (pesadoReg.fecha) {
          const loteProduccion = this.fechaToLote(pesadoReg.fecha);
          if (loteProduccion) {
            const producciones = await pool.query('SELECT * FROM "Produccion" WHERE lote = $1', [loteProduccion]);
            for (const p of producciones.rows) {
              if (!resultado.produccion.find(x => x.id === p.id)) resultado.produccion.push(p);
            }
          }
          try {
            const prodPorFecha = await pool.query(
              'SELECT * FROM "Produccion" WHERE fechaelaboracion = $1::date',
              [pesadoReg.fecha]
            );
            for (const p of prodPorFecha.rows) {
              if (!resultado.produccion.find(x => x.id === p.id)) resultado.produccion.push(p);
            }
          } catch (e) {
            /* ignore */
          }
        }
      }
      if (resultado.produccion.length > 0) {
        await this.continueTraceFromProduccion(resultado);
      }
    }
  }

  /**
   * Continuar trazabilidad desde Producción - SIGUIENDO LA LÓGICA ESPECÍFICA
   */
  static async continueTraceFromProduccion(resultado) {
    for (const produccion of resultado.produccion) {
      let envasados;
      if (produccion.fechaelaboracion) {
        envasados = await pool.query(
          'SELECT * FROM "Envasado" WHERE fechaElaboracion = $1',
          [produccion.fechaelaboracion]
        );
      } else {
        envasados = await pool.query('SELECT * FROM "Envasado" WHERE loteProd = $1', [produccion.lote]);
      }

      for (const envasado of envasados.rows) {
        if (!resultado.envasado.find(e => e.id === envasado.id)) {
          resultado.envasado.push(envasado);
        }
      }

      if (produccion.lotepesada) {
        const pesados = await pool.query('SELECT * FROM "ControlPesado" WHERE lote = $1', [produccion.lotepesada]);
        for (const pesado of pesados.rows) {
          if (!resultado.pesado.find(p => p.id === pesado.id)) {
            resultado.pesado.push(pesado);
          }
        }
      }
    }

    for (const envasado of resultado.envasado) {
      if (envasado.loteprod) {
        const expendios = await pool.query('SELECT * FROM "Expendio" WHERE lote = $1', [envasado.loteprod]);
        for (const expendio of expendios.rows) {
          if (!resultado.expendio.find(e => e.id === expendio.id)) {
            resultado.expendio.push(expendio);
          }
        }
      }
    }

    for (const pesado of resultado.pesado) {
      if (pesado.lotemateriaprima) {
        const recepciones = await pool.query('SELECT * FROM "Recepcion" WHERE lote = $1', [pesado.lotemateriaprima]);
        for (const recepcion of recepciones.rows) {
          if (!resultado.recepcion.find(r => r.id === recepcion.id)) {
            resultado.recepcion.push(recepcion);
          }
        }
      }
    }
  }

  /**
   * Calcular resumen de trazabilidad
   */
  static calculateSummary(resultado) {
    const etapasCore = ['recepcion', 'pesado', 'produccion', 'envasado', 'expendio'];
    let totalRegistros = (resultado.semielaborado || []).length;
    let etapasCoreConDatos = 0;

    etapasCore.forEach(etapa => {
      const count = resultado[etapa].length;
      totalRegistros += count;
      if (count > 0) etapasCoreConDatos++;
    });

    resultado.resumen.totalRegistros = totalRegistros;
    resultado.resumen.etapasTotales = 6;
    resultado.resumen.etapasEncontradas = etapasCoreConDatos + ((resultado.semielaborado || []).length > 0 ? 1 : 0);
    resultado.resumen.completitud = etapasCoreConDatos === 5 ? 'completa' :
      etapasCoreConDatos >= 3 ? 'parcial' : 'incompleta';

    if (resultado.recepcion.length === 0) {
      resultado.resumen.warnings.push('No se encontraron registros de Recepción');
    }
    if (resultado.pesado.length === 0) {
      resultado.resumen.warnings.push('No se encontraron registros de Control Pesado');
    }
    if (resultado.produccion.length === 0) {
      resultado.resumen.warnings.push('No se encontraron registros de Producción');
    }
  }

  /**
   * Convertir fecha a formato de lote YYYYMMDD
   */
  static fechaToLote(fecha) {
    if (!fecha) return null;
    
    // Si ya es un lote en formato YYYYMMDD, retornarlo
    if (/^\d{8}$/.test(fecha)) {
      return fecha;
    }
    
    // Detectar formato DD/MM/YYYY o DD-MM-YYYY y convertirlo
    let fechaNormalizada = fecha;
    
    // Si es formato DD/MM/YYYY o DD-MM-YYYY, convertirlo
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(fecha)) {
      const parts = fecha.split(/[\/\-]/);
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      // Validar que sea una fecha válida
      if (parseInt(month) >= 1 && parseInt(month) <= 12 &&
          parseInt(day) >= 1 && parseInt(day) <= 31 &&
          parseInt(year) >= 1900 && parseInt(year) <= 2100) {
        fechaNormalizada = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    const date = new Date(fechaNormalizada);

    if (isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (year < 1900 || year > 2100) {
      return null;
    }

    const lote = `${year}${month}${day}`;
    return lote;
  }

  /**
   * Convertir lote formato YYYYMMDD a fecha
   */
  static loteToFecha(lote) {
    if (!lote) return null;
    
    // Si ya es una fecha válida, retornarla
    if (lote.includes('-') && !isNaN(new Date(lote).getTime())) {
      return lote;
    }
    
    if (!/^\d{8}$/.test(lote)) {
      return null;
    }

    const year = parseInt(lote.substring(0, 4));
    const month = parseInt(lote.substring(4, 6));
    const day = parseInt(lote.substring(6, 8));

    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const fecha = new Date(year, month - 1, day);
    if (fecha.getFullYear() !== year || fecha.getMonth() !== month - 1 || fecha.getDate() !== day) {
      return null;
    }

    const fechaFormateada = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return fechaFormateada;
  }

  /**
   * Extraer lote de materia prima del campo materiaprima
   * Ejemplo: "Leche_L001" → "L001"
   */
  static extractLoteFromMateriaPrima(materiaPrima) {
    if (!materiaPrima) return null;
    
    // Buscar patrón _L### o similar
    const match = materiaPrima.match(/_([A-Z]\d+)$/);
    if (match) return match[1];
    
    // Si no encuentra patrón, buscar último token después de _
    const parts = materiaPrima.split('_');
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
    
    return null;
  }
}

module.exports = Trazabilidad;

