CREATE TABLE IF NOT EXISTS "SolicitudEdicion" (
  id SERIAL PRIMARY KEY,
  tabla TEXT NOT NULL,
  registro_id INTEGER NOT NULL,
  codigo TEXT,
  usuario_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  usuario_nombre TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  admin_id INTEGER REFERENCES "User"(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitud_edicion_estado ON "SolicitudEdicion" (estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_edicion_usuario ON "SolicitudEdicion" (usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_edicion_registro ON "SolicitudEdicion" (tabla, registro_id, usuario_id, estado);
