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
import { createMultipleProductoMateriaPrima, getActiveMateriasPrimas } from '../config/api';

const nuevaFilaMateriaPrima = () => ({ nombre: '', esNueva: false });

const ProductoMateriaPrimaForm = ({ onSubmit, onCancel, formError }) => {
  const [formData, setFormData] = useState({
    producto: {
      nombre: ''
    },
    materias_primas: [nuevaFilaMateriaPrima()]
  });
  
  const [materiasPrimasDisponibles, setMateriasPrimasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchMateriasPrimas = async () => {
    try {
      const data = await getActiveMateriasPrimas();
      setMateriasPrimasDisponibles(Array.isArray(data) ? data : []);
    } catch (error) {
      setMateriasPrimasDisponibles([]);
    }
  };

  useEffect(() => {
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
          nombre: '',
          esNueva: false
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

  const setMateriaPrimaModoNueva = (index, esNueva) => {
    setFormData(prev => ({
      ...prev,
      materias_primas: prev.materias_primas.map((mp, i) =>
        i === index ? { ...mp, esNueva, nombre: '' } : mp
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createMultipleProductoMateriaPrima(formData);
      const n = formData.materias_primas.length;
      toast({
        title: 'Producto creado exitosamente',
        description:
          n === 1
            ? `Producto "${formData.producto.nombre}" vinculado con 1 materia prima`
            : `Producto "${formData.producto.nombre}" creado con ${n} materias primas`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setFormData({
        producto: { nombre: '' },
        materias_primas: [nuevaFilaMateriaPrima()]
      });
      fetchMateriasPrimas();

      if (onSubmit) {
        onSubmit(
          `Producto "${formData.producto.nombre}" con ${n} materia${n === 1 ? '' : 's'} prima${n === 1 ? '' : 's'}`
        );
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
          Crear producto y materias primas
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

        <Box>
          <Heading size="sm" mb={3} color="gray.700">
            Materias primas
          </Heading>

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
                  <Badge colorScheme="blue">Materia prima {index + 1}</Badge>
                  {formData.materias_primas.length > 1 && (
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

                <VStack spacing={3} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Materia prima</FormLabel>
                    {!materiaPrima.esNueva ? (
                      <HStack align="flex-start" spacing={2}>
                        <Select
                          flex={1}
                          placeholder="Seleccionar de la lista…"
                          value={materiaPrima.nombre}
                          onChange={(e) =>
                            updateMateriaPrima(index, 'nombre', e.target.value)
                          }
                        >
                          {materiasPrimasDisponibles.map((mp) => (
                            <option key={mp.id} value={mp.nombre}>
                              {mp.nombre}
                            </option>
                          ))}
                        </Select>
                        <Button
                          size="md"
                          variant="outline"
                          colorScheme="orange"
                          whiteSpace="nowrap"
                          onClick={() => setMateriaPrimaModoNueva(index, true)}
                        >
                          Nueva materia prima
                        </Button>
                      </HStack>
                    ) : (
                      <HStack align="flex-start" spacing={2}>
                        <Input
                          flex={1}
                          value={materiaPrima.nombre}
                          onChange={(e) =>
                            updateMateriaPrima(index, 'nombre', e.target.value)
                          }
                          placeholder="Nombre de la nueva materia prima"
                        />
                        <Button
                          size="md"
                          variant="outline"
                          onClick={() => setMateriaPrimaModoNueva(index, false)}
                        >
                          Elegir de la lista
                        </Button>
                      </HStack>
                    )}
                  </FormControl>
                  {!materiaPrima.esNueva &&
                    materiasPrimasDisponibles.length === 0 && (
                      <Text fontSize="sm" color="gray.600">
                        No hay materias primas en la base. Usá &quot;Nueva
                        materia prima&quot; para cargar una.
                      </Text>
                    )}
                </VStack>
              </Box>
            ))}
          </VStack>

          {formData.materias_primas.length > 0 && (
            <Button
              mt={4}
              size="sm"
              leftIcon={<AddIcon />}
              onClick={addMateriaPrima}
              colorScheme="green"
              variant="outline"
              w="full"
            >
              Agregar otra materia prima
            </Button>
          )}
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
            isDisabled={
              !formData.producto.nombre?.trim() ||
              !formData.materias_primas.some((mp) => mp.nombre?.trim())
            }
          >
            Crear producto
          </Button>
        </HStack>

        {/* Información adicional */}
        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" color="blue.700">
            <strong>Nota:</strong> Si el producto o alguna materia prima no existe, se creará automáticamente.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default ProductoMateriaPrimaForm; 