# 🚀 Guía Completa: Separar Frontend/Backend y Deploy en Vercel

## 📋 **RESUMEN**
Esta guía te ayudará a:
1. Separar tu proyecto actual en 2 repositorios independientes
2. Configurar ambos para producción
3. Deployar en Vercel para acceso desde cualquier dispositivo

---

## 🎯 **OBJETIVO FINAL**
- **Frontend**: `https://il-sole-frontend.vercel.app`
- **Backend**: `https://il-sole-backend.vercel.app`
- **Acceso**: Desde cualquier dispositivo con internet

---

## 📂 **PASO 1: PREPARAR EL FRONTEND**

### 1.1 Crear nueva carpeta
```bash
# Crear carpeta nueva (desde cualquier ubicación)
mkdir il-sole-frontend
cd il-sole-frontend
```

### 1.2 Copiar archivos del frontend actual
```bash
# En Windows PowerShell:
xcopy "C:\Users\lucas\Desktop\Il-Sole-main-BackEnd\FrontEnd\*" . /E /H

# En Mac/Linux:
cp -r /ruta/a/Il-Sole-main-BackEnd/FrontEnd/* .
```

### 1.3 Crear archivo de configuración para producción
Crear archivo `.env.production`:
```env
# URL del backend en Vercel (temporal, cambiarás después)
VITE_API_URL=https://il-sole-backend.vercel.app/api
```

### 1.4 Verificar package.json
Asegúrate que tu `package.json` tenga:
```json
{
  "name": "il-sole-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

### 1.5 Subir a GitHub
```bash
# Inicializar git
git init

# Agregar archivos
git add .
git commit -m "Initial frontend commit - Il Sole Frontend"

# Crear repositorio en GitHub (ve a github.com y crea: il-sole-frontend)
# Luego conectar:
git remote add origin https://github.com/TU-USUARIO/il-sole-frontend.git
git branch -M main
git push -u origin main
```

---

## 🔧 **PASO 2: PREPARAR EL BACKEND**

### 2.1 Crear nueva carpeta
```bash
# Crear carpeta nueva
mkdir il-sole-backend
cd il-sole-backend
```

### 2.2 Copiar archivos del backend actual
```bash
# En Windows PowerShell:
xcopy "C:\Users\lucas\Desktop\Il-Sole-main-BackEnd\BackEnd\*" . /E /H

# En Mac/Linux:
cp -r /ruta/a/Il-Sole-main-BackEnd/BackEnd/* .
```

### 2.3 Crear configuración para Vercel
Crear archivo `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2.4 Actualizar .env para producción
Editar tu archivo `.env` existente y asegúrate que tenga:
```env
# Configuración de Base de Datos (tu URL actual de Supabase)
DATABASE_URL=postgresql://postgres.xfsffvercadqouvctkhw:0kTbIFmYngzA6oIn@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x

# JWT Configuration 
JWT_SECRET=il-sole-super-secret-key-2024-change-in-production

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS - IMPORTANTE: Agregar URL del frontend de Vercel
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://il-sole-frontend.vercel.app
```

### 2.5 Verificar package.json
Tu `package.json` debería tener:
```json
{
  "name": "il-sole-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.13.1"
  }
}
```

### 2.6 Subir a GitHub
```bash
# Inicializar git
git init

# Agregar archivos (¡El .env NO se subirá porque está en .gitignore!)
git add .
git commit -m "Initial backend commit - Il Sole Backend"

# Crear repositorio en GitHub (ve a github.com y crea: il-sole-backend)
# Luego conectar:
git remote add origin https://github.com/TU-USUARIO/il-sole-backend.git
git branch -M main
git push -u origin main
```

---

## 🚀 **PASO 3: DEPLOY EN VERCEL**

### 3.1 Deploy Backend PRIMERO

#### A. Ir a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click "New Project"
4. Selecciona `il-sole-backend`

#### B. Configurar Variables de Entorno en Vercel
En la sección "Environment Variables" de Vercel, agrega:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres.xfsffvercadqouvctkhw:0kTbIFmYngzA6oIn@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x` |
| `JWT_SECRET` | `il-sole-super-secret-key-2024-production` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `ALLOWED_ORIGINS` | `https://il-sole-frontend.vercel.app` |

#### C. Deploy
1. Click "Deploy"
2. Espera a que termine
3. **IMPORTANTE**: Copia la URL que te da (ej: `https://il-sole-backend-abc123.vercel.app`)

### 3.2 Deploy Frontend DESPUÉS

#### A. Actualizar URL del Backend
Edita `.env.production` con la URL real:
```env
# Usar la URL REAL que te dio Vercel
VITE_API_URL=https://il-sole-backend-abc123.vercel.app/api
```

#### B. Actualizar repositorio
```bash
# Hacer commit del cambio
git add .
git commit -m "Update backend URL for production"
git push
```

#### C. Deploy en Vercel
1. En Vercel, click "New Project"
2. Selecciona `il-sole-frontend`
3. En "Environment Variables" agrega:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://il-sole-backend-abc123.vercel.app/api` |

4. Click "Deploy"

---

## ✅ **VERIFICACIÓN FINAL**

### Deberías tener:
- ✅ **Frontend**: `https://il-sole-frontend.vercel.app`
- ✅ **Backend**: `https://il-sole-backend.vercel.app`  
- ✅ Ambos comunicándose correctamente
- ✅ Login funcionando
- ✅ Base de datos conectada

### Pruebas:
1. **Acceder al frontend** desde tu teléfono
2. **Hacer login** con un usuario existente
3. **Verificar que carga datos** de la base de datos

---

## 🚨 **CHECKLIST DE SEGURIDAD**

Antes de hacer público:
- [ ] Archivo `.env` está en `.gitignore` ✅
- [ ] No hay credenciales en el código ✅
- [ ] Variables configuradas en Vercel (no en GitHub) ✅
- [ ] CORS configurado para URL de producción ✅
- [ ] URLs de frontend y backend actualizadas ✅

---

## 🐛 **TROUBLESHOOTING COMÚN**

### Error: "CORS policy"
**Solución**: Verificar que `ALLOWED_ORIGINS` en el backend incluya la URL del frontend.

### Error: "API not found" 
**Solución**: Verificar que `VITE_API_URL` en el frontend tenga la URL correcta del backend.

### Error de Base de Datos
**Solución**: Verificar que `DATABASE_URL` esté correctamente configurada en Vercel.

### Frontend no carga
**Solución**: Verificar que el build se haya completado sin errores en Vercel.

---

## 📞 **SOPORTE**

Si algo no funciona:
1. Revisa los logs en Vercel (tab "Functions")
2. Verifica las variables de entorno
3. Comprueba que ambas URLs estén actualizadas

---

## 🎉 **¡FELICITACIONES!**

Una vez completado, tendrás:
- ✅ Aplicación accesible desde cualquier dispositivo
- ✅ Frontend y Backend en la nube
- ✅ Base de datos persistente
- ✅ Autenticación funcionando
- ✅ Completamente seguro

**Tu aplicación Il-Sole estará disponible 24/7 desde cualquier lugar del mundo! 🌍**

---

**Fecha de creación**: $(date)  
**Versión**: 1.0  
**Proyecto**: Il-Sole Sistema de Producción 