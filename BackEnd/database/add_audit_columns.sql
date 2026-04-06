-- Script para agregar columnas de auditoría a todas las tablas
-- Agregar columna responsable y usuario_id para rastrear quién creó/modificó cada registro

-- Tabla Recepcion
ALTER TABLE "Recepcion" 
ADD COLUMN IF NOT EXISTS responsable VARCHAR(100),
ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES "User"(id);

-- Tabla Produccion
ALTER TABLE "Produccion" 
ADD COLUMN IF NOT EXISTS responsable VARCHAR(100),
ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES "User"(id);

-- Tabla Envasado
ALTER TABLE "Envasado" 
ADD COLUMN IF NOT EXISTS responsable VARCHAR(100),
ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES "User"(id);

-- Tabla ControlPesado
ALTER TABLE "ControlPesado" 
ADD COLUMN IF NOT EXISTS responsable VARCHAR(100),
ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES "User"(id);

-- La tabla Expendio ya tiene responsable, solo agregar usuario_id
ALTER TABLE "Expendio" 
ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES "User"(id);

-- Crear índices para mejorar el rendimiento de consultas por responsable
CREATE INDEX IF NOT EXISTS idx_recepcion_responsable ON "Recepcion"(responsable);
CREATE INDEX IF NOT EXISTS idx_recepcion_usuario_id ON "Recepcion"(usuario_id);

CREATE INDEX IF NOT EXISTS idx_produccion_responsable ON "Produccion"(responsable);
CREATE INDEX IF NOT EXISTS idx_produccion_usuario_id ON "Produccion"(usuario_id);

CREATE INDEX IF NOT EXISTS idx_envasado_responsable ON "Envasado"(responsable);
CREATE INDEX IF NOT EXISTS idx_envasado_usuario_id ON "Envasado"(usuario_id);

CREATE INDEX IF NOT EXISTS idx_control_pesado_responsable ON "ControlPesado"(responsable);
CREATE INDEX IF NOT EXISTS idx_control_pesado_usuario_id ON "ControlPesado"(usuario_id);

CREATE INDEX IF NOT EXISTS idx_expendio_usuario_id ON "Expendio"(usuario_id); 