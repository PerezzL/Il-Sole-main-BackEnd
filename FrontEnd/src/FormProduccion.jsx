import React from 'react';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import backgroundImg from './images/background.png';
import { createProduction, getProducts, getMateriasPrimasByProducto } from './config/api';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Heading,
    VStack,
    HStack,
    Container,
    useToast,
    Spinner,
    Text,
  } from "@chakra-ui/react";

const FormProduccion = () => {

    const [formData, setFormData] = useState({
        producto: "",
        materiaPrima: "",
        lote: "",
        planProduccion: "",
        produccion: "",
        pesoDescarte: "",
        observaciones: "",
        comentarios: "",
      });

    const [productos, setProductos] = useState([]);
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingMaterias, setLoadingMaterias] = useState(false);

    const toast = useToast();

    // Cargar productos
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoadingProducts(true);
                const data = await getProducts();                
                // Eliminar duplicados basados en el nombre
                const productosUnicos = data.filter((producto, index, self) => 
                    index === self.findIndex((p) => p.name === producto.name)
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
                setLoadingProducts(false);
            }
        };

        fetchProductos();
    }, [toast]);

    // Cargar materias primas del producto seleccionado
    const fetchMateriasPrimasByProducto = async (productoNombre) => {
        try {
            setLoadingMaterias(true);
            setMateriasPrimas([]); // Limpiar materias primas anteriores
            
            if (!productoNombre) {
                setLoadingMaterias(false);
                return;
            }

            // Encontrar el producto por nombre para obtener su ID
            const producto = productos.find(p => p.name === productoNombre);
            if (!producto) {                setLoadingMaterias(false);
                return;
            }

            const data = await getMateriasPrimasByProducto(producto.id);            
            setMateriasPrimas(data);
        } catch (error) {            toast({
                title: 'Error al cargar materias primas',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoadingMaterias(false);
        }
    };

    // Actualizar loading general
    useEffect(() => {
        setLoading(loadingProducts || loadingMaterias);
    }, [loadingProducts, loadingMaterias]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Si se cambia el producto, cargar sus materias primas
        if (name === 'producto') {
            // Limpiar materia prima seleccionada cuando cambia el producto
            setFormData(prev => ({ ...prev, [name]: value, materiaPrima: "" }));
            fetchMateriasPrimasByProducto(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {            const result = await createProduction(formData);            toast({
              title: 'Registro guardado correctamente',
              status: 'success',
              duration: 3000,
              isClosable: true,
              position: 'top',
            });
            setFormData({
                producto: "",
                materiaPrima: "",
                lote: "",
                planProduccion: "",
                produccion: "",
                pesoDescarte: "",
                observaciones: "",
                comentarios: "",
            });
            // Limpiar también las materias primas
            setMateriasPrimas([]);
        } catch (error) {            toast({
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
                position="relative"
                mx="auto"
            >
                <Heading mb={6} textAlign="center" color="orange.800" fontSize={{ base: '2xl', md: '3xl' }}>
                Registro de Datos - Producción
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
                        <HStack spacing={4} align="start" mb={4} flexWrap="wrap" w="full">
                            <FormControl id="producto" w={{ base: '100%', md: '50%' }}>
                            <FormLabel>Producto</FormLabel>
                            <Select
                                name="producto"
                                value={formData.producto}
                                onChange={handleChange}
                                placeholder="Seleccionar"
                                bg="white"
                                w="full"
                                isDisabled={loading}
                            >
                                {loadingProducts ? (
                                    <option value="">Cargando productos...</option>
                                ) : (
                                    productos.map((producto) => (
                                        <option key={producto.id} value={producto.name}>
                                            {producto.name}
                                        </option>
                                    ))
                                )}
                            </Select>
                            </FormControl>

                            <FormControl id="materiaPrima" w={{ base: '100%', md: '50%' }}>
                            <FormLabel>Materia Prima</FormLabel>
                            <Select
                                name="materiaPrima"
                                value={formData.materiaPrima}
                                onChange={handleChange}
                                placeholder={formData.producto ? "Seleccionar materia prima" : "Primero seleccione un producto"}
                                bg="white"
                                w="full"
                                isDisabled={!formData.producto || loading}
                            >
                                {loadingMaterias ? (
                                    <option value="">Cargando materias primas...</option>
                                ) : materiasPrimas.length === 0 && formData.producto ? (
                                    <option value="">No hay materias primas para este producto</option>
                                ) : (
                                    materiasPrimas.map((materia) => (
                                        <option key={materia.materia_prima_id} value={materia.materia_prima_nombre}>
                                            {materia.materia_prima_nombre}
                                        </option>
                                    ))
                                )}
                            </Select>
                            </FormControl>
                        </HStack>
                        <FormControl id="lote">
                        <FormLabel>Lote de MP/PREP</FormLabel>
                        <Input
                            type="text"
                            name="lote"
                            value={formData.lote}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                            isDisabled={loading}
                        />
                        </FormControl>

                        <FormControl id="produccion">
                        <FormLabel>Producción</FormLabel>
                        <Input
                            type="text"
                            name="produccion"
                            value={formData.produccion}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                            isDisabled={loading}
                        />
                        </FormControl>

                        <FormControl id="planProduccion">
                        <FormLabel>Plan de Producción</FormLabel>
                        <Input
                            type="text"
                            name="planProduccion"
                            value={formData.planProduccion}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                            isDisabled={loading}
                        />
                        </FormControl>

                        <FormControl id="pesoDescarte">
                        <FormLabel>Peso de Descarte</FormLabel>
                        <Input
                            type="number"
                            name="pesoDescarte"
                            value={formData.pesoDescarte}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                            isDisabled={loading}
                        />
                        </FormControl>

                        <FormControl id="observaciones">
                        <FormLabel>Fecha de Envasado</FormLabel>
                        <Input
                            type="date"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            bg="white"
                            w="full"
                            isDisabled={loading}
                        />
                        </FormControl>

                        <FormControl id="comentarios">
                        <FormLabel>Comentarios</FormLabel>
                        <Textarea
                            name="comentarios"
                            value={formData.comentarios}
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
                            'Enviar'
                        )}
                        </Button>
                    </VStack>
                </form>
            </Box>
            </Container>
        </Box>
        <Footer />
    </Box>
);
};

export default FormProduccion;