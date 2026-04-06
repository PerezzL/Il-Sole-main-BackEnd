-- Script para crear la tabla Semielaborado
-- Il-Sole Backend - Sistema de Semielaborados

-- Tabla de Semielaborados (Pesado de ingredientes para semielaborados)
CREATE TABLE IF NOT EXISTS "Semielaborado" (
    id SERIAL PRIMARY KEY,
    semielaborado VARCHAR(100) NOT NULL,
    ingrediente VARCHAR(100) NOT NULL,
    lotemateriaprima VARCHAR(50),
    lote VARCHAR(50),
    peso DECIMAL(10,2) NOT NULL,
    fecha DATE NOT NULL,
    observaciones TEXT,
    responsable VARCHAR(100),
    usuario_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_semielaborado_semielaborado ON "Semielaborado"(semielaborado);
CREATE INDEX IF NOT EXISTS idx_semielaborado_ingrediente ON "Semielaborado"(ingrediente);
CREATE INDEX IF NOT EXISTS idx_semielaborado_lote ON "Semielaborado"(lote);
CREATE INDEX IF NOT EXISTS idx_semielaborado_lote_mp ON "Semielaborado"(lotemateriaprima);
CREATE INDEX IF NOT EXISTS idx_semielaborado_fecha ON "Semielaborado"(fecha);
CREATE INDEX IF NOT EXISTS idx_semielaborado_responsable ON "Semielaborado"(responsable);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_semielaborado_updated_at 
BEFORE UPDATE ON "Semielaborado" 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
