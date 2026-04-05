-- Script para agregar campos necesarios para trazabilidad
-- Ejecutar este script en la base de datos antes de implementar la funcionalidad

-- 1. Agregar campos faltantes en la tabla Envasado
ALTER TABLE "Envasado" 
ADD COLUMN IF NOT EXISTS fechaIngresoPackaging DATE,
ADD COLUMN IF NOT EXISTS fechaElaboracion DATE;

-- 2. Agregar campo faltante en la tabla ControlPesado  
ALTER TABLE "ControlPesado" 
ADD COLUMN IF NOT EXISTS loteMateriaPrima VARCHAR(50);

-- 3. Crear índices para optimizar consultas de trazabilidad
CREATE INDEX IF NOT EXISTS idx_envasado_fecha_elaboracion ON "Envasado"(fechaElaboracion);
CREATE INDEX IF NOT EXISTS idx_envasado_fecha_ingreso_packaging ON "Envasado"(fechaIngresoPackaging);
CREATE INDEX IF NOT EXISTS idx_control_pesado_lote_materia_prima ON "ControlPesado"(loteMateriaPrima);

-- 4. Índices adicionales para optimizar las consultas de trazabilidad
CREATE INDEX IF NOT EXISTS idx_produccion_materia_prima ON "Produccion"(materiaprima);
CREATE INDEX IF NOT EXISTS idx_recepcion_materia_prima_lote ON "Recepcion"(materiaPrima, lote);

-- 5. Función para convertir fecha a string de lote (formato YYYYMMDD)
CREATE OR REPLACE FUNCTION fecha_to_lote(fecha DATE)
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN TO_CHAR(fecha, 'YYYYMMDD');
END;
$$ LANGUAGE plpgsql;

-- 6. Función para convertir string de lote a fecha
CREATE OR REPLACE FUNCTION lote_to_fecha(lote VARCHAR(50))
RETURNS DATE AS $$
BEGIN
    -- Intentar convertir lote formato YYYYMMDD a fecha
    IF lote ~ '^\d{8}$' THEN
        RETURN TO_DATE(lote, 'YYYYMMDD');
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
