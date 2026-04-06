import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, Button, Collapse, Tabs, TabList, Tab, TabPanels, TabPanel, useToast, Select, VStack, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, IconButton } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import Header from './components/Header';
import Footer from './components/Footer';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm';
import RegistrosTable from './components/RegistrosTable';
import ProductoMateriaPrimaForm from './components/ProductoMateriaPrimaForm';
import ProductoMateriaPrimaTable from './components/ProductoMateriaPrimaTable';
import { useAuth } from './context/AuthContext';

import { getUsers, createUser, deleteUser } from './config/api';

const sectores = [
  {
    key: 'recepcion',
    label: 'Recepción',
    endpoint: 'recepcion',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'materiaprima', label: 'Materia Prima' },
      { key: 'control1', label: 'Control Transporte' },
      { key: 'control2', label: 'Control Envase' },
      { key: 'control3', label: 'Control Rotulado' },
      { key: 'marca', label: 'Marca' },
      { key: 'proveedor', label: 'Proveedor' },
      { key: 'cant', label: 'Cantidad' },
      { key: 'nroremito', label: 'Nro Remito' },
      { key: 'temp', label: 'Temperatura' },
      { key: 'fechaelaborado', label: 'Fecha Elaborado' },
      { key: 'fechavto', label: 'Fecha Vto.' },
      { key: 'lote', label: 'Lote' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'created_at', label: 'Fecha Creación' },
    ],
    filtros: ['lote', 'materiaprima', 'proveedor', 'nroremito', 'responsable'],
  },
  {
    key: 'semielaborado',
    label: 'Semielaborados',
    endpoint: 'semielaborado',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'semielaborado', label: 'Semielaborado' },
      { key: 'ingrediente', label: 'Ingrediente' },
      { key: 'lotemateriaprima', label: 'Lote Materia Prima' },
      { key: 'lote', label: 'Lote' },
      { key: 'peso', label: 'Peso' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'created_at', label: 'Fecha Creación' },
    ],
    filtros: ['semielaborado', 'ingrediente', 'lote', 'fecha', 'responsable'],
  },
  {
    key: 'production',
    label: 'Producción',
    endpoint: 'production',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'producto', label: 'Producto' },
      { key: 'materiaprima', label: 'Materia Prima' },
      { key: 'lote', label: 'Lote' },
      { key: 'planproduccion', label: 'Plan Producción' },
      { key: 'produccion', label: 'Producción' },
      { key: 'pesodescarte', label: 'Peso Descarte' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'comentarios', label: 'Comentarios' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'created_at', label: 'Fecha Creación' },
    ],
    filtros: ['lote', 'producto', 'materiaprima', 'responsable'],
  },
  {
    key: 'control-pesado',
    label: 'Control Pesado',
    endpoint: 'control-pesado',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'producto', label: 'Producto' },
      { key: 'materiaprima', label: 'Materia Prima' },
      { key: 'lotemateriaprima', label: 'Lote Materia Prima' },
      { key: 'peso', label: 'Peso' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'created_at', label: 'Fecha Creación' },
    ],
    filtros: ['producto', 'materiaprima', 'fecha', 'responsable'],
  },
  {
    key: 'envasado',
    label: 'Envasado',
    endpoint: 'envasado',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'loteprod', label: 'Lote Producción' },
      { key: 'loteenvasado', label: 'Lote Envasado' },
      { key: 'producto', label: 'Producto' },
      { key: 'cantenvases', label: 'Cantidad Envases' },
      { key: 'cantdescarte', label: 'Cantidad Descarte' },
      { key: 'fechaingresopackaging', label: 'Fecha Ingreso Packaging' },
      { key: 'fechaelaboracion', label: 'Fecha de Elaboración' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'created_at', label: 'Fecha Creación' },
    ],
    filtros: ['loteprod', 'loteenvasado', 'producto', 'responsable'],
  },
  {
    key: 'expendio',
    label: 'Expendio',
    endpoint: 'expendio',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'producto', label: 'Producto' },
      { key: 'lote', label: 'Lote' },
      { key: 'destino', label: 'Destino' },
      { key: 'temptransporte', label: 'Temp. Transporte' },
      { 
        key: 'limptransporte', 
        label: 'Limpieza Transporte',
        render: (value) => value === true ? 'Sí' : value === false ? 'No' : '-'
      },
      { key: 'responsable', label: 'Responsable' },
      { key: 'created_at', label: 'Fecha Creación' },
    ],
    filtros: ['lote', 'producto', 'destino', 'responsable'],
  },
];

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showProductFilters, setShowProductFilters] = useState(false);
  const [sectorKey, setSectorKey] = useState('recepcion');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const toast = useToast();
  const { user } = useAuth(); // Get current logged user
  const cancelRef = useRef();

  const sector = sectores.find(s => s.key === sectorKey);

  // Cargar usuarios reales desde el backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        setUsers([]);
        toast({
          title: 'Error al cargar usuarios',
          description: error.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    };
    fetchUsers();
  }, [toast]);

  const handleAddUser = async (userData) => {
    try {      const newUser = await createUser(userData);
      setUsers((prev) => [...prev, newUser]);
      setShowForm(false);
      setFormError(false);
      toast({
        title: 'Usuario creado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setFormError(true);
      toast({
        title: 'Error al crear usuario',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast({
        title: 'Usuario eliminado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error al eliminar usuario',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleProductCreated = (message) => {
    setSuccessMessage(message);
    setIsSuccessDialogOpen(true);
    setShowProductForm(false);
    setRefreshKey(prev => prev + 1); // Recargar la tabla
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box p={{ base: 2, md: 8 }} flex="1">
        <Heading as="h1" mb={6} fontSize={{ base: '2xl', md: '3xl' }}>
          Panel de Administración
        </Heading>

        <Tabs variant="enclosed">
          <TabList>
            <Tab fontSize={{ base: 'sm', md: 'md' }}>Gestión de Usuarios</Tab>
            <Tab fontSize={{ base: 'sm', md: 'md' }}>Gestión de Registros</Tab>
            <Tab fontSize={{ base: 'sm', md: 'md' }}>Productos y Materias Primas</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Heading as="h2" size="lg" mb={4} fontSize={{ base: 'lg', md: 'xl' }}>
                Gestión de Usuarios
              </Heading>

              <Box overflowX="auto">
                <UserTable users={users} onDelete={handleDeleteUser} currentUser={user} />
              </Box>

              <Button onClick={() => setShowForm(!showForm)} colorScheme="orange" mt={4} w={{ base: 'full', md: 'auto' }}>
                {showForm ? 'Cancelar' : 'Agregar Usuario'}
              </Button>

              <Collapse in={showForm} animateOpacity>
                <UserForm onSubmit={handleAddUser} formError={formError} />
              </Collapse>
            </TabPanel>

            <TabPanel>
              <Heading as="h2" size="lg" mb={4} fontSize={{ base: 'lg', md: 'xl' }}>
                Gestión de Registros
              </Heading>
              
              {/* Selector de sector */}
              <Box mb={6}>
                <Heading as="h3" size="md" mb={3}>
                  Sector: {sector?.label}
                </Heading>
                <VStack spacing={4} align="start">
                  <Select
                    value={sectorKey}
                    onChange={(e) => setSectorKey(e.target.value)}
                    maxW="300px"
                    bg="white"
                  >
                    {sectores.map(s => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                  
                  <Button 
                    onClick={() => setShowFilters(!showFilters)} 
                    colorScheme="orange" 
                    variant="outline"
                    size="sm"
                    leftIcon={showFilters ? <ViewOffIcon /> : <ViewIcon />}
                  >
                    Filtros
                  </Button>
                </VStack>
              </Box>

              {/* Tabla de registros con filtros */}
              {sector && (
                <RegistrosTable
                  sector={sector.key}
                  columns={sector.columns}
                  filtros={sector.filtros}
                  showFilters={showFilters}
                />
              )}
            </TabPanel>

            <TabPanel>
              <Heading as="h2" size="lg" mb={4} fontSize={{ base: 'lg', md: 'xl' }}>
                Productos y Materias Primas
              </Heading>

              {/* Botón para mostrar/ocultar filtros */}
              <Button 
                onClick={() => setShowProductFilters(!showProductFilters)} 
                colorScheme="orange" 
                variant="outline"
                size="sm"
                mb={4}
                leftIcon={showProductFilters ? <ViewOffIcon /> : <ViewIcon />}
              >
                Filtros
              </Button>

              {/* Tabla de productos con materias primas */}
              <ProductoMateriaPrimaTable refreshKey={refreshKey} showFilters={showProductFilters} />

              <Button
                onClick={() => setShowProductForm(!showProductForm)}
                colorScheme="orange"
                mt={4}
                w={{ base: 'full', md: 'auto' }}
              >
                {showProductForm ? 'Cancelar' : 'Crear Producto con Materias Primas'}
              </Button>

              <Collapse in={showProductForm} animateOpacity>
                <ProductoMateriaPrimaForm 
                  onSubmit={handleProductCreated} 
                  onCancel={() => setShowProductForm(false)} 
                  formError={formError} 
                />
              </Collapse>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Box>

      {/* Dialog de confirmación de éxito */}
      <AlertDialog
        isOpen={isSuccessDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsSuccessDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="green.600">
              ¡Producto Creado Exitosamente!
            </AlertDialogHeader>

            <AlertDialogBody>
              {successMessage}
              <br /><br />
              El producto ha sido creado y agregado a la base de datos. Puedes verlo en la tabla de productos.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={() => setIsSuccessDialogOpen(false)}
                colorScheme="green"
              >
                Continuar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Footer />
    </Box>
  );
};

export default AdminPage;
