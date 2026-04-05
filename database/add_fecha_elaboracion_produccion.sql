-- Script para agregar fechaElaboracion a la tabla Produccion
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar campo fechaElaboracion
ALTER TABLE "Produccion" 
ADD COLUMN IF NOT EXISTS fechaElaboracion DATE;

-- 2. Crear índice para optimizar consultas de trazabilidad
CREATE INDEX IF NOT EXISTS idx_produccion_fecha_elaboracion 
ON "Produccion"(fechaElaboracion);

-- 3. Comentario para documentar el propósito del campo
COMMENT ON COLUMN "Produccion".fechaElaboracion 
IS 'Fecha de elaboración del producto - usado para trazabilidad con Envasado';

-- 4. Verificar que el campo se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Produccion' AND column_name = 'fechaelaboracion';
