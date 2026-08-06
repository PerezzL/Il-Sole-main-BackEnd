CREATE TABLE IF NOT EXISTS "Notificacion" (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'registro_creado',
  mensaje TEXT NOT NULL,
  tabla TEXT,
  codigo TEXT,
  leido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacion_usuario ON "Notificacion" (usuario_id, leido, created_at DESC);
