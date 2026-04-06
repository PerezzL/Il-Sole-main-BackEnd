import React from 'react';
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import backgroundImg from './images/background.png';
import { createRecepcion, getMateriasPrimas } from './config/api';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Heading,
    VStack,
    HStack,
    Container,
    useToast,
    Spinner,
    Text,
  } from "@chakra-ui/react";

const Recepcion = () => {

    const [formData, setFormData] = useState({
        materiaPrima: "",
        control1: "",
        control2: "",
        control3: "",
        marca:"",
        proveedor: "",
        cant: "",
        nroRemito:"",
        temp: "",
        fechaElaborado: "",
        fechaVTO: "",
        lote: "",
      });

    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [loading, setLoading] = useState(true);

    const toast = useToast();

    // Cargar materias primas al montar el componente
    React.useEffect(() => {
        const fetchMateriasPrimas = async () => {
            try {
                setLoading(true);
                const data = await getMateriasPrimas();                setMateriasPrimas(data);
            } catch (error) {                toast({
                    title: 'Error al cargar materias primas',
                    description: error.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
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
            await createRecepcion(formData);
            toast({
              title: 'Registro guardado correctamente',
              status: 'success',
              duration: 3000,
              isClosable: true,
              position: 'top',
            });
            setFormData({
                materiaPrima: "",
                control1: "",
                control2: "",
                control3: "",
                marca: "",
                proveedor: "",
                cant: "",
                nroRemito: "",
                temp: "",
                fechaElaborado: "",
                fechaVTO: "",
                lote: "",
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
    <Box minH="100vh" display="flex" flexDirection="column">
    <Header />
      <Box backgroundImage={`url(${backgroundImg})`} flex="1" display="flex" alignItems="center">
          <Container maxW={{ base: '100%', md: '800px' }} p={{ base: 2, md: 10 }}>
          <Box
              bg="orange.200"
              p={{ base: 4, md: 8 }}
              borderRadius="md"
              boxShadow="lg"
              borderColor="orange.600"
              borderWidth="1px"
              mx="auto"
              position="relative"
          >
              <Heading mb={6} textAlign="center" color="orange.800" fontSize={{ base: '2xl', md: '3xl' }}>
              Registro de Datos - Recepción
              </Heading>
              
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
                      <FormControl id="materiaPrima">
                      <FormLabel>Materia Prima</FormLabel>
                      <Select
                          name="materiaPrima"
                          value={formData.materiaPrima}
                          onChange={handleChange}
                          placeholder="Selecciona una materia prima"
                          bg="white"
                          w="full"
                          isDisabled={loading}
                      >
                          {materiasPrimas.map((materia) => (
                              <option key={materia.id} value={materia.nombre}>
                                  {materia.nombre}
                              </option>
                          ))}
                      </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Control</FormLabel>
                        <HStack spacing={2} align="start" mb={4} flexWrap="wrap">
                            <Select
                            name="control1"
                            value={formData.control1}
                            onChange={handleChange}
                            placeholder="Transporte"
                            bg="white"
                            w={{ base: '100%', md: '33%' }}
                            >
                            <option value="OK">OK</option>
                            <option value="Mal estado">Mal estado</option>
                            </Select>

                            <Select
                            name="control2"
                            value={formData.control2}
                            onChange={handleChange}
                            placeholder="Envase"
                            bg="white"
                            w={{ base: '100%', md: '33%' }}
                            >
                            <option value="OK">OK</option>
                            <option value="Mal estado">Mal estado</option>
                            </Select>

                            <Select
                            name="control3"
                            value={formData.control3}
                            onChange={handleChange}
                            placeholder="Rotulado"
                            bg="white"
                            w={{ base: '100%', md: '33%' }}
                            >
                            <option value="OK">OK</option>
                            <option value="Mal estado">Mal estado</option>
                            </Select>
                        </HStack>
                      </FormControl>

                      <FormControl id="marca">
                      <FormLabel>Marca</FormLabel>
                      <Input
                          type="text"
                          name="marca"
                          value={formData.marca}
                          onChange={handleChange}
                          bg="white"
                          w="full"
                      />
                      </FormControl>

                      <FormControl id="proveedor">
                      <FormLabel>Proveedor</FormLabel>
                      <Input
                          type="text"
                          name="proveedor"
                          value={formData.proveedor}
                          onChange={handleChange}
                          bg="white"
                          w="full"
                      />
                      </FormControl>

                      <FormControl id="cant">
                      <FormLabel>Cantidad</FormLabel>
                      <Input
                          type="number"
                          name="cant"
                          value={formData.cant}
                          onChange={handleChange}
                          bg="white"
                          w="full"
                      />
                      </FormControl>

                      <FormControl id="nroRemito">
                      <FormLabel>Nro° Remito</FormLabel>
                      <Input
                          type="text"
                          name="nroRemito"
                          value={formData.nroRemito}
                          onChange={handleChange}
                          bg="white"
                          w="full"
                      />
                      </FormControl>

                      <FormControl id="temp">
                      <FormLabel>Temperatura</FormLabel>
                      <Input
                          type="number"
                          name="temp"
                          value={formData.temp}
                          onChange={handleChange}
                          bg="white"
                          w="full"
                      />
                      </FormControl>

                      <FormControl id="fechaElaborado">
                      <FormLabel>Fecha de Elaborado</FormLabel>
                      <Input
                          type="date"
                          name="fechaElaborado"
                          value={formData.fechaElaborado}
                          onChange={handleChange}
                          bg="white"
                          w="full"
                      />
                      </FormControl>

                      <FormControl id="fechaVTO">
                      <FormLabel>Fecha de Vencimiento</FormLabel>
                      <Input
                          type="date"
                          name="fechaVTO"
                          value={formData.fechaVTO}
                          onChange={handleChange}
                          bg="white"
                          w="full"
                      />
                      </FormControl>

                      <FormControl id="lote">
                      <FormLabel>Lote</FormLabel>
                      <Input
                          type="text"
                          name="lote"
                          value={formData.lote}
                          onChange={handleChange}
                          bg="white"
                          w="full"
                      />
                      </FormControl>

                      <Button colorScheme="orange" type="submit" size="lg" w="full">
                      Enviar
                      </Button>
                  </VStack>
              </form>
          </Box>
          </Container>
      </Box>
      <Footer />
  </Box>
  )
}

export default Recepcion