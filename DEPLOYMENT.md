# 🚀 Despliegue en Vercel - Il-Sole Backend

## 📋 Requisitos Previos

1. **Cuenta en Vercel** (gratuita)
2. **Cuenta en Supabase** con base de datos configurada
3. **GitHub/GitLab** para el repositorio

## 🔧 Configuración Local

### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2. Login en Vercel
```bash
vercel login
```

### 3. Configurar variables de entorno localmente
```bash
vercel env add DATABASE_URL
vercel env add POSTGRES_URL_NON_POOLING
vercel env add POSTGRES_USER
vercel env add POSTGRES_HOST
vercel env add POSTGRES_PASSWORD
vercel env add POSTGRES_DATABASE
vercel env add SUPABASE_URL
vercel env add SUPABASE_JWT_SECRET
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## 🌐 Despliegue

### Opción 1: Despliegue desde CLI
```bash
# Desde la carpeta BackEnd
vercel

# Para producción
vercel --prod
```

### Opción 2: Despliegue desde GitHub
1. **Sube tu código a GitHub**
2. **Conecta tu repositorio en Vercel Dashboard**
3. **Configura las variables de entorno en Vercel Dashboard**

## ⚙️ Configuración de Variables de Entorno en Vercel

### Desde Vercel Dashboard:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable:

```env
DATABASE_URL=postgres://postgres.xfsffvercadqouvctkhw:jH79Zsc8IsZ6hkT8@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://postgres.xfsffvercadqouvctkhw:jH79Zsc8IsZ6hkT8@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_USER=postgres
POSTGRES_HOST=db.xfsffvercadqouvctkhw.supabase.co
POSTGRES_PASSWORD=jH79Zsc8IsZ6hkT8
POSTGRES_DATABASE=postgres
SUPABASE_URL=https://xfsffvercadqouvctkhw.supabase.co
SUPABASE_JWT_SECRET=Nk/lQepCpXFHrurht4T7xyBDBjZ7mvJ3YGFbDBijQDISs7bO6MoXaFyhNkKQIk7cKD84t57sH277LrhgbMjlTQ==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmc2ZmdmVyY2FkcW91dmN0a2h3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk1NTM5OCwiZXhwIjoyMDY0NTMxMzk4fQ.3o6N7kb9hYI4UAfXJrqE95TfOelTXnXuwaXB3oPLRUY
NODE_ENV=production
```

## 🗄️ Configuración de Base de Datos

### 1. Crear las tablas en Supabase
```bash
# Localmente (antes del despliegue)
npm run setup-db
```

### 2. O ejecutar el SQL directamente en Supabase Dashboard:
- Ve a SQL Editor en Supabase
- Copia y pega el contenido de `database/schema.sql`
- Ejecuta el script

## 🔍 Verificación del Despliegue

### 1. Verificar que el servidor esté funcionando:
```bash
curl https://tu-proyecto.vercel.app/api/health
```

### 2. Verificar la conexión a la base de datos:
```bash
curl https://tu-proyecto.vercel.app/api/test-connection
```

## 📁 Estructura de Archivos para Vercel

```
BackEnd/
├── server.js              # Punto de entrada
├── vercel.json            # Configuración de Vercel
├── package.json           # Dependencias
├── .env                   # Variables locales (no se sube)
├── src/
│   ├── config/
│   │   └── db.js         # Configuración de base de datos
│   ├── controllers/      # Controladores
│   ├── models/          # Modelos
│   └── routes/          # Rutas
├── database/
│   └── schema.sql       # Esquema de base de datos
└── scripts/
    ├── test-connection.js
    └── setup-database.js
```

## 🚨 Troubleshooting

### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` localmente

### Error: "Database connection failed"
- Verifica las variables de entorno en Vercel
- Asegúrate de que la base de datos esté creada en Supabase

### Error: "Function timeout"
- Aumenta `maxDuration` en `vercel.json`
- Optimiza las consultas de base de datos

## 🔄 Actualizaciones

Para actualizar el despliegue:
```bash
# Desde la carpeta BackEnd
vercel --prod
```

O simplemente haz push a tu repositorio si tienes GitHub conectado.

## 📞 Soporte

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Issues**: Crea un issue en el repositorio 