import React, { useState, useEffect } from 'react';
import { Box, Button, Container, FormControl, FormLabel, Input, Select, Heading, VStack, useToast, Spinner, Text, HStack } from '@chakra-ui/react';
import backgroundImg from '../images/background.png';
import { createSemielaborado, getMateriasPrimas } from '../config/api';

const Semielaborado = () => {
  const [formData, setFormData] = useState({
    semielaborado: '',
    ingrediente: '',
    loteMateriaPrima: '',
    lote: '',
    peso: '',
    fecha: '',
    observaciones: '',
  });

  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);

  const toast = useToast();

  // Cargar materias primas disponibles
  useEffect(() => {
    const fetchMateriasPrimas = async () => {
      try {
        setLoadingMaterias(true);
        const data = await getMateriasPrimas();        
        // Filtrar solo materias primas activas
        const materiasActivas = data.filter(mp => mp.activo !== false);
        
        setMateriasPrimas(materiasActivas);
      } catch (error) {        toast({
          title: 'Error al cargar materias primas',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingMaterias(false);
        setLoading(false);
      }
    };

    fetchMateriasPrimas();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSemielaborado(formData);
      toast({
        title: 'Registro guardado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setFormData({
        semielaborado: '',
        ingrediente: '',
        loteMateriaPrima: '',
        lote: '',
        peso: '',
        fecha: '',
        observaciones: '',
      });
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  return (
    <Box backgroundImage={`url(${backgroundImg})`} minH="calc(100vh - 60px)" display="flex" alignItems="center">
      <Container maxW={{ base: '100%', md: '800px' }} p={{ base: 2, md: 10 }}>
        <Box bg="orange.200" p={{ base: 4, md: 8 }} borderRadius="md" boxShadow="lg" borderColor="orange.600" borderWidth="1px" position="relative" mx="auto">
          <Heading mb={6} textAlign="center" color="orange.800" fontSize={{ base: '2xl', md: '3xl' }}>
            Semielaborados
          </Heading>
          <Text mb={4} textAlign="center" color="orange.700" fontSize="sm">
            Pesado de ingredientes para semielaborados
          </Text>
          
          {/* Spinner de carga como overlay */}
          {loading && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="rgba(255, 255, 255, 0.8)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
              zIndex="10"
            >
              <VStack spacing={3}>
                <Spinner size="lg" color="orange.500" thickness="4px" />
                <Text color="orange.700" fontWeight="medium">Cargando datos...</Text>
              </VStack>
            </Box>
          )}
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} w="full">
              <FormControl id="semielaborado" isRequired>
                <FormLabel>Semielaborado</FormLabel>
                <Input
                  type="text"
                  name="semielaborado"
                  value={formData.semielaborado}
                  onChange={handleChange}
                  placeholder="Ej: Masa para pizza, Queso rallado, etc."
                  bg="white"
                  w="full"
                  isDisabled={loading}
                />
              </FormControl>
              
              <FormControl id="ingrediente" isRequired>
                <FormLabel>Ingrediente / Materia Prima</FormLabel>
                <Select
                  name="ingrediente"
                  value={formData.ingrediente}
                  onChange={handleChange}
                  placeholder="Selecciona un ingrediente"
                  bg="white"
                  w="full"
                  isDisabled={loading || loadingMaterias}
                >
                  {loadingMaterias ? (
                    <option value="">Cargando ingredientes...</option>
                  ) : materiasPrimas.length === 0 ? (
                    <option value="">No hay ingredientes disponibles</option>
                  ) : (
                    materiasPrimas.map((materia) => (
                      <option key={materia.id} value={materia.nombre}>
                        {materia.nombre}
                      </option>
                    ))
                  )}
                </Select>
              </FormControl>
              
              <FormControl id="loteMateriaPrima">
                <FormLabel>Lote de Materia Prima</FormLabel>
                <Input
                  type="text"
                  name="loteMateriaPrima"
                  value={formData.loteMateriaPrima}
                  onChange={handleChange}
                  placeholder="Lote de la materia prima utilizada"
                  bg="white"
                  w="full"
                  isDisabled={loading}
                />
              </FormControl>
              
              <FormControl id="lote">
                <FormLabel>Lote del Semielaborado</FormLabel>
                <Input
                  type="text"
                  name="lote"
                  value={formData.lote}
                  onChange={handleChange}
                  placeholder="Lote generado del semielaborado"
                  bg="white"
                  w="full"
                  isDisabled={loading}
                />
              </FormControl>
              
              <FormControl id="peso" isRequired>
                <FormLabel>Peso (kg)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  bg="white"
                  w="full"
                  isDisabled={loading}
                />
              </FormControl>
              
              <FormControl id="fecha" isRequired>
                <FormLabel>Fecha de Pesado</FormLabel>
                <Input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  bg="white"
                  w="full"
                  isDisabled={loading}
                />
              </FormControl>
              
              <FormControl id="observaciones">
                <FormLabel>Observaciones</FormLabel>
                <Input
                  type="text"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  bg="white"
                  w="full"
                  isDisabled={loading}
                />
              </FormControl>
              
              <Button colorScheme="orange" type="submit" size="lg" w="full" isDisabled={loading}>
                {loading ? (
                  <HStack>
                    <Spinner size="sm" />
                    <Text>Guardando...</Text>
                  </HStack>
                ) : (
                  'Guardar'
                )}
              </Button>
            </VStack>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default Semielaborado;
