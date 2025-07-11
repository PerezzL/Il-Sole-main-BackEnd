# Modelos de Base de Datos - Il-Sole Backend

Este directorio contiene los modelos de base de datos para el sistema de producción de alimentos Il-Sole.

## Estructura de Modelos

### 1. User (Usuario)
**Archivo:** `User.js`
**Tabla:** `User`

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR(50) UNIQUE)
- `password` (VARCHAR(255))
- `email` (VARCHAR(100) UNIQUE)
- `role` (VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Métodos disponibles:**
- `findAll()` - Obtener todos los usuarios
- `findById(id)` - Obtener usuario por ID
- `create(userData)` - Crear nuevo usuario
- `update(id, userData)` - Actualizar usuario
- `delete(id)` - Eliminar usuario
- `findByUsername(username)` - Buscar por nombre de usuario
- `findByEmail(email)` - Buscar por email
- `findByRole(role)` - Buscar usuarios por rol
- `findAdmins()` - Obtener todos los administradores
- `findNormalUsers()` - Obtener todos los usuarios normales
- `updateRole(id, role)` - Actualizar solo el rol de un usuario

### 2. Product (Producto)
**Archivo:** `Product.js`
**Tabla:** `Product`

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Métodos disponibles:**
- `findAll()` - Obtener todos los productos
- `findById(id)` - Obtener producto por ID
- `create(productData)` - Crear nuevo producto
- `update(id, productData)` - Actualizar producto
- `delete(id)` - Eliminar producto
- `findByName(name)` - Buscar por nombre
- `findByDescription(description)` - Buscar por descripción

### 3. Recepcion (Recepción)
**Archivo:** `Recepcion.js`
**Tabla:** `Recepcion`

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `materiaPrima` (VARCHAR(100))
- `control1`, `control2`, `control3` (VARCHAR(50))
- `marca` (VARCHAR(100))
- `proveedor` (VARCHAR(100))
- `cant` (DECIMAL(10,2))
- `nroRemito` (VARCHAR(50) UNIQUE)
- `temp` (DECIMAL(5,2))
- `fechaElaborado` (DATE)
- `fechaVTO` (DATE)
- `lote` (VARCHAR(50))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Métodos disponibles:**
- `findAll()` - Obtener todas las recepciones
- `findById(id)` - Obtener recepción por ID
- `create(recepcionData)` - Crear nueva recepción
- `update(id, recepcionData)` - Actualizar recepción
- `delete(id)` - Eliminar recepción
- `findByMateriaPrima(materiaPrima)` - Buscar por materia prima
- `findByProveedor(proveedor)` - Buscar por proveedor
- `findByLote(lote)` - Buscar por lote
- `findByNroRemito(nroRemito)` - Buscar por número de remito
- `findByFechaRange(fechaInicio, fechaFin)` - Buscar por rango de fechas
- `findByFechaVTO(fechaVTO)` - Buscar por fecha de vencimiento

### 4. Produccion (Producción)
**Archivo:** `Produccion.js`
**Tabla:** `Produccion`

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `producto` (VARCHAR(100))
- `materiaPrima` (VARCHAR(100))
- `lote` (VARCHAR(50))
- `planProduccion` (DECIMAL(10,2))
- `produccion` (DECIMAL(10,2))
- `pesoDescarte` (DECIMAL(10,2))
- `observaciones` (TEXT)
- `comentarios` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Métodos disponibles:**
- `findAll()` - Obtener todas las producciones
- `findById(id)` - Obtener producción por ID
- `create(produccionData)` - Crear nueva producción
- `update(id, produccionData)` - Actualizar producción
- `delete(id)` - Eliminar producción
- `findByProducto(producto)` - Buscar por producto
- `findByMateriaPrima(materiaPrima)` - Buscar por materia prima
- `findByLote(lote)` - Buscar por lote
- `findByPlanProduccion(planProduccion)` - Buscar por plan de producción
- `findByProduccionRange(produccionMin, produccionMax)` - Buscar por rango de producción
- `findByPesoDescarteRange(pesoMin, pesoMax)` - Buscar por rango de descarte
- `getEstadisticasProduccion()` - Obtener estadísticas de producción

### 5. Envasado
**Archivo:** `Envasado.js`
**Tabla:** `Envasado`

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `loteProd` (VARCHAR(50))
- `loteEnvasado` (VARCHAR(50) UNIQUE)
- `producto` (VARCHAR(100))
- `cantEnvases` (INTEGER)
- `cantDescarte` (INTEGER)
- `observaciones` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Métodos disponibles:**
- `findAll()` - Obtener todos los envasados
- `findById(id)` - Obtener envasado por ID
- `create(envasadoData)` - Crear nuevo envasado
- `update(id, envasadoData)` - Actualizar envasado
- `delete(id)` - Eliminar envasado
- `findByProducto(producto)` - Buscar por producto
- `findByLoteProd(loteProd)` - Buscar por lote de producción
- `findByLoteEnvasado(loteEnvasado)` - Buscar por lote de envasado
- `findByCantEnvasesRange(cantMin, cantMax)` - Buscar por rango de envases
- `findByCantDescarteRange(descarteMin, descarteMax)` - Buscar por rango de descarte
- `getEstadisticasEnvasado()` - Obtener estadísticas de envasado
- `getEnvasadosPorLote()` - Obtener envasados agrupados por lote

### 6. ControlPesado (Control de Pesado)
**Archivo:** `ControlPesado.js`
**Tabla:** `ControlPesado`

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `producto` (VARCHAR(100))
- `materiaPrima` (VARCHAR(100))
- `peso` (DECIMAL(10,2))
- `fecha` (DATE)
- `observaciones` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Métodos disponibles:**
- `findAll()` - Obtener todos los controles de pesado
- `findById(id)` - Obtener control por ID
- `create(controlPesadoData)` - Crear nuevo control
- `update(id, controlPesadoData)` - Actualizar control
- `delete(id)` - Eliminar control
- `findByProducto(producto)` - Buscar por producto
- `findByMateriaPrima(materiaPrima)` - Buscar por materia prima
- `findByFecha(fecha)` - Buscar por fecha
- `findByFechaRange(fechaInicio, fechaFin)` - Buscar por rango de fechas
- `findByPesoRange(pesoMin, pesoMax)` - Buscar por rango de peso
- `getEstadisticasPesado()` - Obtener estadísticas de pesado
- `getPesajesPorFecha()` - Obtener pesajes agrupados por fecha
- `getPesajesPorProducto()` - Obtener pesajes agrupados por producto

### 7. Expendio
**Archivo:** `Expendio.js`
**Tabla:** `Expendio`

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `producto` (VARCHAR(100))
- `lote` (VARCHAR(50))
- `destino` (VARCHAR(100))
- `tempTransporte` (DECIMAL(5,2))
- `LimpTransporte` (BOOLEAN)
- `responsable` (VARCHAR(100))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Métodos disponibles:**
- `findAll()` - Obtener todos los expendios
- `findById(id)` - Obtener expendio por ID
- `create(expendioData)` - Crear nuevo expendio
- `update(id, expendioData)` - Actualizar expendio
- `delete(id)` - Eliminar expendio
- `findByProducto(producto)` - Buscar por producto
- `findByLote(lote)` - Buscar por lote
- `findByDestino(destino)` - Buscar por destino
- `findByResponsable(responsable)` - Buscar por responsable
- `findByTempTransporteRange(tempMin, tempMax)` - Buscar por rango de temperatura
- `findByLimpTransporte(limpTransporte)` - Buscar por limpieza de transporte
- `getEstadisticasExpendio()` - Obtener estadísticas de expendio
- `getExpendiosPorDestino()` - Obtener expendios agrupados por destino
- `getExpendiosPorResponsable()` - Obtener expendios agrupados por responsable
- `getExpendiosPorLote()` - Obtener expendios agrupados por lote

## Uso de los Modelos

### Importar modelos
```javascript
const { User, Product, Recepcion, Produccion, Envasado, ControlPesado, Expendio } = require('./models');
```

### Ejemplos de uso

#### Crear un nuevo usuario
```javascript
// Usuario normal (por defecto)
const newUser = await User.create({
  username: 'nuevo_usuario',
  password: 'password123',
  email: 'usuario@ejemplo.com'
});

// Usuario administrador
const newAdmin = await User.create({
  username: 'admin_usuario',
  password: 'admin123',
  email: 'admin@ejemplo.com',
  role: 'admin'
});
```

#### Buscar productos por nombre
```javascript
const productos = await Product.findByName('Yogur');
```

#### Obtener usuarios por rol
```javascript
// Obtener todos los administradores
const admins = await User.findAdmins();

// Obtener todos los usuarios normales
const normalUsers = await User.findNormalUsers();

// Buscar usuarios por rol específico
const usersByRole = await User.findByRole('admin');
```

#### Actualizar rol de usuario
```javascript
// Cambiar un usuario a administrador
const updatedUser = await User.updateRole(userId, 'admin');

// Cambiar un administrador a usuario normal
const demotedUser = await User.updateRole(adminId, 'user');
```

#### Obtener estadísticas de producción
```javascript
const estadisticas = await Produccion.getEstadisticasProduccion();
```

#### Buscar recepciones por rango de fechas
```javascript
const recepciones = await Recepcion.findByFechaRange('2024-01-01', '2024-01-31');
```

## Configuración de Base de Datos

Para crear las tablas en la base de datos, ejecuta el archivo `database/schema.sql` en tu base de datos PostgreSQL.

```bash
psql -d tu_base_de_datos -f database/schema.sql
```

## Características

- **Manejo de errores:** Todos los métodos incluyen manejo de errores con try-catch
- **Validación de datos:** Los modelos validan los datos antes de insertarlos
- **Índices optimizados:** La base de datos incluye índices para mejorar el rendimiento
- **Triggers automáticos:** Los campos `updated_at` se actualizan automáticamente
- **Métodos de búsqueda avanzados:** Incluye métodos para búsquedas complejas y estadísticas
- **Compatibilidad:** Funciona con la configuración actual de PostgreSQL del proyecto 