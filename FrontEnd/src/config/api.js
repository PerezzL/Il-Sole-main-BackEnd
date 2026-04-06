import { useState } from 'react';

const rawBase = import.meta.env.VITE_API_URL;
/** Misma URL que el front + `/api` en Vercel; o `VITE_API_URL` explícita; en dev, localhost:5000. */
export const API_BASE_URL = rawBase
  ? `${String(rawBase).replace(/\/$/, '')}/api`
  : import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : '/api';

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Obtener el token del localStorage
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  // Agregar el token de autorización si existe
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = { ...defaultOptions, ...options };
  
  // Asegurar que los headers se combinen correctamente
  if (options.headers) {
    config.headers = { ...defaultOptions.headers, ...options.headers };
  }
  
  // Función para reintentar en caso de error de red
  const makeRequest = async (retryCount = 0) => {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // No limpiar localStorage aquí; AuthContext maneja la verificación
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Reintentar solo errores de red, máximo 2 reintentos
      if (
        (error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError')) &&
        retryCount < 2
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return makeRequest(retryCount + 1);
      }
      throw error;
    }
  };
  
  try {
    return await makeRequest();
  } catch (error) {
    throw error;
  }
};

// ============================================================================
// PRODUCTOS
// ============================================================================
export const getProducts = () => apiRequest('/products');
export const createProduct = (data) => apiRequest('/products', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateProduct = (id, data) => apiRequest(`/products/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteProduct = (id) => apiRequest(`/products/${id}`, {
  method: 'DELETE'
});

// ============================================================================
// PRODUCTOS CON MATERIAS PRIMAS
// ============================================================================
export const getProductoMateriaPrima = () => apiRequest('/producto-materia-prima');
export const getMateriasPrimasByProducto = (productoId) => apiRequest(`/producto-materia-prima/producto/${productoId}`);
export const getProductosByMateriaPrima = (materiaPrimaId) => apiRequest(`/producto-materia-prima/materia-prima/${materiaPrimaId}`);
export const getReceta = (productoId) => apiRequest(`/producto-materia-prima/receta/${productoId}`);

export const createProductoMateriaPrima = (data) => apiRequest('/producto-materia-prima', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const createMultipleProductoMateriaPrima = (data) => apiRequest('/producto-materia-prima/multiple', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const updateProductoMateriaPrima = (id, data) => apiRequest(`/producto-materia-prima/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const deleteProductoMateriaPrima = (id) => apiRequest(`/producto-materia-prima/${id}`, {
  method: 'DELETE'
});

// ============================================================================
// GESTIÓN COMPLETA DE PRODUCTOS
// ============================================================================

// Obtener todos los productos con sus materias primas
export const getAllProductosConMateriasPrimas = () => apiRequest('/producto-materia-prima/productos/completos');

// Actualizar producto completo (nombre, descripción y materias primas)
export const updateProductoCompleto = (productoId, data) => apiRequest(`/producto-materia-prima/producto/${productoId}/completo`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

// Eliminar producto completo
export const deleteProductoCompleto = (productoId) => apiRequest(`/producto-materia-prima/producto/${productoId}/completo`, {
  method: 'DELETE'
});

// Agregar materia prima a un producto existente
export const agregarMateriaPrimaAProducto = (productoId, data) => apiRequest(`/producto-materia-prima/producto/${productoId}/materia-prima`, {
  method: 'POST',
  body: JSON.stringify(data)
});

// Eliminar materia prima de un producto
export const eliminarMateriaPrimaDeProducto = (productoId, materiaPrimaId) => apiRequest(`/producto-materia-prima/producto/${productoId}/materia-prima/${materiaPrimaId}`, {
  method: 'DELETE'
});

// ============================================================================
// MATERIA PRIMA
// ============================================================================
export const getMateriasPrimas = () => apiRequest('/materia-prima');
export const getActiveMateriasPrimas = () => apiRequest('/materia-prima/active');
export const createMateriaPrima = (data) => apiRequest('/materia-prima', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateMateriaPrima = (id, data) => apiRequest(`/materia-prima/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteMateriaPrima = (id) => apiRequest(`/materia-prima/${id}`, {
  method: 'DELETE'
});
export const searchMateriasPrimas = (nombre) => apiRequest(`/materia-prima/search?nombre=${nombre}`);
export const getMateriasPrimasByCategoria = (categoria) => apiRequest(`/materia-prima/categoria/${categoria}`);
export const testMateriaPrimaTable = () => apiRequest('/materia-prima/test');
export const testDatabaseConnection = () => apiRequest('/materia-prima/test-db');

// ============================================================================
// AUTENTICACIÓN
// ============================================================================
export const login = (credentials) => apiRequest('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});

export const verifyAuth = () => apiRequest('/auth/verify');

// ============================================================================
// USUARIOS
// ============================================================================
export const getUsers = () => apiRequest('/users');
export const createUser = (data) => apiRequest('/users', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateUser = (id, data) => apiRequest(`/users/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteUser = (id) => apiRequest(`/users/${id}`, {
  method: 'DELETE'
});

// ============================================================================
// PRODUCCIÓN
// ============================================================================
export const getProduction = () => apiRequest('/production');
export const createProduction = (data) => apiRequest('/production', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateProduction = (id, data) => apiRequest(`/production/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteProduction = (id) => apiRequest(`/production/${id}`, {
  method: 'DELETE'
});

// ============================================================================
// CONTROL PESADO
// ============================================================================
export const getControlPesado = () => apiRequest('/control-pesado');
export const createControlPesado = (data) => apiRequest('/control-pesado', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateControlPesado = (id, data) => apiRequest(`/control-pesado/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteControlPesado = (id) => apiRequest(`/control-pesado/${id}`, {
  method: 'DELETE'
});

// ============================================================================
// SEMIELABORADOS
// ============================================================================
export const getSemielaborados = () => apiRequest('/semielaborado');
export const createSemielaborado = (data) => apiRequest('/semielaborado', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateSemielaborado = (id, data) => apiRequest(`/semielaborado/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteSemielaborado = (id) => apiRequest(`/semielaborado/${id}`, {
  method: 'DELETE'
});

// ============================================================================
// ENVASADO
// ============================================================================
export const getEnvasado = () => apiRequest('/envasado');
export const createEnvasado = (data) => apiRequest('/envasado', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateEnvasado = (id, data) => apiRequest(`/envasado/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteEnvasado = (id) => apiRequest(`/envasado/${id}`, {
  method: 'DELETE'
});

// ============================================================================
// RECEPCIÓN
// ============================================================================
export const getRecepcion = () => apiRequest('/recepcion');
export const createRecepcion = (data) => apiRequest('/recepcion', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateRecepcion = (id, data) => apiRequest(`/recepcion/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteRecepcion = (id) => apiRequest(`/recepcion/${id}`, {
  method: 'DELETE'
});

// ============================================================================
// EXPENDIO
// ============================================================================
export const getExpendio = () => apiRequest('/expendio');
export const createExpendio = (data) => apiRequest('/expendio', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateExpendio = (id, data) => apiRequest(`/expendio/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteExpendio = (id) => apiRequest(`/expendio/${id}`, {
  method: 'DELETE'
});


// FUNCIONES PARA GESTIÓN DE REGISTROS
// ============================================================================

// Función genérica para obtener registros por sector
export const getRegistrosBySector = (sector) => {
  const endpoints = {
    'recepcion': getRecepcion,
    'production': getProduction,
    'envasado': getEnvasado,
    'control-pesado': getControlPesado,
    'semielaborado': getSemielaborados,
    'expendio': getExpendio
  };
  
  const endpointFunction = endpoints[sector];
  if (!endpointFunction) {
    throw new Error(`Sector no válido: ${sector}`);
  }
  
  return endpointFunction();
};

// Función para eliminar registros por sector
export const deleteRegistroBySector = (sector, id) => {
  const endpoints = {
    'recepcion': deleteRecepcion,
    'production': deleteProduction,
    'envasado': deleteEnvasado,
    'control-pesado': deleteControlPesado,
    'semielaborado': deleteSemielaborado,
    'expendio': deleteExpendio
  };
  
  const endpointFunction = endpoints[sector];
  if (!endpointFunction) {
    throw new Error(`Sector no válido: ${sector}`);
  }
  
  return endpointFunction(id);
};

// Función para actualizar registros por sector
export const updateRegistroBySector = (sector, id, data) => {
  const endpoints = {
    'recepcion': updateRecepcion,
    'production': updateProduction,
    'envasado': updateEnvasado,
    'control-pesado': updateControlPesado,
    'semielaborado': updateSemielaborado,
    'expendio': updateExpendio
  };
  
  const endpointFunction = endpoints[sector];
  if (!endpointFunction) {
    throw new Error(`Sector no válido: ${sector}`);
  }
  
  return endpointFunction(id, data);
};

// ============================================================================
// TRAZABILIDAD
// ============================================================================

/**
 * Obtener trazabilidad completa por lote de producción
 * Este es el endpoint principal para consultar la trazabilidad.
 * 
 * FLUJO: EXPENDIO → ENVASADO → PRODUCCIÓN → PESADO → RECEPCIÓN
 * 
 * @param {string} loteProduccion - El lote de producción a rastrear
 * @returns {Object} Trazabilidad completa con todos los registros relacionados
 */
export const getTrazabilidadByLote = (loteProduccion) => 
  apiRequest(`/trazabilidad/lote/${encodeURIComponent(loteProduccion)}`);

/**
 * Obtener trazabilidad desde un registro específico
 * @param {string} tipo - Tipo de tabla (expendio, envasado, produccion, pesado, recepcion)
 * @param {number} id - ID del registro
 */
export const getTrazabilidadByRegistro = (tipo, id) => 
  apiRequest(`/trazabilidad/${tipo}/${id}`);

/**
 * Buscar registros por lote en todas las tablas
 * @param {string} lote - Número de lote a buscar
 */
export const buscarPorLote = (lote) => 
  apiRequest(`/trazabilidad/buscar/${encodeURIComponent(lote)}`);

// ============================================================================
// HEALTH CHECK
// ============================================================================
export const testConnection = () => apiRequest('/health');
export const testDatabaseConnectionSimple = () => apiRequest('/db-test');

// ============================================================================
// HOOK PERSONALIZADO PARA MANEJAR ESTADOS DE CARGA Y ERROR
// ============================================================================
export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeRequest = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executeRequest };
}; 