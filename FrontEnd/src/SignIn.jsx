import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import backgroundImg from './images/background.png';
import { useAuth } from './context/AuthContext';
import { login as loginAPI } from './config/api';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Llamar a la API de autenticación real
      const response = await loginAPI({ email, password });
      
      // Si la autenticación es exitosa, guardar los datos del usuario
      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.username, // Usar username como nombre
        role: response.user.role
      };

      // Pasar tanto los datos del usuario como el token
      login(userData, response.token);
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido, ${userData.name}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/home');
    } catch (error) {      
      let errorMessage = 'Credenciales inválidas. Intenta de nuevo.';
      
      if (error.message && error.message.includes('HTTP error! status: 401')) {
        errorMessage = 'Email o contraseña incorrectos.';
      } else if (error.message && error.message.includes('HTTP error! status: 400')) {
        errorMessage = 'Por favor, completa todos los campos correctamente.';
      } else if (error.message && error.message.includes('HTTP error! status: 503')) {
        errorMessage = 'Servicio no disponible. Verifica tu conexión a internet.';
      } else if (error.message && error.message.includes('HTTP error! status: 500')) {
        errorMessage = 'Error del servidor. Intenta de nuevo en unos momentos.';
      } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }
      
      toast({
        title: 'Error de autenticación',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      backgroundImage={`url(${backgroundImg})`}
    >
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="2xl"
        w="sm"
        transform="scale(1)"
        transition="transform 0.3s"
      >
        <Heading as="h2" size="xl" mb={6} textAlign="center" color="gray.800">
          Bienvenido
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl id="email" isRequired mb={4}>
            <FormLabel>Correo electrónico</FormLabel>
            <Input
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="gray.100"
              borderColor="gray.300"
              _hover={{ borderColor: 'orange.500' }}
              _focus={{ borderColor: 'orange.500', boxShadow: 'outline' }}
            />
          </FormControl>
          <FormControl id="password" isRequired mb={6}>
            <FormLabel>Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="gray.100"
                borderColor="gray.300"
                _hover={{ borderColor: 'orange.500' }}
                _focus={{ borderColor: 'orange.500', boxShadow: 'outline' }}
              />
              <InputRightElement>
                <IconButton
                  aria-label="Mostrar/ocultar contraseña"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Button
            type="submit"
            backgroundColor='#DE8F18'
            color='white'
            w="full"
            size="lg"
            leftIcon={<ViewIcon />}
            _hover={{ bg: 'orange.600' }}
            isLoading={isLoading}
            loadingText="Iniciando sesión..."
          >
            Iniciar sesión
          </Button>
        </form>
      </Box>
    </Box>
    </>
  );
};

export default SignIn;