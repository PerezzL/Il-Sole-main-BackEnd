/**
 * ============================================================================
 * MODELO DE TRAZABILIDAD BIDIRECCIONAL
 * ============================================================================
 * 
 * NUEVA LÓGICA: Busca en TODAS las direcciones desde cualquier punto de entrada.
 * 
 * 1. Primero busca el lote en TODAS las tablas
 * 2. Luego expande la búsqueda usando los datos encontrados
 * 3. Conecta los registros usando múltiples criterios
 */

const pool = require('../config/db');

class TrazabilidadLote {

  /**
   * Variantes de un mismo lote de MP (ej. 16012024V ↔ 16012024) para cruzar tablas.
   */
  static variantesLoteMP(lote) {
    if (lote == null || lote === '') return [];
    const t = String(lote).trim();
    if (!t) return [];
    const out = new Set([t]);
    const sinSufijo = t.replace(/[A-Za-z]+$/, '');
    if (sinSufijo && sinSufijo !== t) out.add(sinSufijo);
    return [...out];
  }

  static unirVariantesMP(lotes) {
    const s = new Set();
    for (const l of lotes) {
      for (const v of this.variantesLoteMP(l)) s.add(v);
    }
    return [...s];
  }

  static async getByLoteProduccion(loteProduccion) {
    const resultado = {
      loteConsultado: loteProduccion,
      expendio: [],
      envasado: [],
      produccion: [],
      pesado: [],
      recepcion: [],
      semielaborado: [],
      flujo: [],
      resumen: {
        totalRegistros: 0,
        etapasEncontradas: 0,
        etapasTotales: 6,
        completitud: 'incompleta',
        warnings: []
      }
    };

    try {
      const fechaFromLote = this.loteToFecha(loteProduccion);
      const lotesConsulta = this.unirVariantesMP([loteProduccion]);

      // Sets para evitar duplicados
      const idsExpendio = new Set();
      const idsEnvasado = new Set();
      const idsProduccion = new Set();
      const idsPesado = new Set();
      const idsRecepcion = new Set();
      const idsSemielaborado = new Set();

      // Helpers para agregar sin duplicar
      const addExpendio = (rows) => rows.forEach(r => { if (!idsExpendio.has(r.id)) { idsExpendio.add(r.id); resultado.expendio.push(r); }});
      const addEnvasado = (rows) => rows.forEach(r => { if (!idsEnvasado.has(r.id)) { idsEnvasado.add(r.id); resultado.envasado.push(r); }});
      const addProduccion = (rows) => rows.forEach(r => { if (!idsProduccion.has(r.id)) { idsProduccion.add(r.id); resultado.produccion.push(r); }});
      const addPesado = (rows) => rows.forEach(r => { if (!idsPesado.has(r.id)) { idsPesado.add(r.id); resultado.pesado.push(r); }});
      const addRecepcion = (rows) => rows.forEach(r => { if (!idsRecepcion.has(r.id)) { idsRecepcion.add(r.id); resultado.recepcion.push(r); }});
      const addSemielaborado = (rows) => rows.forEach(r => { if (!idsSemielaborado.has(r.id)) { idsSemielaborado.add(r.id); resultado.semielaborado.push(r); }});

      // ================================================================
      // FASE 1: BÚSQUEDA INICIAL EN TODAS LAS TABLAS
      // ================================================================
      const exp1 = await pool.query('SELECT * FROM "Expendio" WHERE lote = ANY($1)', [lotesConsulta]);
      addExpendio(exp1.rows);

      const env1 = await pool.query(
        'SELECT * FROM "Envasado" WHERE loteprod = ANY($1) OR loteenvasado = ANY($1)',
        [lotesConsulta]
      );
      addEnvasado(env1.rows);

      const prod1 = await pool.query('SELECT * FROM "Produccion" WHERE lote = ANY($1)', [lotesConsulta]);
      addProduccion(prod1.rows);

      if (fechaFromLote) {
        try {
          const prod2 = await pool.query('SELECT * FROM "Produccion" WHERE fechaelaboracion::text LIKE $1', [`${fechaFromLote}%`]);
          addProduccion(prod2.rows);
        } catch (e) {
          try {
            const prod2b = await pool.query('SELECT * FROM "Produccion" WHERE lote = $1', [fechaFromLote.replace(/-/g, '')]);
            addProduccion(prod2b.rows);
          } catch (e2) {
            /* ignore */
          }
        }
      }

      // Buscar en PESADO por fecha (si el lote es formato fecha)
      if (fechaFromLote) {
        try {
          const pes1 = await pool.query('SELECT * FROM "ControlPesado" WHERE fecha::text LIKE $1', [`${fechaFromLote}%`]);
          addPesado(pes1.rows);
        } catch (e) {
          /* ignore */
        }
      }

      try {
        const pes2 = await pool.query(
          'SELECT * FROM "ControlPesado" WHERE lotemateriaprima = ANY($1)',
          [lotesConsulta]
        );
        addPesado(pes2.rows);
      } catch (e) {
        /* ignore */
      }

      const rec1 = await pool.query('SELECT * FROM "Recepcion" WHERE lote = ANY($1)', [lotesConsulta]);
      addRecepcion(rec1.rows);

      try {
        const semi1 = await pool.query(
          'SELECT * FROM "Semielaborado" WHERE lote = ANY($1) OR lotemateriaprima = ANY($1)',
          [lotesConsulta]
        );
        addSemielaborado(semi1.rows);
      } catch (e) {
        /* ignore */
      }

      if (fechaFromLote) {
        try {
          const semi2 = await pool.query(
            'SELECT * FROM "Semielaborado" WHERE fecha::text LIKE $1',
            [`${fechaFromLote}%`]
          );
          addSemielaborado(semi2.rows);
        } catch (e) {
          /* ignore */
        }
      }

      // ------------------------------------------------------------
      // FASE 1b: Lotes MP desde recepción + semielaborado (con variantes)
      // Engancha pesado/producción cuando el lote difiere en un sufijo (ej. 16012024V vs 16012024)
      // ------------------------------------------------------------
      const lotesMpRaw = [
        ...resultado.recepcion.map(r => r.lote),
        ...resultado.semielaborado.flatMap(s => [s.lotemateriaprima, s.lote].filter(Boolean)),
      ].filter(Boolean);
      const lotesMpExpandidos = this.unirVariantesMP(lotesMpRaw);

      if (lotesMpExpandidos.length > 0) {
        try {
          const pesMp = await pool.query(
            'SELECT * FROM "ControlPesado" WHERE lotemateriaprima = ANY($1)',
            [lotesMpExpandidos]
          );
          addPesado(pesMp.rows);
        } catch (e) {
          /* ignore */
        }
        try {
          const prodMp = await pool.query(
            'SELECT * FROM "Produccion" WHERE lotemateriaprima = ANY($1)',
            [lotesMpExpandidos]
          );
          addProduccion(prodMp.rows);
        } catch (e) {
          /* ignore */
        }
        try {
          const recMp = await pool.query('SELECT * FROM "Recepcion" WHERE lote = ANY($1)', [lotesMpExpandidos]);
          addRecepcion(recMp.rows);
        } catch (e) {
          /* ignore */
        }
      }

      // ================================================================
      // FASE 2: EXPANSIÓN HACIA ADELANTE (Recepción → ... → Expendio)
      // ================================================================
      if (resultado.recepcion.length > 0) {
        const lotesRecepcion = this.unirVariantesMP(resultado.recepcion.map(r => r.lote).filter(l => l));

        if (lotesRecepcion.length > 0) {
          try {
            const pes3 = await pool.query('SELECT * FROM "ControlPesado" WHERE lotemateriaprima = ANY($1)', [lotesRecepcion]);
            addPesado(pes3.rows);
          } catch (e) {
            /* ignore */
          }
        }

        if (lotesRecepcion.length > 0) {
          try {
            const prod3 = await pool.query('SELECT * FROM "Produccion" WHERE lotemateriaprima = ANY($1)', [lotesRecepcion]);
            addProduccion(prod3.rows);
          } catch (e) {
            /* ignore */
          }
        }

        if (lotesRecepcion.length > 0) {
          try {
            const semi3 = await pool.query(
              'SELECT * FROM "Semielaborado" WHERE lotemateriaprima = ANY($1)',
              [lotesRecepcion]
            );
            addSemielaborado(semi3.rows);
          } catch (e) {
            /* ignore */
          }
        }
      }

      // Si tenemos Pesado, buscar Producción por fecha
      if (resultado.pesado.length > 0) {
        const fechasPesado = resultado.pesado.map(p => p.fecha).filter(f => f);
        if (fechasPesado.length > 0) {
          try {
            const prod4 = await pool.query('SELECT * FROM "Produccion" WHERE fechaelaboracion = ANY($1::date[])', [fechasPesado]);
            addProduccion(prod4.rows);
          } catch (e) {
            /* ignore */
          }
        }
      }

      // Si tenemos Producción, buscar Envasado
      if (resultado.produccion.length > 0) {
        // Intentar obtener fechaelaboracion si existe
        const fechasProduccion = resultado.produccion
          .map(p => p.fechaelaboracion || null)
          .filter(f => f != null);
        const lotesProduccion = resultado.produccion.map(p => p.lote).filter(l => l);
        
        if (fechasProduccion.length > 0) {
          try {
            const env2 = await pool.query('SELECT * FROM "Envasado" WHERE fechaelaboracion = ANY($1::date[])', [fechasProduccion]);
            addEnvasado(env2.rows);
          } catch (e) {
            /* ignore */
          }
        }

        if (lotesProduccion.length > 0) {
          const env3 = await pool.query('SELECT * FROM "Envasado" WHERE loteprod = ANY($1)', [lotesProduccion]);
          addEnvasado(env3.rows);
        }
      }

      // Si tenemos Envasado, buscar Expendio
      if (resultado.envasado.length > 0) {
        const lotesProdEnvasado = resultado.envasado.map(e => e.loteprod).filter(l => l);
        if (lotesProdEnvasado.length > 0) {
          const exp2 = await pool.query('SELECT * FROM "Expendio" WHERE lote = ANY($1)', [lotesProdEnvasado]);
          addExpendio(exp2.rows);
        }
      }

      // ================================================================
      // FASE 3: EXPANSIÓN HACIA ATRÁS (Expendio → ... → Recepción)
      // ================================================================
      if (resultado.expendio.length > 0) {
        const lotesExpendio = resultado.expendio.map(e => e.lote).filter(l => l);
        if (lotesExpendio.length > 0) {
          const env4 = await pool.query('SELECT * FROM "Envasado" WHERE loteprod = ANY($1)', [lotesExpendio]);
          addEnvasado(env4.rows);
        }
      }

      // Si tenemos Envasado, buscar Producción
      if (resultado.envasado.length > 0) {
        const fechasEnvasado = resultado.envasado
          .map(e => e.fechaelaboracion || null)
          .filter(f => f != null);
        if (fechasEnvasado.length > 0) {
          try {
            const prod5 = await pool.query('SELECT * FROM "Produccion" WHERE fechaelaboracion = ANY($1::date[])', [fechasEnvasado]);
            addProduccion(prod5.rows);
          } catch (e) {
            /* ignore */
          }
        }
      }

      // Si tenemos Producción, buscar Pesado y Recepción
      if (resultado.produccion.length > 0) {
        const fechasProd = resultado.produccion
          .map(p => p.fechaelaboracion || null)
          .filter(f => f != null);
        // Intentar obtener lotemateriaprima si existe, sino usar array vacío
        const lotesMPProd = resultado.produccion
          .map(p => p.lotemateriaprima || null)
          .filter(l => l != null);
        const materiasPrimas = resultado.produccion.map(p => p.materiaprima).filter(m => m);

        // Pesado por fecha (si fechaelaboracion existe)
        if (fechasProd.length > 0) {
          try {
            const pes4 = await pool.query('SELECT * FROM "ControlPesado" WHERE fecha = ANY($1::date[])', [fechasProd]);
            addPesado(pes4.rows);
          } catch (e) {
            /* ignore */
          }
        }

        if (lotesMPProd.length > 0) {
          const rec2 = await pool.query('SELECT * FROM "Recepcion" WHERE lote = ANY($1)', [lotesMPProd]);
          addRecepcion(rec2.rows);
        }

        if (resultado.recepcion.length === 0 && materiasPrimas.length > 0) {
          const rec3 = await pool.query('SELECT * FROM "Recepcion" WHERE materiaprima = ANY($1)', [materiasPrimas]);
          addRecepcion(rec3.rows);
        }
      }

      // Si tenemos Pesado, buscar Recepción por lotemateriaprima (si existe)
      if (resultado.pesado.length > 0) {
        const lotesMPPesado = resultado.pesado
          .map(p => p.lotemateriaprima || null)
          .filter(l => l != null);
        if (lotesMPPesado.length > 0) {
          const rec4 = await pool.query('SELECT * FROM "Recepcion" WHERE lote = ANY($1)', [lotesMPPesado]);
          addRecepcion(rec4.rows);
        }

        if (lotesMPPesado.length > 0) {
          try {
            const semi4 = await pool.query(
              'SELECT * FROM "Semielaborado" WHERE lotemateriaprima = ANY($1)',
              [lotesMPPesado]
            );
            addSemielaborado(semi4.rows);
          } catch (e) {
            /* ignore */
          }
        }
      }

      // Semielaborados encontrados: asegurar recepción por lote MP / lote semielaborado (con variantes)
      if (resultado.semielaborado.length > 0) {
        const lotesSemiMp = this.unirVariantesMP(
          resultado.semielaborado.flatMap(s => [s.lotemateriaprima, s.lote].filter(Boolean))
        );
        if (lotesSemiMp.length > 0) {
          try {
            const recSemi = await pool.query('SELECT * FROM "Recepcion" WHERE lote = ANY($1)', [lotesSemiMp]);
            addRecepcion(recSemi.rows);
          } catch (e) {
            /* ignore */
          }
        }
      }

      // ================================================================
      // FASE 4: BÚSQUEDA COMPLEMENTARIA
      // ================================================================
      if (resultado.produccion.length > 0 && resultado.pesado.length === 0) {
        const productos = resultado.produccion.map(p => p.producto).filter(p => p);
        if (productos.length > 0) {
          const pes5 = await pool.query('SELECT * FROM "ControlPesado" WHERE producto = ANY($1)', [productos]);
          addPesado(pes5.rows);
        }
      }

      if (resultado.produccion.length > 0 && resultado.envasado.length === 0) {
        const productos = resultado.produccion.map(p => p.producto).filter(p => p);
        if (productos.length > 0) {
          const env5 = await pool.query('SELECT * FROM "Envasado" WHERE producto = ANY($1)', [productos]);
          addEnvasado(env5.rows);
        }
      }

      this.calcularResumen(resultado);
      return resultado;

    } catch (error) {
      throw error;
    }
  }

  static calcularResumen(resultado) {
    const etapasCore = ['expendio', 'envasado', 'produccion', 'pesado', 'recepcion'];
    let totalRegistros = 0;
    let etapasCoreConDatos = 0;

    etapasCore.forEach(etapa => {
      const count = resultado[etapa].length;
      totalRegistros += count;
      if (count > 0) etapasCoreConDatos++;
    });

    const semi = resultado.semielaborado || [];
    totalRegistros += semi.length;

    resultado.resumen.totalRegistros = totalRegistros;
    resultado.resumen.etapasTotales = 6;
    resultado.resumen.etapasEncontradas = etapasCoreConDatos + (semi.length > 0 ? 1 : 0);

    if (etapasCoreConDatos === 5) {
      resultado.resumen.completitud = 'completa';
    } else if (etapasCoreConDatos >= 3) {
      resultado.resumen.completitud = 'parcial';
    } else {
      resultado.resumen.completitud = 'incompleta';
    }

    // Warnings (cadena principal; semielaborado es etapa opcional)
    if (resultado.expendio.length === 0) resultado.resumen.warnings.push('Sin Expendio');
    if (resultado.envasado.length === 0) resultado.resumen.warnings.push('Sin Envasado');
    if (resultado.produccion.length === 0) resultado.resumen.warnings.push('Sin Producción');
    if (resultado.pesado.length === 0) resultado.resumen.warnings.push('Sin Pesado');
    if (resultado.recepcion.length === 0) resultado.resumen.warnings.push('Sin Recepción');
  }

  static loteToFecha(lote) {
    if (!lote) return null;

    const core = String(lote).trim().replace(/[A-Za-z]+$/, '');
    if (!core) return null;

    // Ya es formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(core)) {
      return core;
    }

    // Formato de 8 dígitos
    if (/^\d{8}$/.test(core)) {
      const primeros2 = parseInt(core.substring(0, 2));
      const siguientes2 = parseInt(core.substring(2, 4));

      // Si los primeros 2 dígitos son <= 31 y los siguientes <= 12, es DDMMYYYY
      if (primeros2 <= 31 && siguientes2 <= 12 && primeros2 > 0 && siguientes2 > 0) {
        const day = core.substring(0, 2);
        const month = core.substring(2, 4);
        const year = core.substring(4, 8);
        return `${year}-${month}-${day}`;
      }

      // Si no, asumimos YYYYMMDD
      const year = core.substring(0, 4);
      const month = core.substring(4, 6);
      const day = core.substring(6, 8);
      if (parseInt(month) <= 12 && parseInt(day) <= 31) {
        return `${year}-${month}-${day}`;
      }
    }
    
    return null;
  }
}

module.exports = TrazabilidadLote;
