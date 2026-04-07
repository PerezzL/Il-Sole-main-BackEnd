import { 
  Box, 
  Button, 
  Flex, 
  useToast, 
  Text, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuDivider,
  Avatar,
} from '@chakra-ui/react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import logo  from '../images/logo.png';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  return (
    <Box w="full">
        <Flex 
          bg="#660033" 
          p={{ base: '8px', sm: 3, md: '1.5%' }} 
          alignItems="center" 
          justifyContent="space-between" 
          flexDirection={{ base: 'row', md: 'row' }}
          position="relative"
          minH={{ base: '60px', md: 'auto' }}
        >
            {/* Logo centrado */}
            <Box 
              position="absolute"
              left="50%"
              top="50%"
              transform="translate(-50%, -50%)"
              zIndex="1"
            >
              <Link to="/home">
                <Box 
                  as="img" 
                  src={logo} 
                  alt="Logo" 
                  boxSize={{ base: '35px', sm: '40px', md: '55px' }}
                  objectFit="contain"
                  transition="all 0.3s ease"
                  _hover={{ transform: 'scale(1.05)' }}
                />
              </Link>
            </Box>

            {/* En móvil: enlace a inicio (el logo centrado puede quedar lejos del pulgar) */}
            <Box flex="1" display="flex" justifyContent="flex-start" alignItems="center" minW={0} zIndex={2}>
              <Link to="/home">
                <Text
                  color="white"
                  fontSize="sm"
                  fontWeight="semibold"
                  display={{ base: 'inline-block', md: 'none' }}
                  px={2}
                  py={1}
                  borderRadius="md"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  Inicio
                </Text>
              </Link>
            </Box>

            {/* Menú de usuario o botón de login - SIEMPRE a la derecha */}
            <Box flex="1" display="flex" justifyContent="flex-end">
              {isAuthenticated ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    backgroundColor="transparent"
                    color="white"
                    _hover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    _active={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                    border="1px solid rgba(255,255,255,0.2)"
                    borderRadius="lg"
                    px={{ base: 2, md: 4 }}
                    py={2}
                    h="auto"
                    minW="auto"
                  >
                    <Flex alignItems="center" gap={{ base: 0, md: 2 }}>
                      <Avatar 
                        size="sm" 
                        name={user?.name || user?.email?.split('@')[0]} 
                        bg="#DE8F18"
                        color="white"
                      />
                      {/* Ocultar nombre en móviles */}
                      <Text 
                        fontSize={{ base: 'sm', md: 'md' }}
                        display={{ base: 'none', md: 'block' }}
                      >
                        {user?.name || user?.email?.split('@')[0]}
                      </Text>
                    </Flex>
                  </MenuButton>
                  <MenuList bg="white" border="1px solid" borderColor="gray.200" boxShadow="xl" borderRadius="md" minW="200px">
                    <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                      <Text fontWeight="bold" fontSize="sm" color="gray.800" mb={1}>
                        {user?.name || user?.email?.split('@')[0]}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {user?.email}
                      </Text>
                    </Box>
                    <MenuDivider />
                    <MenuItem 
                      onClick={handleLogout}
                      color="red.600"
                      _hover={{ backgroundColor: "red.50" }}
                      py={3}
                      px={4}
                    >
                      <Box w={4} h={4} bg="red.500" borderRadius="sm" mr={3} />
                      Cerrar sesión
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Link to='/login'>
                  <Button 
                    backgroundColor="#DE8F18" 
                    color="white" 
                    _hover={{ backgroundColor: "#BF6F15" }} 
                    w={{ base: 'auto', md: 'auto' }} 
                    fontSize={{ base: 'sm', md: 'md' }}
                    size={{ base: 'sm', md: 'md' }}
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              )}
            </Box>
        </Flex>
    </Box>
  )
}

export default Header