import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  Text,
  useToast,
  Select,
  Divider,
  Heading,
  Badge,
  Flex,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { createProductoMateriaPrima, createMultipleProductoMateriaPrima, getActiveMateriasPrimas } from '../config/api';

const ProductoMateriaPrimaForm = ({ onSubmit, onCancel, formError }) => {
  const [formData, setFormData] = useState({
    producto: {
      nombre: ''
    },
    materias_primas: []
  });
  
  const [materiasPrimasDisponibles, setMateriasPrimasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMultipleForm, setShowMultipleForm] = useState(false);
  const toast = useToast();

  // Cargar materias primas disponibles
  useEffect(() => {
    const fetchMateriasPrimas = async () => {
      try {
        const data = await getActiveMateriasPrimas();
        setMateriasPrimasDisponibles(data);
      } catch (error) {      }
    };
    fetchMateriasPrimas();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      producto: {
        ...prev.producto,
        [field]: value
      }
    }));
  };

  const addMateriaPrima = () => {
    setFormData(prev => ({
      ...prev,
      materias_primas: [
        ...prev.materias_primas,
        {
          nombre: ''
        }
      ]
    }));
  };

  const removeMateriaPrima = (index) => {
    setFormData(prev => ({
      ...prev,
      materias_primas: prev.materias_primas.filter((_, i) => i !== index)
    }));
  };

  const updateMateriaPrima = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      materias_primas: prev.materias_primas.map((mp, i) => 
        i === index ? { ...mp, [field]: value } : mp
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showMultipleForm) {
        // Crear múltiples relaciones
        await createMultipleProductoMateriaPrima(formData);
        toast({
          title: 'Producto creado exitosamente',
          description: `Producto "${formData.producto.nombre}" creado con ${formData.materias_primas.length} materias primas`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Crear relación individual
        const materiaPrima = formData.materias_primas[0];
        await createProductoMateriaPrima({
          producto_nombre: formData.producto.nombre,
          materia_prima_nombre: materiaPrima.nombre
        });
        toast({
          title: 'Relación creada exitosamente',
          description: `Producto "${formData.producto.nombre}" vinculado con "${materiaPrima.nombre}"`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      // Limpiar formulario
      setFormData({
        producto: { nombre: '' },
        materias_primas: []
      });
      setShowMultipleForm(false);
      
      if (onSubmit) {
        const message = showMultipleForm 
          ? `Producto "${formData.producto.nombre}" creado con ${formData.materias_primas.length} materias primas`
          : `Producto "${formData.producto.nombre}" vinculado con "${formData.materias_primas[0].nombre}"`;
        onSubmit(message);
      }
    } catch (error) {
      toast({
        title: 'Error al crear producto',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFormMode = () => {
    setShowMultipleForm(!showMultipleForm);
    if (!showMultipleForm && formData.materias_primas.length === 0) {
      addMateriaPrima();
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="md"
      border="1px"
      borderColor="gray.200"
      mt={4}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md" color="orange.600">
          {showMultipleForm ? 'Crear Producto con Múltiples Materias Primas' : 'Crear Relación Producto-Materia Prima'}
        </Heading>

        {formError && (
          <Alert status="error">
            <AlertIcon />
            Error en el formulario. Por favor, verifica los datos.
          </Alert>
        )}

        {/* Información del Producto */}
        <Box>
          <Heading size="sm" mb={3} color="gray.700">Información del Producto</Heading>
          <FormControl isRequired>
            <FormLabel>Nombre del Producto</FormLabel>
            <Input
              value={formData.producto.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ej: Yogur Natural"
            />
          </FormControl>
        </Box>

        <Divider />

        {/* Selector de modo */}
        <Box>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFormMode}
            colorScheme="orange"
          >
            {showMultipleForm ? 'Modo Simple (1 materia prima)' : 'Modo Múltiple (varias materias primas)'}
          </Button>
        </Box>

        {/* Materias Primas */}
        <Box>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm" color="gray.700">
              Materias Primas
            </Heading>
            {showMultipleForm && (
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                onClick={addMateriaPrima}
                colorScheme="green"
                variant="outline"
              >
                Agregar Materia Prima
              </Button>
            )}
          </Flex>

          {formData.materias_primas.length === 0 && !showMultipleForm && (
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              onClick={addMateriaPrima}
              colorScheme="green"
              variant="outline"
              w="full"
            >
              Agregar Materia Prima
            </Button>
          )}

          <VStack spacing={4} align="stretch">
            {formData.materias_primas.map((materiaPrima, index) => (
              <Box
                key={index}
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                bg="gray.50"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Badge colorScheme="blue">Materia Prima {index + 1}</Badge>
                  {showMultipleForm && (
                    <IconButton
                      size="sm"
                      icon={<CloseIcon />}
                      onClick={() => removeMateriaPrima(index)}
                      colorScheme="red"
                      variant="ghost"
                      aria-label="Eliminar materia prima"
                    />
                  )}
                </Flex>

                                 <VStack spacing={3}>
                   <FormControl isRequired>
                     <FormLabel>Nombre de la Materia Prima</FormLabel>
                     <Input
                       value={materiaPrima.nombre}
                       onChange={(e) => updateMateriaPrima(index, 'nombre', e.target.value)}
                       placeholder="Ej: Leche, Frutilla, Azúcar"
                     />
                   </FormControl>
                 </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Botones de acción */}
        <HStack spacing={4} justify="flex-end">
          <Button
            onClick={onCancel}
            variant="outline"
            isDisabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            colorScheme="orange"
            isLoading={loading}
            loadingText="Creando..."
            isDisabled={!formData.producto.nombre || formData.materias_primas.length === 0}
          >
            {showMultipleForm ? 'Crear Producto Completo' : 'Crear Relación'}
          </Button>
        </HStack>

        {/* Información adicional */}
        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" color="blue.700">
            <strong>Nota:</strong> Si el producto o las materias primas no existen, se crearán automáticamente.
            {showMultipleForm && ' Puedes agregar múltiples materias primas para crear una receta completa.'}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default ProductoMateriaPrimaForm; 