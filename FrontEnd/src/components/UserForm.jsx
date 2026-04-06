import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Select,
  Box,
  Text,
} from '@chakra-ui/react';

const UserForm = ({ onSubmit, formError }) => {
  const [formData, setFormData] = useState({ username: '', email: '', role: '', password: '' });
  const [showError, setShowError] = useState(false);

  // Efecto para manejar el borrado del error después de 5 segundos
  useEffect(() => {
    if (formError) {
      setShowError(true); // Muestra el error
      const timer = setTimeout(() => {
        setShowError(false); // Borrar el error después de 5 segundos
      }, 5000);
      return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    } else {
      setShowError(false); // Ocultar el error si no hay error
    }
  }, [formError]); // Ejecutar el efecto cuando formError cambie

  const handleSubmit = () => {
    if (formData.username && formData.email && formData.role && formData.password) {
      onSubmit(formData);
      setFormData({ username: '', email: '', role: '', password: '' });
      setShowError(false); // Asegúrate de ocultar el error si el formulario se envía correctamente
    } else {
      setShowError(true); // Asegúrate de mostrar el error si hay campos faltantes
    }
  };

  return (
    <Box p={{ base: 2, md: 4 }} mt={4} rounded="md" shadow="md" bg="gray.50" borderWidth="1px" w="full">
      <VStack spacing={4} align="stretch">
        <FormControl id="username" isRequired>
          <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Nombre de Usuario</FormLabel>
          <Input
            name="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Nombre de usuario"
            fontSize={{ base: 'sm', md: 'md' }}
          />
        </FormControl>
        <FormControl id="email" isRequired>
          <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Email</FormLabel>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email del usuario"
            fontSize={{ base: 'sm', md: 'md' }}
          />
        </FormControl>

        <FormControl id="password" isRequired>
          <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Contraseña</FormLabel>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Contraseña del usuario"
            fontSize={{ base: 'sm', md: 'md' }}
          />
        </FormControl>

        <FormControl id="role" isRequired>
          <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Rol</FormLabel>
          <Select
            name="role"
            placeholder="Seleccionar rol"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            fontSize={{ base: 'sm', md: 'md' }}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </Select>
        </FormControl>

        {showError && (
          <Text color="red.500" fontSize="sm">
            Por favor completa todos los campos antes de agregar el usuario.
          </Text>
        )}

        <Button colorScheme="orange" onClick={handleSubmit} w="full" fontSize={{ base: 'sm', md: 'md' }}>
          Guardar Usuario
        </Button>
      </VStack>
    </Box>
  );
};

export default UserForm;
