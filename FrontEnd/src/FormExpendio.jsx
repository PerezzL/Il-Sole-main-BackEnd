import React from 'react';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import backgroundImg from './images/background.png';
import { createExpendio, getProducts } from './config/api';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Heading,
    VStack,
    Container,
    useToast,
    Select,
    Spinner,
    Text,
  } from "@chakra-ui/react";

const FormExpendio = () => {
    const toast = useToast();

    const [formData, setFormData] = useState({
        producto: "",
        lote: "",
        destino: "",
        tempTransporte: "",
        LimpTransporte: "",
        responsable: "",
    });

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar productos
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoading(true);
                const data = await getProducts();                
                // Filtrar productos únicos por nombre
                const productosUnicos = data.filter((producto, index, self) => 
                    index === self.findIndex(p => p.name === producto.name)
                );
                
                setProductos(productosUnicos);
            } catch (error) {                toast({
                    title: 'Error al cargar productos',
                    description: error.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, [toast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createExpendio(formData);
            toast({
              title: 'Registro guardado correctamente',
              status: 'success',
              duration: 3000,
              isClosable: true,
              position: 'top',
            });
            setFormData({
                producto: "",
                lote: "",
                destino: "",
                tempTransporte: "",
                LimpTransporte: "",
                responsable: "",
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
                Registro de Datos - Expendio
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
                        <FormControl id="producto">
                        <FormLabel>Producto</FormLabel>
                        <Select
                            name="producto"
                            value={formData.producto}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                            isDisabled={loading}
                        >
                            <option value="">Selecciona un producto</option>
                            {productos.map((producto) => (
                                <option key={producto.id} value={producto.name}>
                                    {producto.name}
                                </option>
                            ))}
                        </Select>
                        </FormControl>

                        <FormControl id="lote">
                        <FormLabel>Lote de Produccion</FormLabel>
                        <Input
                            type="text"
                            name="lote"
                            value={formData.lote}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                        />
                        </FormControl>

                        <FormControl id="destino">
                        <FormLabel>Destino</FormLabel>
                        <Input
                            type="text"
                            name="destino"
                            value={formData.destino}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                        />
                        </FormControl>

                        <FormControl id="tempTransporte">
                        <FormLabel>Temperatura del Transporte</FormLabel>
                        <Input
                            type="number"
                            name="tempTransporte"
                            value={formData.tempTransporte}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                        />
                        </FormControl>

                        <FormControl id="limpTransporte">
                        <FormLabel>Limpieza de Transporte</FormLabel>
                        <Select
                            name="LimpTransporte"
                            value={formData.LimpTransporte}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                        >
                            <option value="">Selecciona una opción</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </Select>
                        </FormControl>

                        <FormControl id="responsable">
                        <FormLabel>Responsable del Envio</FormLabel>
                        <Input
                            type="text"
                            name="responsable"
                            value={formData.responsable}
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

export default FormExpendio