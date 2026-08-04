-- Codigo unico legible por registro: PREFIJO-AAAA-MM-DD-NN
-- Los registros existentes quedan con codigo NULL (no se regeneran retroactivamente).

ALTER TABLE "Recepcion" ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE "Produccion" ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE "Envasado" ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE "ControlPesado" ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE "Expendio" ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE "Semielaborado" ADD COLUMN IF NOT EXISTS codigo TEXT;

-- Indice unico parcial: solo exige unicidad quando hay codigo (deja pasar los NULL viejos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_recepcion_codigo ON "Recepcion" (codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_produccion_codigo ON "Produccion" (codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_envasado_codigo ON "Envasado" (codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_controlpesado_codigo ON "ControlPesado" (codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_expendio_codigo ON "Expendio" (codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_semielaborado_codigo ON "Semielaborado" (codigo) WHERE codigo IS NOT NULL;
