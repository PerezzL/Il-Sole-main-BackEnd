import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Badge,
  Spinner,
  useToast,
  Container,
} from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import EditRegistroModal from './components/EditRegistroModal';
import { sectores } from './config/sectores';
import { useAuth } from './context/AuthContext';
import {
  getRegistrosBySector,
  getMisSolicitudesEdicion,
  crearSolicitudEdicion,
} from './config/api';

function formatFecha(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('es-AR');
  } catch {
    return '-';
  }
}

const ESTADO_LABEL = {
  pendiente: { label: 'Pendiente de aprobación', color: 'yellow' },
  aprobada: { label: 'Aprobada: ya podés editar', color: 'green' },
  rechazada: { label: 'Rechazada', color: 'red' },
  completada: { label: 'Ya editado', color: 'gray' },
};

const EditarRegistrosPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [sectorKey, setSectorKey] = useState(sectores[0].key);
  const [registros, setRegistros] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pidiendoId, setPidiendoId] = useState(null);
  const [registroToEdit, setRegistroToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const sector = sectores.find((s) => s.key === sectorKey);

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [regs, solicitudes] = await Promise.all([
        getRegistrosBySector(sectorKey),
        getMisSolicitudesEdicion(),
      ]);
      setRegistros(Array.isArray(regs) ? regs : []);
      setMisSolicitudes(Array.isArray(solicitudes) ? solicitudes : []);
    } catch (error) {
      toast({
        title: 'Error al cargar tus registros',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [sectorKey, toast]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const misRegistros = useMemo(
    () => registros.filter((r) => r.usuario_id === user?.id),
    [registros, user]
  );

  // Ultima solicitud por registro, para esta tabla
  const solicitudPorRegistro = useMemo(() => {
    const map = new Map();
    misSolicitudes
      .filter((s) => s.tabla === sector.tabla)
      .forEach((s) => {
        const actual = map.get(s.registro_id);
        if (!actual || new Date(s.created_at) > new Date(actual.created_at)) {
          map.set(s.registro_id, s);
        }
      });
    return map;
  }, [misSolicitudes, sector.tabla]);

  const pedirEdicion = async (registro) => {
    setPidiendoId(registro.id);
    try {
      await crearSolicitudEdicion({
        tabla: sector.tabla,
        registro_id: registro.id,
        codigo: registro.codigo,
      });
      toast({
        title: 'Pedido enviado',
        description: 'Un admin tiene que aprobarlo antes de que puedas editar.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      fetchDatos();
    } catch (error) {
      toast({
        title: 'Error al pedir edición',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setPidiendoId(null);
    }
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Container maxW="container.lg" flex="1" py={8}>
        <Heading as="h1" mb={6} fontSize={{ base: '2xl', md: '3xl' }}>
          Editar mis registros
        </Heading>

        <Select
          value={sectorKey}
          onChange={(e) => setSectorKey(e.target.value)}
          w="100%"
          maxW="320px"
          bg="white"
          mb={6}
        >
          {sectores.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </Select>

        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="orange.500" />
            <Text mt={4}>Cargando...</Text>
          </Box>
        ) : misRegistros.length === 0 ? (
          <Box p={6} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200" textAlign="center">
            <Text color="gray.500">No cargaste registros de {sector.label.toLowerCase()}</Text>
          </Box>
        ) : (
          <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
            <Table variant="simple" size="sm">
              <Thead bg="orange.100">
                <Tr>
                  <Th>Código</Th>
                  <Th>Fecha</Th>
                  <Th>Estado</Th>
                  <Th>Acción</Th>
                </Tr>
              </Thead>
              <Tbody>
                {misRegistros.map((registro) => {
                  const solicitud = solicitudPorRegistro.get(registro.id);
                  const estado = solicitud?.estado;
                  const estadoInfo = estado ? ESTADO_LABEL[estado] : null;

                  return (
                    <Tr key={registro.id} _hover={{ bg: 'gray.50' }}>
                      <Td fontWeight="semibold">{registro.codigo || `#${registro.id}`}</Td>
                      <Td>{formatFecha(registro.created_at)}</Td>
                      <Td>
                        {estadoInfo ? (
                          <Badge colorScheme={estadoInfo.color}>{estadoInfo.label}</Badge>
                        ) : (
                          <Text fontSize="sm" color="gray.400">
                            Sin pedido
                          </Text>
                        )}
                      </Td>
                      <Td>
                        {estado === 'aprobada' ? (
                          <Button
                            size="sm"
                            colorScheme="orange"
                            onClick={() => {
                              setRegistroToEdit(registro);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Editar ahora
                          </Button>
                        ) : estado === 'pendiente' ? (
                          <Button size="sm" isDisabled>
                            Esperando aprobación
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="orange"
                            isLoading={pidiendoId === registro.id}
                            onClick={() => pedirEdicion(registro)}
                          >
                            Pedir acceso para editar
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </Container>

      <EditRegistroModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sector={sector.key}
        columns={sector.columns}
        registro={registroToEdit}
        onSaved={fetchDatos}
      />

      <Footer />
    </Box>
  );
};

export default EditarRegistrosPage;
