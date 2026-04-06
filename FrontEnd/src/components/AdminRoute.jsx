import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Text, VStack, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero no es admin, mostrar mensaje de acceso denegado
  if (user && user.role !== 'admin') {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="gray.50"
      >
        <VStack spacing={6} p={8} bg="white" rounded="lg" shadow="lg" maxW="md">
          <Text fontSize="6xl">🚫</Text>
          <Text fontSize="2xl" fontWeight="bold" color="red.500" textAlign="center">
            Acceso Denegado
          </Text>
          <Text fontSize="lg" color="gray.600" textAlign="center">
            Esta sección está restringida solo para administradores.
          </Text>
          <Text fontSize="md" color="gray.500" textAlign="center">
            Tu rol actual: <Text as="span" fontWeight="bold" color="blue.500">{user.role}</Text>
          </Text>
          <Button 
            as={Link} 
            to="/home" 
            colorScheme="blue" 
            size="lg"
          >
            Volver al Inicio
          </Button>
        </VStack>
      </Box>
    );
  }

  // Si es admin, permitir acceso
  return children;
};

export default AdminRoute; 