-- Esquema de Base de Datos para Sistema de Producción de Alimentos
-- Il-Sole Backend

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS "Product" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Recepción de Materia Prima
CREATE TABLE IF NOT EXISTS "Recepcion" (
    id SERIAL PRIMARY KEY,
    materiaPrima VARCHAR(100) NOT NULL,
    control1 VARCHAR(50),
    control2 VARCHAR(50),
    control3 VARCHAR(50),
    marca VARCHAR(100),
    proveedor VARCHAR(100) NOT NULL,
    cant DECIMAL(10,2) NOT NULL,
    nroRemito VARCHAR(50) UNIQUE NOT NULL,
    temp DECIMAL(5,2),
    fechaElaborado DATE NOT NULL,
    fechaVTO DATE NOT NULL,
    lote VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Producción
CREATE TABLE IF NOT EXISTS "Produccion" (
    id SERIAL PRIMARY KEY,
    producto VARCHAR(100) NOT NULL,
    materiaprima VARCHAR(100) NOT NULL,
    lote VARCHAR(50) NOT NULL,
    planproduccion DECIMAL(10,2),
    produccion DECIMAL(10,2) NOT NULL,
    pesodescarte DECIMAL(10,2) DEFAULT 0,
    observaciones TEXT,
    comentarios TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Envasado
CREATE TABLE IF NOT EXISTS "Envasado" (
    id SERIAL PRIMARY KEY,
    loteProd VARCHAR(50) NOT NULL,
    loteEnvasado VARCHAR(50) UNIQUE NOT NULL,
    producto VARCHAR(100) NOT NULL,
    cantEnvases INTEGER NOT NULL,
    cantDescarte INTEGER DEFAULT 0,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Control de Pesado
CREATE TABLE IF NOT EXISTS "ControlPesado" (
    id SERIAL PRIMARY KEY,
    producto VARCHAR(100) NOT NULL,
    materiaprima VARCHAR(100) NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    fecha DATE NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Expendio/Distribución
CREATE TABLE IF NOT EXISTS "Expendio" (
    id SERIAL PRIMARY KEY,
    producto VARCHAR(100) NOT NULL,
    lote VARCHAR(50) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    temptransporte DECIMAL(5,2),
    limptransporte BOOLEAN DEFAULT true,
    responsable VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación Producto-Materia Prima
CREATE TABLE IF NOT EXISTS "ProductoMateriaPrima" (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
    materia_prima_id INTEGER NOT NULL REFERENCES "MateriaPrima"(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, materia_prima_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_recepcion_materia_prima ON "Recepcion"(materiaPrima);
CREATE INDEX IF NOT EXISTS idx_recepcion_proveedor ON "Recepcion"(proveedor);
CREATE INDEX IF NOT EXISTS idx_recepcion_lote ON "Recepcion"(lote);
CREATE INDEX IF NOT EXISTS idx_recepcion_fecha_elaborado ON "Recepcion"(fechaElaborado);
CREATE INDEX IF NOT EXISTS idx_recepcion_fecha_vto ON "Recepcion"(fechaVTO);

CREATE INDEX IF NOT EXISTS idx_produccion_producto ON "Produccion"(producto);
CREATE INDEX IF NOT EXISTS idx_produccion_materia_prima ON "Produccion"(materiaPrima);
CREATE INDEX IF NOT EXISTS idx_produccion_lote ON "Produccion"(lote);

CREATE INDEX IF NOT EXISTS idx_envasado_lote_prod ON "Envasado"(loteProd);
CREATE INDEX IF NOT EXISTS idx_envasado_lote_envasado ON "Envasado"(loteEnvasado);
CREATE INDEX IF NOT EXISTS idx_envasado_producto ON "Envasado"(producto);

CREATE INDEX IF NOT EXISTS idx_control_pesado_producto ON "ControlPesado"(producto);
CREATE INDEX IF NOT EXISTS idx_control_pesado_materia_prima ON "ControlPesado"(materiaprima);
CREATE INDEX IF NOT EXISTS idx_control_pesado_fecha ON "ControlPesado"(fecha);

CREATE INDEX IF NOT EXISTS idx_expendio_producto ON "Expendio"(producto);
CREATE INDEX IF NOT EXISTS idx_expendio_lote ON "Expendio"(lote);
CREATE INDEX IF NOT EXISTS idx_expendio_destino ON "Expendio"(destino);
CREATE INDEX IF NOT EXISTS idx_expendio_responsable ON "Expendio"(responsable);

CREATE INDEX IF NOT EXISTS idx_producto_materia_prima_producto ON "ProductoMateriaPrima"(producto_id);
CREATE INDEX IF NOT EXISTS idx_producto_materia_prima_materia ON "ProductoMateriaPrima"(materia_prima_id);
CREATE INDEX IF NOT EXISTS idx_producto_materia_prima_activo ON "ProductoMateriaPrima"(activo);

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recepcion_updated_at BEFORE UPDATE ON "Recepcion" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produccion_updated_at BEFORE UPDATE ON "Produccion" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_envasado_updated_at BEFORE UPDATE ON "Envasado" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_control_pesado_updated_at BEFORE UPDATE ON "ControlPesado" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expendio_updated_at BEFORE UPDATE ON "Expendio" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producto_materia_prima_updated_at BEFORE UPDATE ON "ProductoMateriaPrima" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- No se incluyen usuarios de prueba - usar solo usuarios existentes en la base de datos

INSERT INTO "Product" (name, description) VALUES 
('Yogur Natural', 'Yogur natural sin azúcar'),
('Yogur de Frutilla', 'Yogur con sabor a frutilla'),
('Leche Entera', 'Leche entera pasteurizada'),
('Queso Cremoso', 'Queso cremoso tipo Philadelphia')
ON CONFLICT DO NOTHING; 