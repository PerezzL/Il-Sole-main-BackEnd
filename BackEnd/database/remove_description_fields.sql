-- Script para eliminar campos de descripción y categoría
-- Ejecutar en Supabase SQL Editor

BEGIN;

-- ============================================================================
-- ELIMINAR CAMPO DESCRIPCIÓN DE LA TABLA PRODUCT
-- ============================================================================

-- Eliminar la columna description de la tabla Product
ALTER TABLE "Product" DROP COLUMN IF EXISTS description;

-- ============================================================================
-- ELIMINAR CAMPOS DESCRIPCIÓN Y CATEGORÍA DE LA TABLA MATERIAPRIMA
-- ============================================================================

-- Eliminar la columna descripcion de la tabla MateriaPrima
ALTER TABLE "MateriaPrima" DROP COLUMN IF EXISTS descripcion;

-- Eliminar la columna categoria de la tabla MateriaPrima
ALTER TABLE "MateriaPrima" DROP COLUMN IF EXISTS categoria;

-- ============================================================================
-- VERIFICAR CAMBIOS
-- ============================================================================

-- Verificar estructura de la tabla Product
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Product' 
ORDER BY ordinal_position;

-- Verificar estructura de la tabla MateriaPrima
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'MateriaPrima' 
ORDER BY ordinal_position;

COMMIT;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 
-- 1. Este script elimina permanentemente los campos:
--    - Product.description
--    - MateriaPrima.descripcion
--    - MateriaPrima.categoria
--
-- 2. Si hay datos importantes en estos campos, hacer backup antes de ejecutar
--
-- 3. Después de ejecutar este script, actualizar el código del backend:
--    - Remover referencias a estos campos en los modelos
--    - Actualizar las consultas SQL
--    - Modificar los controladores
--
-- 4. También actualizar el frontend para no enviar estos campos
--
-- ============================================================================ 