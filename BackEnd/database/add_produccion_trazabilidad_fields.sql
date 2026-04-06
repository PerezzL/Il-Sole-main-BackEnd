-- Script para agregar campos de trazabilidad SEGÚN ESPECIFICACIÓN EXACTA
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar campo "Lote de pesada" a la tabla Producción
ALTER TABLE "Produccion" 
ADD COLUMN IF NOT EXISTS lotePesada VARCHAR(50);

-- 2. Agregar campo "Lote de materia prima" a la tabla Producción
ALTER TABLE "Produccion" 
ADD COLUMN IF NOT EXISTS loteMateriaPrima VARCHAR(50);

-- 3. Asegurar que existe loteMateriaPrima en ControlPesado
ALTER TABLE "ControlPesado" 
ADD COLUMN IF NOT EXISTS loteMateriaPrima VARCHAR(50);

-- 4. Asegurar que existe fechaElaboracion en Envasado  
ALTER TABLE "Envasado" 
ADD COLUMN IF NOT EXISTS fechaElaboracion DATE;

-- 5. Crear índices para optimizar las consultas de trazabilidad
CREATE INDEX IF NOT EXISTS idx_produccion_lote_pesada ON "Produccion"(lotePesada);
CREATE INDEX IF NOT EXISTS idx_produccion_lote_materia_prima ON "Produccion"(loteMateriaPrima);
CREATE INDEX IF NOT EXISTS idx_control_pesado_lote_materia_prima ON "ControlPesado"(loteMateriaPrima);
CREATE INDEX IF NOT EXISTS idx_envasado_fecha_elaboracion ON "Envasado"(fechaElaboracion);

-- 6. Comentarios para documentar los campos SEGÚN ESPECIFICACIÓN
COMMENT ON COLUMN "Produccion".lotePesada 
IS 'Lote de pesada - ESPECIFICACIÓN: Desde Producción, utilizando el Lote de pesada, se deben buscar los registros de Pesado con ese mismo lote';

COMMENT ON COLUMN "Produccion".loteMateriaPrima 
IS 'Lote de materia prima - ESPECIFICACIÓN: utilizando el Lote de materia prima, se deben buscar los registros de Recepción que coincidan';

COMMENT ON COLUMN "ControlPesado".loteMateriaPrima 
IS 'Lote de materia prima - ESPECIFICACIÓN: Desde Pesado, usando el Lote de materia prima, se deben buscar los registros de Recepción';

COMMENT ON COLUMN "Envasado".fechaElaboracion 
IS 'Fecha de elaboración - ESPECIFICACIÓN: Desde un registro de Envasado, usando su Fecha de elaboración, se deben obtener todos los registros de Producción cuya Fecha de producción coincida';

-- 7. Verificar que los campos se agregaron correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE (
    (table_name = 'Produccion' AND column_name IN ('lotepesada', 'lotemateriaprima', 'fechaelaboracion')) OR
    (table_name = 'ControlPesado' AND column_name = 'lotemateriaprima') OR
    (table_name = 'Envasado' AND column_name = 'fechaelaboracion')
)
ORDER BY table_name, column_name;
