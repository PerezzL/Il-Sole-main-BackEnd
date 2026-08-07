import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  HStack,
  Badge,
  Spinner,
  Select,
  useToast,
} from '@chakra-ui/react';
import {
  getSolicitudesEdicionPendientes,
  aprobarSolicitudEdicion,
  rechazarSolicitudEdicion,
} from '../config/api';
import { sectores } from '../config/sectores';

const nombreTabla = (tabla) => sectores.find((s) => s.tabla === tabla)?.label || tabla;

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const SolicitudesEdicionPanel = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [sectorFiltro, setSectorFiltro] = useState('todos');
  const toast = useToast();

  const solicitudesFiltradas = useMemo(() => {
    if (sectorFiltro === 'todos') return solicitudes;
    const sector = sectores.find((s) => s.key === sectorFiltro);
    return solicitudes.filter((s) => s.tabla === sector?.tabla);
  }, [solicitudes, sectorFiltro]);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSolicitudesEdicionPendientes();
      setSolicitudes(data);
    } catch (error) {
      toast({
        title: 'Error al cargar solicitudes',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const resolver = async (id, accion) => {
    setProcesandoId(id);
    try {
      if (accion === 'aprobar') {
        await aprobarSolicitudEdicion(id);
      } else {
        await rechazarSolicitudEdicion(id);
      }
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: accion === 'aprobar' ? 'Solicitud aprobada' : 'Solicitud rechazada',
        status: accion === 'aprobar' ? 'success' : 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error al resolver la solicitud',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setProcesandoId(null);
    }
  };

const filtroSelect = (
    <Select
      value={sectorFiltro}
      onChange={(e) => setSectorFiltro(e.target.value)}
      w="100%"
      maxW="320px"
      bg="white"
      mb={4}
    >
      <option value="todos">Todos los sectores</option>
      {sectores.map((s) => (
        <option key={s.key} value={s.key}>
          {s.label}
        </option>
      ))}
    </Select>
  );

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="orange.500" />
        <Text mt={4}>Cargando solicitudes...</Text>
      </Box>
    );
  }

  if (solicitudesFiltradas.length === 0) {
    return (
      <Box>
        {filtroSelect}
        <Box p={6} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200" textAlign="center">
          <Text color="gray.500">
            {solicitudes.length === 0
              ? 'No hay solicitudes de edición pendientes'
              : 'No hay solicitudes pendientes para ese sector'}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {filtroSelect}
      <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
      <Table variant="simple" size="sm">
        <Thead bg="orange.100">
          <Tr>
            <Th>Usuario</Th>
            <Th>Formulario</Th>
            <Th>Registro</Th>
            <Th>Fecha del pedido</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {solicitudesFiltradas.map((s) => (
            <Tr key={s.id} _hover={{ bg: 'gray.50' }}>
              <Td>
                <Badge colorScheme="blue" variant="subtle">
                  👤 {s.usuario_nombre}
                </Badge>
              </Td>
              <Td>{nombreTabla(s.tabla)}</Td>
              <Td fontWeight="semibold">{s.codigo || `#${s.registro_id}`}</Td>
              <Td>{formatFecha(s.created_at)}</Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    isLoading={procesandoId === s.id}
                    onClick={() => resolver(s.id, 'aprobar')}
                  >
                    Aceptar
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    isLoading={procesandoId === s.id}
                    onClick={() => resolver(s.id, 'rechazar')}
                  >
                    Denegar
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      </Box>
    </Box>
  );
};

export default SolicitudesEdicionPanel;
