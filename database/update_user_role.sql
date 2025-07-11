-- Script para actualizar la tabla User existente con el campo role
-- Ejecutar este script si ya tienes una tabla User con datos

-- Agregar el campo role a la tabla User existente
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Agregar la restricción CHECK para validar los roles
ALTER TABLE "User" ADD CONSTRAINT IF NOT EXISTS check_user_role CHECK (role IN ('user', 'admin'));

-- Actualizar usuarios existentes (opcional - ajustar según tus necesidades)
-- Por defecto, todos los usuarios existentes serán 'user'
-- Si quieres que algunos sean admin, ejecuta estas consultas:

-- Ejemplo: Hacer admin al usuario 'admin' si existe
UPDATE "User" SET role = 'admin' WHERE username = 'admin';

-- Ejemplo: Hacer admin al usuario 'supervisor' si existe
UPDATE "User" SET role = 'admin' WHERE username = 'supervisor';

-- Verificar que todos los usuarios tengan un rol válido
SELECT id, username, email, role FROM "User" ORDER BY id; 