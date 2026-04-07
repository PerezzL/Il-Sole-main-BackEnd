import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  VStack,
  HStack,
  SimpleGrid,
  Text,
  Heading,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Collapse,
  Input,
  Select,
  FormControl,
  FormLabel,
  Divider,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, AddIcon, CloseIcon } from '@chakra-ui/icons';
import {
  getAllProductosConMateriasPrimas,
  getReceta,
  updateProductoCompleto,
  deleteProductoCompleto
} from '../config/api';

const ProductoMateriaPrimaTable = ({ refreshKey = 0, showFilters = true }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [editingProducto, setEditingProducto] = useState(null);
  const [filterProducto, setFilterProducto] = useState('');
  const [filterMateriaPrima, setFilterMateriaPrima] = useState('');
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const toast = useToast();
  const cancelRef = useRef();
  
  const { isOpen: isRecetaOpen, onOpen: onRecetaOpen, onClose: onRecetaClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Cargar productos con sus materias primas
  useEffect(() => {
    fetchProductos();
  }, [refreshKey]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await getAllProductosConMateriasPrimas();
      setProductos(data);
    } catch (error) {
      toast({
        title: 'Error al cargar productos',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceta = async (productoId) => {
    try {
      const receta = await getReceta(productoId);
      setSelectedReceta(receta);
      onRecetaOpen();
    } catch (error) {
      toast({
        title: 'Error al cargar receta',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    onEditOpen();
  };

  const handleUpdate = async (updatedData) => {
    try {
      await updateProductoCompleto(editingProducto.producto_id, updatedData);
      await fetchProductos();
      onEditClose();
      setEditingProducto(null);
      toast({
        title: 'Producto actualizado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (producto) => {
    setProductoToDelete(producto);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productoToDelete) {
      try {
        await deleteProductoCompleto(productoToDelete.producto_id);
        await fetchProductos();
        toast({
          title: 'Producto eliminado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error al eliminar',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
    setProductoToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  // Filtrar productos
  const filteredProductos = productos.filter(producto => {
    const productoMatch = producto.producto_nombre?.toLowerCase().includes(filterProducto.toLowerCase());
    const materiaPrimaMatch = producto.materias_primas?.some(mp => 
      mp.materia_prima_nombre?.toLowerCase().includes(filterMateriaPrima.toLowerCase())
    );
    return productoMatch && (filterMateriaPrima === '' || materiaPrimaMatch);
  });

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="orange.500" />
        <Text mt={4}>Cargando productos...</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filtros */}
      {showFilters && (
      <Box mb={6} p={4} bg="gray.50" borderRadius="md">
        <Heading size="sm" mb={3}>Filtros</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel fontSize="sm">Producto</FormLabel>
            <Input
              value={filterProducto}
              onChange={(e) => setFilterProducto(e.target.value)}
              placeholder="Filtrar por producto..."
              size="sm"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Materia Prima</FormLabel>
            <Input
              value={filterMateriaPrima}
              onChange={(e) => setFilterMateriaPrima(e.target.value)}
              placeholder="Filtrar por materia prima..."
              size="sm"
            />
          </FormControl>
        </SimpleGrid>
      </Box>
      )}

      {/* Tabla */}
      <Box overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
        <Table variant="simple" size="sm" minW="480px">
          <Thead>
            <Tr>
              <Th>Producto</Th>
              <Th>Cantidad de Materias Primas</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredProductos.map((producto) => (
              <Tr key={producto.producto_id}>
                <Td>
                  <Text fontWeight="bold" fontSize="md">{producto.producto_nombre}</Text>
                </Td>
                <Td>
                  <Badge colorScheme="blue" size="md">
                    {producto.materias_primas ? producto.materias_primas.length : 0} materias primas
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      size="sm"
                      icon={<ViewIcon />}
                      onClick={() => handleViewReceta(producto.producto_id)}
                      colorScheme="blue"
                      variant="ghost"
                      aria-label="Ver receta"
                      title="Ver receta completa"
                    />
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      onClick={() => handleEdit(producto)}
                      colorScheme="orange"
                      variant="ghost"
                      aria-label="Editar"
                      title="Editar producto"
                    />
                                         <IconButton
                       size="sm"
                       icon={<DeleteIcon />}
                       onClick={() => handleDeleteClick(producto)}
                       colorScheme="red"
                       variant="ghost"
                       aria-label="Eliminar"
                       title="Eliminar producto"
                     />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {filteredProductos.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">No se encontraron productos</Text>
        </Box>
      )}

      {/* Modal para ver receta completa */}
      <Modal isOpen={isRecetaOpen} onClose={onRecetaClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Receta Completa</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedReceta && (
              <VStack align="stretch" spacing={4}>
                                 <Box>
                   <Heading size="md" color="orange.600">
                     {selectedReceta.producto_nombre}
                   </Heading>
                 </Box>

                <Box>
                  <Heading size="sm" mb={3}>Materias Primas:</Heading>
                  {selectedReceta.materias_primas && selectedReceta.materias_primas.length > 0 ? (
                    <VStack align="stretch" spacing={2}>
                      {selectedReceta.materias_primas.map((mp, index) => (
                        <Box
                          key={index}
                          p={3}
                          border="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          bg="gray.50"
                        >
                                                     <HStack justify="space-between">
                             <VStack align="start" spacing={1}>
                               <Text fontWeight="bold">{mp.materia_prima_nombre}</Text>
                             </VStack>
                           </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500">No hay materias primas asociadas</Text>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para editar */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Producto</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {editingProducto && (
              <EditProductoForm
                producto={editingProducto}
                onSubmit={handleUpdate}
                onCancel={onEditClose}
              />
            )}
          </ModalBody>
                 </ModalContent>
       </Modal>

       {/* Dialog de confirmación de eliminación */}
       <AlertDialog
         isOpen={isDeleteDialogOpen}
         leastDestructiveRef={cancelRef}
         onClose={() => setIsDeleteDialogOpen(false)}
       >
         <AlertDialogOverlay>
           <AlertDialogContent>
             <AlertDialogHeader fontSize="lg" fontWeight="bold">
               Confirmación de Eliminación
             </AlertDialogHeader>

                           <AlertDialogBody>
                ¿Estás seguro de que quieres eliminar el producto <strong>{productoToDelete?.producto_nombre}</strong>? 
                <br /><br />
                Se eliminarán todas las relaciones con sus materias primas. Las materias primas que no estén asociadas a otros productos también serán eliminadas. Esta acción no se puede deshacer.
              </AlertDialogBody>

             <AlertDialogFooter>
               <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                 Cancelar
               </Button>
               <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                 Eliminar
               </Button>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialogOverlay>
       </AlertDialog>
     </Box>
   );
 };

// Componente para editar producto
const EditProductoForm = ({ producto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    producto_nombre: producto.producto_nombre,
    materias_primas: producto.materias_primas ? [...producto.materias_primas] : []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filtrar materias primas vacías
    const materiasPrimasValidas = formData.materias_primas.filter(mp => mp.materia_prima_nombre.trim());
    
    const dataToSubmit = {
      producto_nombre: formData.producto_nombre.trim(),
      materias_primas: materiasPrimasValidas
    };
    
    onSubmit(dataToSubmit);
  };

  const handleProductoChange = (value) => {
    setFormData(prev => ({
      ...prev,
      producto_nombre: value
    }));
  };

  const addMateriaPrima = () => {
    setFormData(prev => ({
      ...prev,
      materias_primas: [
        ...prev.materias_primas,
        { materia_prima_nombre: '' }
      ]
    }));
  };

  const removeMateriaPrima = (index) => {
    setFormData(prev => ({
      ...prev,
      materias_primas: prev.materias_primas.filter((_, i) => i !== index)
    }));
  };

  const updateMateriaPrima = (index, value) => {
    setFormData(prev => ({
      ...prev,
      materias_primas: prev.materias_primas.map((mp, i) => 
        i === index ? { ...mp, materia_prima_nombre: value } : mp
      )
    }));
  };

  // Limpiar materias primas vacías automáticamente
  const cleanEmptyMateriasPrimas = () => {
    setFormData(prev => ({
      ...prev,
      materias_primas: prev.materias_primas.filter(mp => mp.materia_prima_nombre.trim())
    }));
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Nombre del Producto */}
        <FormControl isRequired>
          <FormLabel fontWeight="bold">Nombre del Producto</FormLabel>
          <Input
            value={formData.producto_nombre}
            onChange={(e) => handleProductoChange(e.target.value)}
            placeholder="Ej: Pizza Margherita"
            size="md"
          />
        </FormControl>

        <Divider />

        {/* Materias Primas */}
        <Box>
          <Flex justify="space-between" align="center" mb={3}>
            <FormLabel fontWeight="bold" mb={0}>
              Materias Primas ({formData.materias_primas.filter(mp => mp.materia_prima_nombre.trim()).length})
            </FormLabel>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={cleanEmptyMateriasPrimas}
                colorScheme="gray"
                variant="outline"
              >
                Limpiar Vacías
              </Button>
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                onClick={addMateriaPrima}
                colorScheme="green"
                variant="outline"
              >
                Agregar Materia Prima
              </Button>
            </HStack>
          </Flex>

          {formData.materias_primas.length === 0 ? (
            <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
              <Text color="gray.500">No hay materias primas. Haz clic en "Agregar Materia Prima" para comenzar.</Text>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {formData.materias_primas.map((mp, index) => (
                <Box
                  key={index}
                  p={4}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Flex justify="space-between" align="center">
                                         <FormControl isRequired flex={1} mr={3}>
                       <FormLabel fontSize="sm" mb={1}>
                         Materia Prima {index + 1}
                         {!mp.materia_prima_nombre.trim() && (
                           <Badge colorScheme="red" size="xs" ml={2}>Vacía</Badge>
                         )}
                       </FormLabel>
                       <Input
                         value={mp.materia_prima_nombre}
                         onChange={(e) => updateMateriaPrima(index, e.target.value)}
                         placeholder="Ej: Harina, Leche, Azúcar"
                         size="sm"
                         borderColor={!mp.materia_prima_nombre.trim() ? "red.300" : "gray.200"}
                         _focus={{ borderColor: !mp.materia_prima_nombre.trim() ? "red.500" : "blue.500" }}
                       />
                     </FormControl>
                    <IconButton
                      size="sm"
                      icon={<CloseIcon />}
                      onClick={() => removeMateriaPrima(index)}
                      colorScheme="red"
                      variant="ghost"
                      aria-label="Eliminar materia prima"
                    />
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Información adicional */}
        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" color="blue.700">
            <strong>Nota:</strong> Si las materias primas no existen, se crearán automáticamente. 
            Los cambios se aplicarán a todas las relaciones del producto.
          </Text>
        </Box>

        {/* Botones de acción */}
        <HStack spacing={4} justify="flex-end">
          <Button onClick={onCancel} variant="outline">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            colorScheme="orange"
            isDisabled={!formData.producto_nombre.trim() || formData.materias_primas.some(mp => !mp.materia_prima_nombre.trim())}
          >
            Actualizar Producto
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProductoMateriaPrimaTable; 