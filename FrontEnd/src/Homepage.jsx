import React from 'react';
import  { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Heading, Text, Grid } from '@chakra-ui/react';
import backgroundImg from './images/background.png';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { useAuth } from './context/AuthContext';


const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
        <Box backgroundImage={`url(${backgroundImg})`}
          backgroundSize="cover"
          backgroundPosition="center"
          minH={{ base: 'auto', md: '40vh' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="md"
          px={{ base: 2, md: 0 }}
          py={{ base: 4, md: 6 }}>
          <Flex direction="column" alignItems="center" py={{ base: 4, md: 6 }} w="full">
            <Heading as="h1" fontSize={{ base: '2xl', md: '5xl' }} mb={2} textAlign="center">
            IL Sole
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} mb={4} textAlign="center">
            Registro de Datos
            </Text>
          </Flex>
        </Box>

        <Box flex="1" display="flex" alignItems="center" w="100%" maxW="container.xl" mx="auto">
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
            gap={{ base: 3, md: 4 }}
            w="100%"
            px={{ base: 3, sm: 4, md: 6 }}
            py={{ base: 4, md: 6 }}
          >
            <Button onClick={() => handleNavigation('/recepcion')} backgroundColor="#DE8F18" minH={{ base: '52px', md: '120px' }} py={{ base: 3, md: 4 }} px={2} whiteSpace="normal" lineHeight="short" _hover={{ backgroundColor: "#BF6F15" }} fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} w="full">RECEPCION DE MERCADERIA</Button>
            <Button onClick={() => handleNavigation('/semielaborados')} backgroundColor="#DE8F18" minH={{ base: '52px', md: '120px' }} py={{ base: 3, md: 4 }} px={2} whiteSpace="normal" lineHeight="short" _hover={{ backgroundColor: "#BF6F15" }} fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} w="full">SEMIELABORADOS</Button>
            <Button onClick={() => handleNavigation('/produccion')} backgroundColor="#DE8F18" minH={{ base: '52px', md: '120px' }} py={{ base: 3, md: 4 }} px={2} whiteSpace="normal" lineHeight="short" _hover={{ backgroundColor: "#BF6F15" }} fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} w="full">PRODUCCION</Button>
            <Button onClick={() => handleNavigation('/producto-pesados')} backgroundColor="#DE8F18" minH={{ base: '52px', md: '120px' }} py={{ base: 3, md: 4 }} px={2} whiteSpace="normal" lineHeight="short" _hover={{ backgroundColor: "#BF6F15" }} fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} w="full">PRODUCTOS PESADOS</Button>
            <Button onClick={() => handleNavigation('/productos-envasados')} backgroundColor="#DE8F18" minH={{ base: '52px', md: '120px' }} py={{ base: 3, md: 4 }} px={2} whiteSpace="normal" lineHeight="short" _hover={{ backgroundColor: "#BF6F15" }} fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} w="full">PRODUCTOS ENVASADOS</Button>
            <Button onClick={() => handleNavigation('/expendio')} backgroundColor="#DE8F18" minH={{ base: '52px', md: '120px' }} py={{ base: 3, md: 4 }} px={2} whiteSpace="normal" lineHeight="short" _hover={{ backgroundColor: "#BF6F15" }} fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} w="full">CONTROL EXPENDIO</Button>
            {user?.role === 'admin' && (
              <Button onClick={() => handleNavigation('/admin')} backgroundColor="#DE8F18" minH={{ base: '52px', md: '120px' }} py={{ base: 3, md: 4 }} px={2} whiteSpace="normal" lineHeight="short" _hover={{ backgroundColor: "#BF6F15" }} fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} w="full">PANEL DE ADMINISTRADOR</Button>
            )}
          </Grid>
        </Box>
      <Footer />
    </Box>
  )
}

export default Homepage;