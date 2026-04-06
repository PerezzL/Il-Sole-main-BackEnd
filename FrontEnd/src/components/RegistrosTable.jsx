import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Badge,
  Spinner,
  Flex,
  Heading,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  EditIcon, 
  SearchIcon, 
  CalendarIcon,
  ViewIcon,
  TimeIcon,
  ChevronRightIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { getRegistrosBySector, deleteRegistroBySector } from '../config/api';
import TrazabilidadModal from './TrazabilidadModal';
import { useTrazabilidad } from '../hooks/useTrazabilidad';

const RegistrosTable = ({ sector, columns, filtros, showFilters = true }) => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtrosState, setFiltrosState] = useState({});
  
  // Hook para trazabilidad
  const { 
    modalOpen, 
    registroActual, 
    tipoTablaActual, 
    openTrazabilidad, 
    closeTrazabilidad 
  } = useTrazabilidad();
  const [filtrosFecha, setFiltrosFecha] = useState({
    fechaDesde: '',
    fechaHasta: '',
    fechaEspecifica: ''
  });
  const [tipoFiltroFecha, setTipoFiltroFecha] = useState('especifica'); // 'especifica' o 'rango'
  const [registroToDelete, setRegistroToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const toast = useToast();

  // Inicializar filtros
  useEffect(() => {
    const initialFiltros = {};
    filtros.forEach(filtro => {
      initialFiltros[filtro] = '';
    });
    setFiltrosState(initialFiltros);
  }, [filtros]);

  // Cargar registros
  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);
      try {        const data = await getRegistrosBySector(sector);        
        // Log simple para verificar datos
        if (Array.isArray(data) && data.length > 0) {        }
        
        setRegistros(Array.isArray(data) ? data : []);
      } catch (error) {        toast({
          title: 'Error al cargar registros',
          description: `Error: ${error.message}. En producción revisá VITE_API_URL en Vercel y CORS en el backend.`,
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
        setRegistros([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistros();
  }, [sector, toast]);

  // Manejar cambios en filtros
  const handleFiltroChange = (filtro, value) => {
    setFiltrosState(prev => ({
      ...prev,
      [filtro]: value
    }));
  };

  // Función para formatear automáticamente la fecha mientras se escribe
  const formatDateInput = (value) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos (ddmmyyyy)
    const limited = numbers.slice(0, 8);
    
    // Aplicar formato dd/mm/aaaa
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
  };

  // Función para separar fecha en partes
  const splitDate = (dateString) => {
    if (!dateString) return { day: '', month: '', year: '' };
    const parts = dateString.split('/');
    return {
      day: parts[0] || '',
      month: parts[1] || '',
      year: parts[2] || ''
    };
  };

  // Función para unir partes de fecha
  const joinDate = (day, month, year) => {
    const parts = [day, month, year].filter(part => part !== '');
    return parts.join('/');
  };

  // Manejar cambios en filtros de fecha con formato automático
  const handleFechaChange = (tipo, value) => {
    // Aplicar formato automático
    const formattedValue = formatDateInput(value);
    
    setFiltrosFecha(prev => {
      const newFiltros = { ...prev, [tipo]: formattedValue };
      
      // Limpiar el otro tipo de filtro cuando se cambia
      if (tipo === 'fechaEspecifica') {
        newFiltros.fechaDesde = '';
        newFiltros.fechaHasta = '';
      } else if (tipo === 'fechaDesde' || tipo === 'fechaHasta') {
        newFiltros.fechaEspecifica = '';
      }
      
      return newFiltros;
    });
  };

  // Manejar cambios en partes individuales de fecha
  const handleDatePartChange = (tipo, part, value) => {
    // Solo permitir números y limitar longitud
    const numbers = value.replace(/\D/g, '');
    let limitedValue = numbers;
    
    if (part === 'day') {
      limitedValue = numbers.slice(0, 2);
    } else if (part === 'month') {
      limitedValue = numbers.slice(0, 2);
    } else if (part === 'year') {
      limitedValue = numbers.slice(0, 4);
    }
    
    setFiltrosFecha(prev => {
      const currentDate = prev[tipo];
      const { day, month, year } = splitDate(currentDate);
      
      let newDay = day;
      let newMonth = month;
      let newYear = year;
      
      if (part === 'day') {
        newDay = limitedValue;
      } else if (part === 'month') {
        newMonth = limitedValue;
      } else if (part === 'year') {
        newYear = limitedValue;
      }
      
      const newDate = joinDate(newDay, newMonth, newYear);
      const newFiltros = { ...prev, [tipo]: newDate };
      
      // Limpiar el otro tipo de filtro cuando se cambia
      if (tipo === 'fechaEspecifica') {
        newFiltros.fechaDesde = '';
        newFiltros.fechaHasta = '';
      } else if (tipo === 'fechaDesde' || tipo === 'fechaHasta') {
        newFiltros.fechaEspecifica = '';
      }
      
      return newFiltros;
    });
  };

  // Manejar cambio de tipo de filtro
  const handleTipoFiltroChange = (tipo) => {
    setTipoFiltroFecha(tipo);
    // Limpiar filtros al cambiar tipo
    setFiltrosFecha({
      fechaDesde: '',
      fechaHasta: '',
      fechaEspecifica: ''
    });
  };

  // Función para convertir fecha ISO a formato dd/mm/aaaa
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  // Función para convertir formato dd/mm/aaaa a Date
  const parseDDMMYYYYToDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const [day, month, year] = dateString.split('/');
      if (!day || !month || !year) return null;
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) return null;
      
      return date;
    } catch {
      return null;
    }
  };

  // Función para verificar si una fecha está en el rango
  const isDateInRange = (dateString, fechaDesde, fechaHasta, fechaEspecifica) => {
    if (!dateString) return true;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return true;
      
      // Si hay fecha específica, solo verificar esa fecha
      if (fechaEspecifica) {
        const specificDate = parseDDMMYYYYToDate(fechaEspecifica);
        if (!specificDate) return true;
        
        // Comparar solo año, mes y día (sin hora)
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const specificDateOnly = new Date(specificDate.getFullYear(), specificDate.getMonth(), specificDate.getDate());
        
        return dateOnly.getTime() === specificDateOnly.getTime();
      }
      
      // Verificar rango de fechas
      if (fechaDesde) {
        const desde = parseDDMMYYYYToDate(fechaDesde);
        if (desde) {
          const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const desdeOnly = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
          
          if (dateOnly < desdeOnly) return false;
        }
      }
      
      if (fechaHasta) {
        const hasta = parseDDMMYYYYToDate(fechaHasta);
        if (hasta) {
          const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const hastaOnly = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
          
          if (dateOnly > hastaOnly) return false;
        }
      }
      
      return true;
    } catch (error) {      return true;
    }
  };

  // Aplicar filtros
  const registrosFiltrados = registros.filter(registro => {
    // Aplicar filtros de texto
    const filtrosTexto = filtros.every(filtro => {
      const valorFiltro = filtrosState[filtro];
      if (!valorFiltro) return true;
      
      const valorRegistro = registro[filtro];
      if (!valorRegistro) return false;
      
      return valorRegistro.toString().toLowerCase().includes(valorFiltro.toLowerCase());
    });

    // Aplicar filtros de fecha
    const filtrosFechaOk = isDateInRange(
      registro.created_at, 
      filtrosFecha.fechaDesde, 
      filtrosFecha.fechaHasta,
      filtrosFecha.fechaEspecifica
    );

    // Debug: mostrar información de filtrado
    if (filtrosFecha.fechaDesde || filtrosFecha.fechaHasta || filtrosFecha.fechaEspecifica) {    }

    return filtrosTexto && filtrosFechaOk;
  });

  // Eliminar registro
  const handleDelete = async () => {
    if (!registroToDelete) return;

    try {
      await deleteRegistroBySector(sector, registroToDelete.id);
      setRegistros(prev => prev.filter(r => r.id !== registroToDelete.id));
      toast({
        title: 'Registro eliminado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error al eliminar registro',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setRegistroToDelete(null);
    }
  };

  // Formatear valor para mostrar
  const formatValue = (value, column) => {
    // Solo mostrar "-" si es null, undefined o cadena vacía
    if (value === null || value === undefined || value === '') return '-';
    
    // Formatear fechas
    if (column.key.includes('fecha') || column.key.includes('created_at') || column.key.includes('updated_at')) {
      try {
        if (value) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return formatDateToDDMMYYYY(value);
          }
        }
        return value || '-';
      } catch {
        return value || '-';
      }
    }
    
    // Formatear booleanos
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    
    // Formatear números
    if (typeof value === 'number') {
      return value.toLocaleString('es-ES');
    }
    
    return value.toString();
  };

  // Limpiar filtros
  const clearFiltros = () => {
    const clearedFiltros = {};
    filtros.forEach(filtro => {
      clearedFiltros[filtro] = '';
    });
    setFiltrosState(clearedFiltros);
    setFiltrosFecha({
      fechaDesde: '',
      fechaHasta: '',
      fechaEspecifica: ''
    });
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="orange.500" />
        <Text mt={4}>Cargando registros...</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filtros */}
      {showFilters && (
      <Box mb={4} p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
        <Heading size="sm" mb={3} color="gray.700" display="flex" alignItems="center">
          <SearchIcon mr={2} color="orange.500" />
          Filtros de Búsqueda
        </Heading>
        
        <VStack spacing={3} align="stretch">
          
          {/* Filtros de texto */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700" display="flex" alignItems="center">
              <ViewIcon mr={2} color="orange.500" />
              Filtros por Campo
            </Text>
            <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
              gap={3}
            >
              {filtros.map(filtro => {
                const column = columns.find(c => c.key === filtro);
                return (
                  <Box key={filtro}>
                    <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.600">
                      {column?.label || filtro}
                    </Text>
                    <Input
                      placeholder={`Buscar...`}
                      value={filtrosState[filtro] || ''}
                      onChange={(e) => handleFiltroChange(filtro, e.target.value)}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "orange.300" }}
                      _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Filtros de fecha */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700" display="flex" alignItems="center">
              <TimeIcon mr={2} color="orange.500" />
              Filtros por Fecha de Creación
            </Text>
            
            {/* Selector de tipo de filtro */}
            <HStack spacing={2} mb={2}>
              <Button
                size="xs"
                variant={tipoFiltroFecha === 'especifica' ? 'solid' : 'outline'}
                colorScheme="orange"
                onClick={() => handleTipoFiltroChange('especifica')}
                leftIcon={<CalendarIcon />}
              >
                Fecha Específica
              </Button>
              <Button
                size="xs"
                variant={tipoFiltroFecha === 'rango' ? 'solid' : 'outline'}
                colorScheme="orange"
                onClick={() => handleTipoFiltroChange('rango')}
                leftIcon={<TimeIcon />}
              >
                Rango de Fechas
              </Button>
            </HStack>

            {/* Mostrar solo el filtro seleccionado */}
            {tipoFiltroFecha === 'especifica' ? (
              <Box minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.600" display="flex" alignItems="center">
                  <CalendarIcon mr={1} color="orange.500" />
                  Fecha Específica
                </Text>
                <HStack spacing={1}>
                  <Input
                    placeholder="dd"
                    value={splitDate(filtrosFecha.fechaEspecifica).day}
                    onChange={(e) => handleDatePartChange('fechaEspecifica', 'day', e.target.value)}
                    size="sm"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "orange.300" }}
                    _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                    maxLength={2}
                    textAlign="center"
                    w="50px"
                  />
                  <Text fontSize="sm" color="gray.500" fontWeight="bold">/</Text>
                  <Input
                    placeholder="mm"
                    value={splitDate(filtrosFecha.fechaEspecifica).month}
                    onChange={(e) => handleDatePartChange('fechaEspecifica', 'month', e.target.value)}
                    size="sm"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "orange.300" }}
                    _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                    maxLength={2}
                    textAlign="center"
                    w="50px"
                  />
                  <Text fontSize="sm" color="gray.500" fontWeight="bold">/</Text>
                  <Input
                    placeholder="aaaa"
                    value={splitDate(filtrosFecha.fechaEspecifica).year}
                    onChange={(e) => handleDatePartChange('fechaEspecifica', 'year', e.target.value)}
                    size="sm"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "orange.300" }}
                    _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                    maxLength={4}
                    textAlign="center"
                    w="70px"
                  />
                </HStack>
              </Box>
            ) : (
              <HStack spacing={4} flexWrap="wrap">
                <Box minW="200px">
                  <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.600" display="flex" alignItems="center">
                    <ChevronRightIcon mr={1} color="orange.500" />
                    Desde
                  </Text>
                  <HStack spacing={1}>
                    <Input
                      placeholder="dd"
                      value={splitDate(filtrosFecha.fechaDesde).day}
                      onChange={(e) => handleDatePartChange('fechaDesde', 'day', e.target.value)}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "orange.300" }}
                      _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                      maxLength={2}
                      textAlign="center"
                      w="50px"
                    />
                    <Text fontSize="sm" color="gray.500" fontWeight="bold">/</Text>
                    <Input
                      placeholder="mm"
                      value={splitDate(filtrosFecha.fechaDesde).month}
                      onChange={(e) => handleDatePartChange('fechaDesde', 'month', e.target.value)}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "orange.300" }}
                      _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                      maxLength={2}
                      textAlign="center"
                      w="50px"
                    />
                    <Text fontSize="sm" color="gray.500" fontWeight="bold">/</Text>
                    <Input
                      placeholder="aaaa"
                      value={splitDate(filtrosFecha.fechaDesde).year}
                      onChange={(e) => handleDatePartChange('fechaDesde', 'year', e.target.value)}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "orange.300" }}
                      _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                      maxLength={4}
                      textAlign="center"
                      w="70px"
                    />
                  </HStack>
                </Box>

                <Box minW="200px">
                  <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.600" display="flex" alignItems="center">
                    <ChevronRightIcon mr={1} color="orange.500" />
                    Hasta
                  </Text>
                  <HStack spacing={1}>
                    <Input
                      placeholder="dd"
                      value={splitDate(filtrosFecha.fechaHasta).day}
                      onChange={(e) => handleDatePartChange('fechaHasta', 'day', e.target.value)}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "orange.300" }}
                      _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                      maxLength={2}
                      textAlign="center"
                      w="50px"
                    />
                    <Text fontSize="sm" color="gray.500" fontWeight="bold">/</Text>
                    <Input
                      placeholder="mm"
                      value={splitDate(filtrosFecha.fechaHasta).month}
                      onChange={(e) => handleDatePartChange('fechaHasta', 'month', e.target.value)}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "orange.300" }}
                      _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                      maxLength={2}
                      textAlign="center"
                      w="50px"
                    />
                    <Text fontSize="sm" color="gray.500" fontWeight="bold">/</Text>
                    <Input
                      placeholder="aaaa"
                      value={splitDate(filtrosFecha.fechaHasta).year}
                      onChange={(e) => handleDatePartChange('fechaHasta', 'year', e.target.value)}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "orange.300" }}
                      _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                      maxLength={4}
                      textAlign="center"
                      w="70px"
                    />
                  </HStack>
                </Box>
              </HStack>
            )}
          </Box>

          {/* Botones de acción */}
          <HStack spacing={2} justify="flex-end">
            <Button
              leftIcon={<SearchIcon />}
              colorScheme="orange"
              size="sm"
              onClick={() => {}} // Los filtros se aplican automáticamente
            >
              Buscar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFiltros}
              borderColor="gray.300"
              _hover={{ bg: "gray.50" }}
            >
              Limpiar
            </Button>
          </HStack>
        </VStack>
      </Box>
      )}

      {/* Información de resultados */}
      <Box mb={3} p={2} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
        <Text fontSize="sm" color="gray.700" fontWeight="medium" display="flex" alignItems="center">
          <InfoIcon mr={2} color="orange.500" />
          Mostrando <Text as="span" color="orange.600" fontWeight="bold">{registrosFiltrados.length}</Text> de <Text as="span" fontWeight="bold">{registros.length}</Text> registros
          {(filtrosFecha.fechaDesde || filtrosFecha.fechaHasta || filtrosFecha.fechaEspecifica) && (
            <Text as="span" color="orange.600" fontWeight="medium">
              {' '}(filtrados por fecha)
            </Text>
          )}
        </Text>
      </Box>

      {/* Tabla */}
      <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
        <Table variant="simple" size="sm">
          <Thead bg="orange.100">
            <Tr>
              {columns.map(column => (
                <Th 
                  key={column.key} 
                  whiteSpace="nowrap"
                  bg={column.key === 'responsable' ? 'blue.100' : 'inherit'}
                  color={column.key === 'responsable' ? 'blue.800' : 'inherit'}
                >
                  {column.key === 'responsable' ? '👤 ' : ''}{column.label}
                </Th>
              ))}
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {registrosFiltrados.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length + 1} textAlign="center" py={8}>
                  <Text color="gray.500">No se encontraron registros</Text>
                </Td>
              </Tr>
            ) : (
              registrosFiltrados.map((registro, index) => (
                <Tr key={registro.id || index} _hover={{ bg: 'gray.50' }}>
                  {columns.map(column => (
                    <Td 
                      key={column.key} 
                      maxW="200px" 
                      overflow="hidden" 
                      textOverflow="ellipsis"
                      bg={column.key === 'responsable' ? 'blue.50' : 'transparent'}
                    >
                      <Text 
                        noOfLines={1}
                        fontWeight={column.key === 'responsable' ? 'semibold' : 'normal'}
                        color={column.key === 'responsable' ? 'blue.700' : 'inherit'}
                      >
                        {column.key === 'responsable' && registro[column.key] ? (
                          <Badge colorScheme="blue" variant="subtle">
                            👤 {formatValue(registro[column.key], column)}
                          </Badge>
                        ) : (
                          formatValue(registro[column.key], column)
                        )}
                      </Text>
                    </Td>
                  ))}
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Ver trazabilidad"
                        icon={<SearchIcon />}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        onClick={() => {
                          openTrazabilidad(registro.id, sector);
                        }}
                        title="Ver Trazabilidad Completa"
                      />
                      <IconButton
                        aria-label="Editar registro"
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => {
                          // TODO: Implementar edición
                          toast({
                            title: 'Función en desarrollo',
                            description: 'La edición de registros estará disponible pronto',
                            status: 'info',
                            duration: 3000,
                            isClosable: true,
                          });
                        }}
                      />
                      <IconButton
                        aria-label="Eliminar registro"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          setRegistroToDelete(registro);
                          setIsDeleteDialogOpen(true);
                        }}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmar Eliminación
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal de Trazabilidad */}
      <TrazabilidadModal
        isOpen={modalOpen}
        onClose={closeTrazabilidad}
        registroId={registroActual}
        tipoTabla={tipoTablaActual}
      />
    </Box>
  );
};

export default RegistrosTable; 