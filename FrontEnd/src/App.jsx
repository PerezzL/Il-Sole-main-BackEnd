import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './Homepage';
import FormProduccion from './FormProduccion'
import SignIn from './SignIn';
import FormExpendio from  './FormExpendio';
import AdminPage from './AdminPage';
import ControlEnvasado from './ControlEnvasado';
import Recepcion from './Recepcion';
import FormPesado from './FormPesado';
import FormSemielaborado from './FormSemielaborado';
import TrazabilidadPage from './TrazabilidadPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

// Componente de loading global
const GlobalLoading = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bg="gray.50"
  >
    <VStack spacing={4}>
      <Spinner size="xl" color="orange.500" thickness="4px" />
      <Text color="gray.600" fontSize="lg">Iniciando aplicación...</Text>
    </VStack>
  </Box>
);

// Componente principal de rutas
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading global mientras se verifica la autenticación
  if (isLoading) {
    return <GlobalLoading />;
  }

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route path='/login' element={
        isAuthenticated ? <Navigate to="/home" replace /> : <SignIn />
      } />
      
      {/* Ruta por defecto - redirigir según autenticación */}
      <Route path='/' element={
        isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Rutas protegidas */}
      <Route path='/home' element={
        <ProtectedRoute>
          <Homepage />
        </ProtectedRoute>
      } />
      <Route path='/produccion' element={
        <ProtectedRoute>
          <FormProduccion />
        </ProtectedRoute>
      } />
      <Route path='/expendio' element={
        <ProtectedRoute>
          <FormExpendio />
        </ProtectedRoute>
      } />
      <Route path='/admin' element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />
      <Route path='/productos-envasados' element={
        <ProtectedRoute>
          <ControlEnvasado />
        </ProtectedRoute>
      } />
      <Route path='/recepcion' element={
        <ProtectedRoute>
          <Recepcion />
        </ProtectedRoute>
      } />
      <Route path='/producto-pesados' element={
        <ProtectedRoute>
          <FormPesado />
        </ProtectedRoute>
      } />
      <Route path='/semielaborados' element={
        <ProtectedRoute>
          <FormSemielaborado />
        </ProtectedRoute>
      } />
      <Route path='/trazabilidad' element={
        <ProtectedRoute>
          <TrazabilidadPage />
        </ProtectedRoute>
      } />
      
      {/* Redirigir cualquier ruta no encontrada */}
      <Route path='*' element={
        isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
