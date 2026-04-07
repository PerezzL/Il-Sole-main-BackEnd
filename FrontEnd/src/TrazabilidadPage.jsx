/**
 * ============================================================================
 * PÁGINA: Centro de Trazabilidad
 * ============================================================================
 */

import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TrazabilidadFlujo from './components/TrazabilidadFlujo';
import backgroundImg from './images/background.png';
import { getTrazabilidadByLote } from './config/api';
import { SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  HStack,
  Container,
  useToast,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Flex,
  Icon,
} from "@chakra-ui/react";

const TrazabilidadPage = () => {
  const [loteProduccion, setLoteProduccion] = useState('');
  const [trazabilidadData, setTrazabilidadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleBuscar = async () => {
    if (!loteProduccion.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Ingresa un lote de producción',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setTrazabilidadData(null);

    try {
      const response = await getTrazabilidadByLote(loteProduccion.trim());
      
      if (response.success) {
        setTrazabilidadData(response.data);
        toast({
          title: '✅ Trazabilidad encontrada',
          description: `${response.data.resumen.totalRegistros} registros en ${response.data.resumen.etapasEncontradas} etapas`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      } else {
        throw new Error(response.error || 'Error al obtener trazabilidad');
      }
    } catch (err) {
      setError(err.message || 'Error al buscar trazabilidad');
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleBuscar();
  };

  const handleLimpiar = () => {
    setLoteProduccion('');
    setTrazabilidadData(null);
    setError(null);
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.100">
      <Header />
      
      <Box 
        flex="1" 
        py={6}
        px={4}
        bg="gray.100"
      >
        <Container maxW="1400px" px={{ base: 2, sm: 4 }}>
          {/* BUSCADOR */}
          <Box
            bg="white"
            p={{ base: 4, md: 6 }}
            borderRadius="2xl"
            boxShadow="xl"
            mb={6}
            border="1px solid"
            borderColor="orange.200"
          >
            <VStack spacing={4}>
              <Heading 
                size="lg" 
                color="orange.600"
                display="flex"
                alignItems="center"
                gap={3}
              >
                <Text>🔍</Text>
                Centro de Trazabilidad
              </Heading>
              
              <Text color="gray.600" textAlign="center">
                Ingresa el lote de producción para rastrear todo el proceso productivo
              </Text>

              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                gap={4} 
                w="100%" 
                maxW="700px"
                align="flex-end"
              >
                <FormControl flex={1}>
                  <FormLabel color="gray.700" fontWeight="bold" fontSize="sm">
                    Lote de Producción
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement>
                      <SearchIcon color="orange.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Ej: 20241201, LOTE-001, PROD2024"
                      value={loteProduccion}
                      onChange={(e) => setLoteProduccion(e.target.value)}
                      onKeyPress={handleKeyPress}
                      bg="gray.50"
                      borderColor="orange.300"
                      _hover={{ borderColor: 'orange.400' }}
                      _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px #ED8936' }}
                      isDisabled={loading}
                      borderRadius="xl"
                    />
                  </InputGroup>
                </FormControl>

                <HStack
                  spacing={3}
                  w="100%"
                  justify={{ base: 'stretch', sm: 'flex-start' }}
                  flexDir={{ base: 'column', sm: 'row' }}
                >
                  <Button
                    colorScheme="orange"
                    size="lg"
                    onClick={handleBuscar}
                    isLoading={loading}
                    loadingText="Buscando..."
                    leftIcon={<SearchIcon />}
                    px={{ base: 6, md: 8 }}
                    w={{ base: 'full', sm: 'auto' }}
                    borderRadius="xl"
                    boxShadow="md"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    Buscar
                  </Button>
                  
                  {trazabilidadData && (
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      size="lg"
                      onClick={handleLimpiar}
                      w={{ base: 'full', sm: 'auto' }}
                      borderRadius="xl"
                    >
                      Limpiar
                    </Button>
                  )}
                </HStack>
              </Flex>
            </VStack>
          </Box>

          {/* LOADING */}
          {loading && (
            <Box
              bg="white"
              p={12}
              borderRadius="2xl"
              boxShadow="lg"
              textAlign="center"
            >
              <VStack spacing={6}>
                <Spinner size="xl" color="orange.500" thickness="4px" speed="0.8s" />
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.700">
                    Rastreando cadena productiva...
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    🚚 Expendio → 📦 Envasado → 🏭 Producción → ⚖️ Pesado → 🧪 Semielaborados → 📥 Recepción
                  </Text>
                </VStack>
              </VStack>
            </Box>
          )}

          {/* ERROR */}
          {error && !loading && (
            <Alert 
              status="error" 
              borderRadius="xl" 
              boxShadow="md"
              variant="left-accent"
            >
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Error en la búsqueda</Text>
                <Text fontSize="sm">{error}</Text>
              </Box>
            </Alert>
          )}

          {/* RESULTADOS */}
          {trazabilidadData && !loading && (
            <TrazabilidadFlujo data={trazabilidadData} />
          )}

          {/* GUÍA INICIAL */}
          {!trazabilidadData && !loading && !error && (
            <Box
              bg="white"
              p={8}
              borderRadius="2xl"
              boxShadow="lg"
            >
              <Heading size="md" mb={6} color="gray.700" textAlign="center">
                📋 Flujo de Trazabilidad
              </Heading>
              
              {/* Diagrama visual del flujo */}
              <Flex direction="column" align="center" gap={2}>
                <EtapaGuia 
                  icono="🚚" 
                  titulo="EXPENDIO" 
                  desc="Punto de salida del producto" 
                  color="purple"
                />
                <ConectorGuia label="lote de producción" />
                <EtapaGuia 
                  icono="📦" 
                  titulo="ENVASADO" 
                  desc="Empaquetado del producto" 
                  color="blue"
                />
                <ConectorGuia label="fecha de elaboración" />
                <EtapaGuia 
                  icono="🏭" 
                  titulo="PRODUCCIÓN" 
                  desc="Elaboración del producto" 
                  color="green"
                  destacado
                />
                
                {/* Bifurcación */}
                <Box w="200px" textAlign="center" my={2}>
                  <Flex justify="center">
                    <Box w="2px" h="15px" bg="gray.400" />
                  </Flex>
                  <Box h="2px" bg="gray.400" />
                  <Flex justify="space-between">
                    <Box w="2px" h="15px" bg="gray.400" />
                    <Box w="2px" h="15px" bg="gray.400" />
                  </Flex>
                </Box>
                
                <HStack spacing={8} align="flex-start">
                  <VStack>
                    <Text fontSize="xs" color="gray.500">lote de pesada</Text>
                    <EtapaGuia 
                      icono="⚖️" 
                      titulo="PESADO" 
                      desc="Control de peso" 
                      color="orange"
                      small
                    />
                  </VStack>
                  <VStack>
                    <Text fontSize="xs" color="gray.500">lote materia prima</Text>
                    <EtapaGuia 
                      icono="📥" 
                      titulo="RECEPCIÓN" 
                      desc="Materia prima" 
                      color="teal"
                      small
                    />
                  </VStack>
                </HStack>
              </Flex>

              {/* Leyenda */}
              <Box mt={8} p={4} bg="orange.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  💡 <strong>Tip:</strong> Ingresa un lote como <code>20241201</code>, <code>LOTE-001</code> o el formato que uses en tu sistema
                </Text>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

// Componentes auxiliares para la guía
const EtapaGuia = ({ icono, titulo, desc, color, destacado, small }) => (
  <Box
    bg={`${color}.500`}
    color="white"
    px={small ? 3 : 6}
    py={small ? 2 : 3}
    borderRadius="xl"
    textAlign="center"
    boxShadow={destacado ? 'lg' : 'md'}
    transform={destacado ? 'scale(1.1)' : 'none'}
    border={destacado ? '3px solid' : 'none'}
    borderColor={destacado ? `${color}.300` : 'none'}
  >
    <Text fontSize={small ? "lg" : "2xl"}>{icono}</Text>
    <Text fontWeight="bold" fontSize={small ? "xs" : "sm"}>{titulo}</Text>
    {!small && <Text fontSize="xs" opacity={0.9}>{desc}</Text>}
  </Box>
);

const ConectorGuia = ({ label }) => (
  <VStack spacing={0}>
    <Box w="2px" h="10px" bg="gray.400" />
    <Box 
      bg="gray.100" 
      px={3} 
      py={1} 
      borderRadius="full" 
      fontSize="xs" 
      color="gray.600"
      border="1px solid"
      borderColor="gray.300"
    >
      ↓ {label}
    </Box>
    <Box w="2px" h="10px" bg="gray.400" />
  </VStack>
);

export default TrazabilidadPage;
