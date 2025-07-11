# 🚀 Il-Sole - Sistema de Producción de Alimentos

Sistema completo de gestión de producción de alimentos con backend en Node.js/Express y frontend en React.

## 📁 Estructura del Proyecto

```
Il-Sole-main-BackEnd/
├── BackEnd/              # Servidor Express + PostgreSQL
│   ├── server.js         # Servidor principal
│   ├── src/              # Código fuente del backend
│   ├── database/         # Esquemas de base de datos
│   └── scripts/          # Scripts de utilidad
├── FrontEnd/             # Aplicación React + Vite
│   ├── src/              # Código fuente del frontend
│   ├── components/       # Componentes React
│   └── config/           # Configuración de API
└── package.json          # Scripts para ejecutar ambos servicios
```

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
# Instalar todas las dependencias (backend + frontend)
npm run install:all

# O instalar por separado:
# Backend
cd BackEnd && npm install

# Frontend  
cd FrontEnd && npm install
```

### 2. Configurar Variables de Entorno

#### Backend (.env en carpeta BackEnd)
```env
DATABASE_URL=postgres://postgres.xfsffvercadqouvctkhw:jH79Zsc8IsZ6hkT8@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
PORT=5000
NODE_ENV=development
```

#### Frontend (.env en carpeta FrontEnd)
```bash
# Copiar el archivo de ejemplo
cp FrontEnd/env.example FrontEnd/.env
```

El archivo `.env` del frontend debe contener:
```env
VITE_API_URL=http://localhost:5000/api
VITE_DEV_MODE=true
```

### 3. Configurar Base de Datos

```bash
# Probar conexión a la base de datos
npm run test:connection

# Configurar tablas en la base de datos
npm run setup:db
```

## 🚀 Ejecutar el Proyecto

### Opción 1: Ejecutar Ambos Servicios Simultáneamente
```bash
# Ejecutar backend (puerto 5000) y frontend (puerto 5173) al mismo tiempo
npm run dev
```

### Opción 2: Ejecutar Servicios por Separado

#### Terminal 1 - Backend
```bash
npm run dev:backend
# Servidor corriendo en http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
npm run dev:frontend
# Aplicación corriendo en http://localhost:5173
```

## 🔗 Endpoints del Backend

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Estado del servidor |
| `/api/products` | GET, POST, PUT, DELETE | Gestión de productos |
| `/api/users` | GET, POST, PUT, DELETE | Gestión de usuarios |
| `/api/production` | GET, POST, PUT, DELETE | Gestión de producción |
| `/api/control-pesado` | GET, POST, PUT, DELETE | Control de pesado |
| `/api/envasado` | GET, POST, PUT, DELETE | Control de envasado |
| `/api/recepcion` | GET, POST, PUT, DELETE | Recepción de materia prima |
| `/api/expendio` | GET, POST, PUT, DELETE | Gestión de expendio |

## 🧪 Probar Conexiones

### 1. Verificar Backend
```bash
# Probar conexión a la base de datos
curl http://localhost:5000/api/health
```

### 2. Verificar Frontend
- Abrir http://localhost:5173
- Ir a la página de Administración
- Verificar la pestaña "Estado del Sistema"

### 3. Probar Formularios
- **Recepción**: http://localhost:5173/recepcion
- **Producción**: http://localhost:5173/produccion
- **Envasado**: http://localhost:5173/productos-envasados
- **Expendio**: http://localhost:5173/expendio

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Ejecutar backend + frontend |
| `npm run dev:backend` | Solo backend |
| `npm run dev:frontend` | Solo frontend |
| `npm run build` | Construir frontend para producción |
| `npm run test:connection` | Probar conexión a la base de datos |
| `npm run setup:db` | Configurar tablas en la base de datos |
| `npm run install:all` | Instalar todas las dependencias |

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"
1. Verificar que el backend esté corriendo en puerto 5000
2. Verificar la variable `VITE_API_URL` en FrontEnd/.env
3. Verificar que CORS esté configurado correctamente

### Error: "Database connection failed"
1. Verificar las variables de entorno del backend
2. Ejecutar `npm run test:connection`
3. Verificar que Supabase esté activo

### Error: "Module not found"
1. Ejecutar `npm run install:all`
2. Verificar que node_modules exista en ambas carpetas

## 📱 Tecnologías Utilizadas

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (Supabase)
- **CORS** para comunicación frontend
- **dotenv** para variables de entorno

### Frontend
- **React 18** + **Vite**
- **Chakra UI** para componentes
- **React Router** para navegación
- **Fetch API** para comunicación con backend

## 🚀 Despliegue

### Backend en Vercel
```bash
cd BackEnd
vercel --prod
```

### Frontend en Vercel/Netlify
```bash
cd FrontEnd
npm run build
# Subir la carpeta dist/
```

## 📞 Soporte

Para problemas o consultas:
1. Verificar la pestaña "Estado del Sistema" en la página de administración
2. Revisar los logs del backend en la consola
3. Verificar la consola del navegador para errores del frontend

---

**¡Listo para usar! 🎉** 