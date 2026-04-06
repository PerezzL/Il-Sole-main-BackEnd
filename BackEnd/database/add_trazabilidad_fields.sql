-- ============================================================================
-- Script para agregar campos necesarios para la trazabilidad completa
-- Il-Sole Backend - Sistema de Trazabilidad
-- ============================================================================

-- ============================================================================
-- 1. TABLA ControlPesado - Agregar campos de trazabilidad
-- ============================================================================

-- Campo: loteMateriaPrima - Para conectar con Recepción
ALTER TABLE "ControlPesado" 
ADD COLUMN IF NOT EXISTS loteMateriaPrima VARCHAR(50);

-- Campo: lote - Lote de pesada (para conectar desde Producción)
ALTER TABLE "ControlPesado" 
ADD COLUMN IF NOT EXISTS lote VARCHAR(50);

-- ============================================================================
-- 2. TABLA Produccion - Agregar campos de trazabilidad
-- ============================================================================

-- Campo: lotePesada - Para conectar con ControlPesado
ALTER TABLE "Produccion" 
ADD COLUMN IF NOT EXISTS lotePesada VARCHAR(50);

-- Campo: loteMateriaPrima - Para conectar directamente con Recepción
ALTER TABLE "Produccion" 
ADD COLUMN IF NOT EXISTS loteMateriaPrima VARCHAR(50);

-- Campo: fechaElaboracion - Para conectar con Envasado
ALTER TABLE "Produccion" 
ADD COLUMN IF NOT EXISTS fechaElaboracion DATE;

-- ============================================================================
-- 3. TABLA Envasado - Agregar campos de trazabilidad
-- ============================================================================

-- Campo: fechaElaboracion - Para conectar con Producción
ALTER TABLE "Envasado" 
ADD COLUMN IF NOT EXISTS fechaElaboracion DATE;

-- ============================================================================
-- 4. ÍNDICES para mejorar rendimiento
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_control_pesado_lote_mp ON "ControlPesado"(loteMateriaPrima);
CREATE INDEX IF NOT EXISTS idx_control_pesado_lote ON "ControlPesado"(lote);
CREATE INDEX IF NOT EXISTS idx_produccion_lote_pesada ON "Produccion"(lotePesada);
CREATE INDEX IF NOT EXISTS idx_produccion_lote_mp ON "Produccion"(loteMateriaPrima);
CREATE INDEX IF NOT EXISTS idx_produccion_fecha_elab ON "Produccion"(fechaElaboracion);
CREATE INDEX IF NOT EXISTS idx_envasado_fecha_elab ON "Envasado"(fechaElaboracion);

-- ============================================================================
-- DIAGRAMA DE CONEXIONES
-- ============================================================================
/*
  EXPENDIO.lote ──────────────────► ENVASADO.loteProd
                                         │
                                         │ fechaElaboracion
                                         ▼
                                    PRODUCCIÓN
                                    /         \
                     lotePesada   /           \  loteMateriaPrima
                                 /             \
                                ▼               ▼
                            PESADO          RECEPCIÓN
                                │               ▲
                                │ loteMateriaPrima
                                └───────────────┘
*/
