/**
 * ============================================================================
 * MODAL: Diagrama de Trazabilidad
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Image,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
import { getTrazabilidadByLote, API_BASE_URL } from '../config/api';
import logo from '../images/logo.png';

// ============================================================================
// ESTILOS DE IMPRESIÓN
// ============================================================================
const printStyles = `
  @media print {
    /* Ocultar elementos de la UI */
    body * {
      visibility: hidden;
    }
    
    #print-document, #print-document * {
      visibility: visible;
    }
    
    #print-document {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Evitar cortes de página en secciones */
    table { 
      page-break-inside: auto;
      font-size: 9pt !important;
      border-collapse: collapse;
    }
    tr { 
      page-break-inside: avoid; 
      page-break-after: auto; 
    }
    thead { 
      display: table-header-group; 
    }
    th, td { 
      padding: 8px 10px !important;
      border: 1px solid #e2e8f0 !important;
    }
    th {
      background-color: #f7fafc !important;
      font-weight: bold !important;
    }
    
    /* Forzar colores en impresión */
    .print-header {
      background-color: #5D1A1A !important;
      color: white !important;
      -webkit-print-color-adjust: exact !important;
      padding: 15px !important;
    }
    
    .print-section-header {
      background-color: #f7fafc !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    /* Alternar colores de filas */
    tbody tr:nth-child(even) {
      background-color: #f9fafb !important;
    }
    
    /* Secciones */
    [style*="page-break-inside: avoid"] {
      page-break-inside: avoid !important;
    }
    
    @page {
      size: A4 landscape;
      margin: 12mm;
    }
  }
`;

const TrazabilidadModal = ({ isOpen, onClose, registroId, tipoTabla }) => {
  const [trazabilidad, setTrazabilidad] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loteUsado, setLoteUsado] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    if (isOpen && registroId && tipoTabla) {
      fetchTrazabilidad();
    }
  }, [isOpen, registroId, tipoTabla]);

  const fetchTrazabilidad = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');

      const apiEndpoints = {
        'production': '/production',
        'control-pesado': '/control-pesado',
        'expendio': '/expendio',
        'envasado': '/envasado',
        'recepcion': '/recepcion',
        'semielaborado': '/semielaborado'
      };
      
      const endpoint = apiEndpoints[tipoTabla] || `/${tipoTabla}`;
      
      const registroResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!registroResponse.ok) throw new Error('Error al obtener registro');

      const registros = await registroResponse.json();
      const registro = registros.find(r => r.id === registroId);
      
      if (!registro) throw new Error('Registro no encontrado');

      let lote = '';
      switch (tipoTabla) {
        case 'expendio':
          lote = registro.lote;
          break;
        case 'envasado':
          lote = registro.loteprod || registro.loteenvasado;
          break;
        case 'production':
          lote = registro.lote;
          break;
        case 'control-pesado':
          if (registro.fecha) {
            const fecha = new Date(registro.fecha);
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            lote = `${year}${month}${day}`;
          } else if (registro.lotemateriaprima) {
            lote = registro.lotemateriaprima;
          }
          break;
        case 'recepcion':
          lote = registro.lote;
          break;
        case 'semielaborado':
          if (registro.lote && String(registro.lote).trim()) {
            lote = String(registro.lote).trim();
          } else if (registro.lotemateriaprima) {
            lote = registro.lotemateriaprima;
          } else if (registro.fecha) {
            const fecha = new Date(registro.fecha);
            if (!isNaN(fecha.getTime())) {
              const year = fecha.getFullYear();
              const month = String(fecha.getMonth() + 1).padStart(2, '0');
              const day = String(fecha.getDate()).padStart(2, '0');
              lote = `${year}${month}${day}`;
            }
          }
          break;
        default:
          lote = registro.lote || registro.loteprod || '';
      }

      if (!lote) throw new Error('No se pudo determinar el lote del registro');

      setLoteUsado(lote);
      const trazaResponse = await getTrazabilidadByLote(lote);
      
      if (trazaResponse.success) {
        setTrazabilidad(trazaResponse.data);
      } else {
        throw new Error(trazaResponse.error || 'Error al obtener trazabilidad');
      }

    } catch (err) {
      setError(err.message);    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Agregar estilos de impresión
    const styleSheet = document.createElement('style');
    styleSheet.id = 'print-styles';
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    
    // Imprimir
    window.print();
    
    // Limpiar estilos después de imprimir
    setTimeout(() => {
      const printStyleElement = document.getElementById('print-styles');
      if (printStyleElement) printStyleElement.remove();
    }, 1000);
  };

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent bg="white" maxH="90vh">
          <ModalHeader bg="#5D1A1A" color="white" borderTopRadius="md">
            <HStack spacing={3}>
              <SearchIcon />
              <Text fontWeight="bold">Trazabilidad Completa</Text>
              {loteUsado && (
                <Badge bg="orange.400" color="white" fontSize="md" px={3} py={1} borderRadius="md">
                  Lote: {loteUsado}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody p={6} bg="white">
            {loading && (
              <Box textAlign="center" py={12}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="orange.500" thickness="4px" />
                  <Text color="gray.600">Buscando registros relacionados...</Text>
                </VStack>
              </Box>
            )}

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Error: {error}</Text>
                  <Button size="sm" mt={2} colorScheme="orange" onClick={fetchTrazabilidad}>
                    Reintentar
                  </Button>
                </Box>
              </Alert>
            )}

            {trazabilidad && !loading && (
              <DiagramaTrazabilidad data={trazabilidad} />
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.200" borderBottomRadius="md">
            <HStack spacing={3}>
              <Button colorScheme="orange" onClick={handlePrint} leftIcon={<ViewIcon />}>
                Imprimir
              </Button>
              <Button variant="outline" colorScheme="gray" onClick={onClose} leftIcon={<CloseIcon />}>
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DOCUMENTO PARA IMPRESIÓN */}
      {trazabilidad && (
        <DocumentoImpresion 
          ref={printRef}
          data={trazabilidad} 
          lote={loteUsado} 
          fecha={fechaActual}
        />
      )}
    </>
  );
};

// ============================================================================
// COMPONENTE: Diagrama de Trazabilidad
// ============================================================================
const DiagramaTrazabilidad = ({ data }) => {
  const { loteConsultado, expendio, envasado, produccion, pesado, recepcion, semielaborado = [], resumen } = data;
  const etapasTotales = resumen.etapasTotales || 6;

  return (
    <VStack spacing={6} align="stretch">
      {/* Resumen */}
      <Flex 
        justify="space-between" 
        align="center" 
        wrap="wrap" 
        gap={4} 
        p={4} 
        bg="gray.50" 
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <HStack spacing={4} wrap="wrap">
          <Badge bg="gray.600" color="white" fontSize="sm" p={2} borderRadius="md">
            📊 {resumen.totalRegistros} registros
          </Badge>
          <Badge bg="gray.600" color="white" fontSize="sm" p={2} borderRadius="md">
            📋 {resumen.etapasEncontradas}/{etapasTotales} etapas
          </Badge>
          <Badge 
            bg={resumen.completitud === 'completa' ? 'green.500' : resumen.completitud === 'parcial' ? 'yellow.500' : 'red.500'}
            color="white"
            fontSize="sm" 
            p={2}
            borderRadius="md"
          >
            {resumen.completitud === 'completa' ? '✓ COMPLETA' : 
             resumen.completitud === 'parcial' ? '⚠ PARCIAL' : '✗ INCOMPLETA'}
          </Badge>
        </HStack>
      </Flex>

      {/* Advertencias */}
      {resumen.warnings.length > 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">{resumen.warnings.join(' • ')}</Text>
        </Alert>
      )}

      {/* DIAGRAMA VISUAL */}
      <Box 
        p={6} 
        bg="white" 
        borderRadius="lg" 
        border="1px solid" 
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Heading size="md" mb={6} textAlign="center" color="gray.700">
          Diagrama de Flujo
        </Heading>

        <Flex direction="column" align="center" gap={1}>
          {/* RECEPCIÓN */}
          <NodoSector titulo="RECEPCIÓN" icono="📥" cantidad={recepcion.length} />
          <Flecha label="lote materia prima" />
          
          <NodoSector titulo="SEMIELABORADOS" icono="🧪" cantidad={semielaborado.length} small />
          <Flecha label="elaboración intermedia" />
          
          {/* PESADO */}
          <NodoSector titulo="PESADO" icono="⚖️" cantidad={pesado.length} />
          <Flecha label="fecha de pesado" />
          
          {/* PRODUCCIÓN */}
          <NodoSector titulo="PRODUCCIÓN" icono="🏭" cantidad={produccion.length} destacado />
          
          {/* Bifurcación */}
          <Box w="100%" maxW="400px" my={3}>
            <Flex justify="center"><Box w="2px" h="15px" bg="gray.400" /></Flex>
            <Box h="2px" bg="gray.400" w="80%" mx="auto" />
            <Flex justify="space-around" w="80%" mx="auto">
              <Box w="2px" h="15px" bg="gray.400" />
              <Box w="2px" h="15px" bg="gray.400" />
            </Flex>
            <Flex justify="space-around" w="80%" mx="auto" fontSize="xs" color="gray.600" fontWeight="medium">
              <Text>fecha elaboración</Text>
              <Text>lote producción</Text>
            </Flex>
          </Box>

          {/* ENVASADO y EXPENDIO */}
          <Flex direction="column" align="center" gap={1}>
            <NodoSector titulo="ENVASADO" icono="📦" cantidad={envasado.length} />
            <Flecha label="lote de producción" />
            <NodoSector titulo="EXPENDIO" icono="🚚" cantidad={expendio.length} />
          </Flex>
        </Flex>
      </Box>

      {/* DETALLE EN TABS */}
      <Box bg="white" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.200" boxShadow="sm">
        <Tabs colorScheme="orange" variant="enclosed">
          <TabList bg="gray.50" px={2} pt={2} flexWrap="wrap" borderBottom="1px solid" borderColor="gray.200">
            <TabItem label="Recepción" cantidad={recepcion.length} icono="📥" />
            <TabItem label="Semielaborados" cantidad={semielaborado.length} icono="🧪" />
            <TabItem label="Producción" cantidad={produccion.length} icono="🏭" />
            <TabItem label="Pesado" cantidad={pesado.length} icono="⚖️" />
            <TabItem label="Envasado" cantidad={envasado.length} icono="📦" />
            <TabItem label="Expendio" cantidad={expendio.length} icono="🚚" />
          </TabList>

          <TabPanels bg="white">
            <TabPanel p={0}><TablaRegistros registros={recepcion} tipo="recepcion" /></TabPanel>
            <TabPanel p={0}><TablaRegistros registros={semielaborado} tipo="semielaborado" /></TabPanel>
            <TabPanel p={0}><TablaRegistros registros={produccion} tipo="produccion" /></TabPanel>
            <TabPanel p={0}><TablaRegistros registros={pesado} tipo="pesado" /></TabPanel>
            <TabPanel p={0}><TablaRegistros registros={envasado} tipo="envasado" /></TabPanel>
            <TabPanel p={0}><TablaRegistros registros={expendio} tipo="expendio" /></TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </VStack>
  );
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================
const NodoSector = ({ titulo, icono, cantidad, destacado, small }) => {
  const hasData = cantidad > 0;
  return (
    <Box
      bg={hasData ? '#5D1A1A' : 'gray.200'}
      color="white"
      p={small ? 3 : 4}
      borderRadius="lg"
      minW={small ? "120px" : "160px"}
      textAlign="center"
      boxShadow="sm"
      border={destacado ? '3px solid' : '1px solid'}
      borderColor={destacado ? 'orange.400' : hasData ? '#5D1A1A' : 'gray.300'}
      opacity={hasData ? 1 : 0.5}
      transform={destacado ? 'scale(1.05)' : 'none'}
    >
      <Text fontSize={small ? "xl" : "2xl"}>{icono}</Text>
      <Text fontWeight="bold" fontSize={small ? "xs" : "sm"}>{titulo}</Text>
      <Badge mt={1} bg={hasData ? 'orange.400' : 'gray.400'} color="white" fontSize="xs">
        {cantidad} REG.
      </Badge>
    </Box>
  );
};

const Flecha = ({ label }) => (
  <VStack spacing={0} my={1}>
    <Box w="2px" h="12px" bg="gray.400" />
    <Box bg="gray.100" px={3} py={1} borderRadius="full" border="1px solid" borderColor="gray.300">
      <Text fontSize="xs" color="gray.600" fontWeight="medium">↓ {label}</Text>
    </Box>
    <Box w="2px" h="12px" bg="gray.400" />
  </VStack>
);

const TabItem = ({ label, cantidad, icono }) => (
  <Tab 
    _selected={{ bg: 'white', color: '#5D1A1A', borderColor: 'gray.200', borderBottomColor: 'white' }} 
    borderTopRadius="md" 
    mr={1}
    fontWeight="medium"
    color="gray.600"
  >
    <HStack spacing={1}>
      <Text>{icono}</Text>
      <Text fontSize="sm">{label}</Text>
      <Badge bg={cantidad > 0 ? 'orange.400' : 'gray.300'} color="white" borderRadius="full" fontSize="xs">
        {cantidad}
      </Badge>
    </HStack>
  </Tab>
);

// ============================================================================
// TABLA DE REGISTROS UNIFICADA - INFORMACIÓN COMPLETA
// ============================================================================
const TablaRegistros = ({ registros, tipo }) => {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '-';
  const formatBool = (b) => b ? 'Sí' : 'No';

  if (!registros.length) {
    return (
      <Box p={8} textAlign="center" bg="white">
        <Text fontSize="2xl">📭</Text>
        <Text color="gray.500">Sin registros en esta etapa</Text>
      </Box>
    );
  }

  const columnas = {
    expendio: [
      { key: 'id', label: 'ID' },
      { key: 'producto', label: 'PRODUCTO' },
      { key: 'lote', label: 'LOTE', highlight: true },
      { key: 'destino', label: 'DESTINO' },
      { key: 'temptransporte', label: 'TEMP. TRANSP.', suffix: '°C' },
      { key: 'limptransporte', label: 'LIMP. TRANSP.', bool: true },
      { key: 'responsable', label: 'RESPONSABLE', highlight: true },
      { key: 'createdat', label: 'FECHA CREACIÓN', date: true },
    ],
    envasado: [
      { key: 'id', label: 'ID' },
      { key: 'producto', label: 'PRODUCTO' },
      { key: 'loteprod', label: 'LOTE PROD', highlight: true },
      { key: 'loteenvasado', label: 'LOTE ENVASADO', highlight: true },
      { key: 'cantenvases', label: 'CANT. ENVASES' },
      { key: 'cantdescarte', label: 'DESCARTE' },
      { key: 'fechaelaboracion', label: 'FECHA ELAB.', date: true },
      { key: 'observaciones', label: 'OBSERVACIONES' },
      { key: 'createdat', label: 'FECHA CREACIÓN', date: true },
    ],
    produccion: [
      { key: 'id', label: 'ID' },
      { key: 'producto', label: 'PRODUCTO' },
      { key: 'lote', label: 'LOTE', highlight: true },
      { key: 'materiaprima', label: 'MATERIA PRIMA' },
      { key: 'planproduccion', label: 'PLAN PROD.', suffix: ' kg' },
      { key: 'produccion', label: 'PRODUCCIÓN', suffix: ' kg' },
      { key: 'pesodescarte', label: 'DESCARTE', suffix: ' kg' },
      { key: 'fechaelaboracion', label: 'FECHA ELAB.', date: true },
      { key: 'observaciones', label: 'OBSERVACIONES' },
      { key: 'createdat', label: 'FECHA CREACIÓN', date: true },
    ],
    pesado: [
      { key: 'id', label: 'ID' },
      { key: 'producto', label: 'PRODUCTO' },
      { key: 'materiaprima', label: 'MATERIA PRIMA' },
      { key: 'peso', label: 'PESO', suffix: ' kg' },
      { key: 'lotemateriaprima', label: 'LOTE MP', highlight: true },
      { key: 'fecha', label: 'FECHA', date: true },
      { key: 'observaciones', label: 'OBSERVACIONES' },
      { key: 'createdat', label: 'FECHA CREACIÓN', date: true },
    ],
    recepcion: [
      { key: 'id', label: 'ID' },
      { key: 'materiaprima', label: 'MATERIA PRIMA' },
      { key: 'control1', label: 'CTRL. TRANSP.' },
      { key: 'control2', label: 'CTRL. ENVASE' },
      { key: 'control3', label: 'CTRL. ROTULADO' },
      { key: 'marca', label: 'MARCA' },
      { key: 'proveedor', label: 'PROVEEDOR' },
      { key: 'cant', label: 'CANTIDAD' },
      { key: 'nroremito', label: 'NRO. REMITO' },
      { key: 'temp', label: 'TEMP.', suffix: '°C' },
      { key: 'fechaelaborado', label: 'FECHA ELAB.', date: true },
      { key: 'fechavto', label: 'FECHA VTO.', date: true },
      { key: 'lote', label: 'LOTE', highlight: true },
      { key: 'createdat', label: 'FECHA CREACIÓN', date: true },
    ],
    semielaborado: [
      { key: 'id', label: 'ID' },
      { key: 'semielaborado', label: 'SEMIELABORADO', highlight: true },
      { key: 'ingrediente', label: 'INGREDIENTE' },
      { key: 'lotemateriaprima', label: 'LOTE MP', highlight: true },
      { key: 'lote', label: 'LOTE SEMI.', highlight: true },
      { key: 'peso', label: 'PESO', suffix: ' kg' },
      { key: 'fecha', label: 'FECHA', date: true },
      { key: 'observaciones', label: 'OBSERVACIONES' },
      { key: 'responsable', label: 'RESPONSABLE' },
      { key: 'created_at', label: 'FECHA CREACIÓN', date: true },
    ],
  };

  const cols = columnas[tipo] || [];

  return (
    <TableContainer maxH="400px" overflowY="auto">
      <Table size="sm" variant="simple">
        <Thead position="sticky" top={0} zIndex={1}>
          <Tr bg="gray.50" borderBottom="2px solid" borderColor="gray.200">
            {cols.map(col => (
              <Th 
                key={col.key} 
                color="gray.700" 
                fontSize="xs" 
                fontWeight="bold"
                textTransform="uppercase"
                py={3}
                whiteSpace="nowrap"
              >
                {col.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {registros.map((registro, idx) => (
            <Tr 
              key={registro.id || idx} 
              _hover={{ bg: 'gray.50' }}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              {cols.map(col => (
                <Td 
                  key={col.key} 
                  py={3}
                  bg={col.highlight ? 'blue.50' : 'white'}
                  color={col.highlight ? 'blue.700' : 'gray.700'}
                  fontWeight={col.highlight ? 'medium' : 'normal'}
                  whiteSpace="nowrap"
                  maxW="200px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  title={registro[col.key]?.toString() || ''}
                >
                  {col.date ? (
                    formatDate(registro[col.key])
                  ) : col.bool ? (
                    formatBool(registro[col.key])
                  ) : col.key === 'id' ? (
                    <Text fontWeight="medium" color="gray.600">{registro[col.key]}</Text>
                  ) : (
                    (registro[col.key] ?? '-') + (col.suffix && registro[col.key] ? col.suffix : '')
                  )}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

// ============================================================================
// DOCUMENTO PARA IMPRESIÓN - FORMATO OFICIAL CON INFORMACIÓN COMPLETA
// ============================================================================
const DocumentoImpresion = React.forwardRef(({ data, lote, fecha }, ref) => {
  const { expendio, envasado, produccion, pesado, recepcion, semielaborado = [], resumen } = data;
  const etapasTotales = resumen.etapasTotales || 6;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '-';
  const formatBool = (b) => b ? 'Sí' : 'No';

  // Componente para sección con título
  const SeccionTabla = ({ numero, titulo, registros, children }) => (
    <Box 
      mb={8} 
      border="2px solid" 
      borderColor="gray.300" 
      borderRadius="lg"
      overflow="hidden"
      sx={{ pageBreakInside: 'avoid' }}
    >
      <Box 
        bg="#5D1A1A" 
        color="white" 
        py={3} 
        px={4}
      >
        <Text fontWeight="bold" fontSize="11pt">
          {numero}. {titulo}
        </Text>
        <Text fontSize="9pt" opacity={0.9}>
          {registros} registro(s) encontrado(s)
        </Text>
      </Box>
      <Box p={4} bg="white">
        {children}
      </Box>
    </Box>
  );

  return (
    <Box
      id="print-document"
      ref={ref}
      position="fixed"
      left="-9999px"
      top="0"
      width="297mm"
      minHeight="210mm"
      bg="white"
      p={8}
      fontFamily="Arial, sans-serif"
      fontSize="9pt"
      color="black"
    >
      {/* ENCABEZADO OFICIAL */}
      <Flex 
        className="print-header"
        justify="space-between" 
        align="center" 
        bg="#5D1A1A" 
        color="white" 
        p={4} 
        mb={6}
        borderRadius="lg"
      >
        <HStack spacing={4}>
          <Image src={logo} alt="Il Sole" h="50px" />
          <Box>
            <Text fontSize="xl" fontWeight="bold">IL SOLE</Text>
            <Text fontSize="sm">Sistema de Gestión de Trazabilidad</Text>
          </Box>
        </HStack>
        <Box textAlign="right">
          <Text fontSize="sm">Documento generado el:</Text>
          <Text fontSize="md" fontWeight="bold">{fecha}</Text>
        </Box>
      </Flex>

      {/* TÍTULO DEL DOCUMENTO */}
      <Box textAlign="center" mb={6} py={4} borderBottom="3px solid" borderColor="#5D1A1A">
        <Heading size="lg" color="#5D1A1A" mb={2}>
          INFORME DE TRAZABILIDAD COMPLETA
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Lote de Producción: <strong style={{ color: '#5D1A1A' }}>{lote}</strong>
        </Text>
      </Box>

      {/* RESUMEN EJECUTIVO */}
      <Box 
        className="print-section-header"
        bg="gray.50" 
        p={5} 
        mb={8} 
        borderRadius="lg"
        border="2px solid"
        borderColor="gray.300"
      >
        <Text fontWeight="bold" color="#5D1A1A" mb={4} fontSize="12pt">
          📊 RESUMEN DE TRAZABILIDAD
        </Text>
        <Flex justify="space-around" wrap="wrap" gap={6}>
          <Box textAlign="center" p={4} bg="white" borderRadius="md" minW="150px" boxShadow="sm">
            <Text fontSize="sm" color="gray.600" mb={1}>Total de Registros</Text>
            <Text fontSize="2xl" fontWeight="bold" color="#5D1A1A">{resumen.totalRegistros}</Text>
          </Box>
          <Box textAlign="center" p={4} bg="white" borderRadius="md" minW="150px" boxShadow="sm">
            <Text fontSize="sm" color="gray.600" mb={1}>Etapas Encontradas</Text>
            <Text fontSize="2xl" fontWeight="bold" color="#5D1A1A">{resumen.etapasEncontradas}/{etapasTotales}</Text>
          </Box>
          <Box textAlign="center" p={4} bg="white" borderRadius="md" minW="150px" boxShadow="sm">
            <Text fontSize="sm" color="gray.600" mb={1}>Estado de Trazabilidad</Text>
            <Text fontSize="xl" fontWeight="bold" color={
              resumen.completitud === 'completa' ? 'green.600' : 
              resumen.completitud === 'parcial' ? 'orange.600' : 'red.600'
            }>
              {resumen.completitud === 'completa' ? '✓ COMPLETA' : 
               resumen.completitud === 'parcial' ? '⚠ PARCIAL' : '✗ INCOMPLETA'}
            </Text>
          </Box>
        </Flex>
      </Box>

      <Divider my={6} borderColor="gray.300" borderWidth="2px" />

      {/* TABLAS DE DETALLE - INFORMACIÓN COMPLETA - ORDEN DEL PROCESO */}
      
      {/* RECEPCIÓN */}
      {recepcion.length > 0 && (
        <SeccionTabla numero="1" titulo="RECEPCIÓN DE MATERIA PRIMA" registros={recepcion.length}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr bg="gray.100">
                <Th py={3} fontSize="8pt" borderColor="gray.300">ID</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">MATERIA PRIMA</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">CONTROLES</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">MARCA</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PROVEEDOR</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">CANTIDAD</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">NRO. REMITO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">TEMP.</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">FECHA ELAB.</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">FECHA VTO.</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LOTE</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recepcion.map((r, i) => (
                <Tr key={i} bg={i % 2 === 0 ? 'white' : 'gray.50'}>
                  <Td py={3} borderColor="gray.200">{r.id}</Td>
                  <Td py={3} borderColor="gray.200">{r.materiaprima || '-'}</Td>
                  <Td py={3} borderColor="gray.200" fontSize="8pt">
                    T: {r.control1 || '-'} | E: {r.control2 || '-'} | R: {r.control3 || '-'}
                  </Td>
                  <Td py={3} borderColor="gray.200">{r.marca || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.proveedor || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.cant || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.nroremito || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.temp ? `${r.temp}°C` : '-'}</Td>
                  <Td py={3} borderColor="gray.200">{formatDate(r.fechaelaborado)}</Td>
                  <Td py={3} borderColor="gray.200">{formatDate(r.fechavto)}</Td>
                  <Td py={3} borderColor="gray.200" fontWeight="bold" color="#5D1A1A">{r.lote || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </SeccionTabla>
      )}

      {/* SEMIELABORADOS */}
      {semielaborado.length > 0 && (
        <SeccionTabla numero="2" titulo="SEMIELABORADOS" registros={semielaborado.length}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr bg="gray.100">
                <Th py={3} fontSize="8pt" borderColor="gray.300">ID</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">SEMIELABORADO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">INGREDIENTE</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LOTE MP</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LOTE</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PESO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">FECHA</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">RESPONSABLE</Th>
              </Tr>
            </Thead>
            <Tbody>
              {semielaborado.map((r, i) => (
                <Tr key={i} bg={i % 2 === 0 ? 'white' : 'gray.50'}>
                  <Td py={3} borderColor="gray.200">{r.id}</Td>
                  <Td py={3} borderColor="gray.200">{r.semielaborado || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.ingrediente || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.lotemateriaprima || '-'}</Td>
                  <Td py={3} borderColor="gray.200" fontWeight="bold" color="#5D1A1A">{r.lote || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.peso != null ? `${r.peso} kg` : '-'}</Td>
                  <Td py={3} borderColor="gray.200">{formatDate(r.fecha)}</Td>
                  <Td py={3} borderColor="gray.200">{r.responsable || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </SeccionTabla>
      )}

      {/* PRODUCCIÓN */}
      {produccion.length > 0 && (
        <SeccionTabla numero="3" titulo="PRODUCCIÓN" registros={produccion.length}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr bg="gray.100">
                <Th py={3} fontSize="8pt" borderColor="gray.300">ID</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PRODUCTO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LOTE</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">MATERIA PRIMA</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PLAN PROD.</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PRODUCCIÓN</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">DESCARTE</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">FECHA ELAB.</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">OBSERVACIONES</Th>
              </Tr>
            </Thead>
            <Tbody>
              {produccion.map((r, i) => (
                <Tr key={i} bg={i % 2 === 0 ? 'white' : 'gray.50'}>
                  <Td py={3} borderColor="gray.200">{r.id}</Td>
                  <Td py={3} borderColor="gray.200">{r.producto || '-'}</Td>
                  <Td py={3} borderColor="gray.200" fontWeight="bold" color="#5D1A1A">{r.lote || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.materiaprima || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.planproduccion ? `${r.planproduccion} kg` : '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.produccion ? `${r.produccion} kg` : '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.pesodescarte ? `${r.pesodescarte} kg` : '0 kg'}</Td>
                  <Td py={3} borderColor="gray.200">{formatDate(r.fechaelaboracion)}</Td>
                  <Td py={3} borderColor="gray.200" maxW="150px">{r.observaciones || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </SeccionTabla>
      )}

      {/* PESADO */}
      {pesado.length > 0 && (
        <SeccionTabla numero="4" titulo="CONTROL DE PESADO" registros={pesado.length}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr bg="gray.100">
                <Th py={3} fontSize="8pt" borderColor="gray.300">ID</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PRODUCTO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">MATERIA PRIMA</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PESO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LOTE MP</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">FECHA</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">OBSERVACIONES</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pesado.map((r, i) => (
                <Tr key={i} bg={i % 2 === 0 ? 'white' : 'gray.50'}>
                  <Td py={3} borderColor="gray.200">{r.id}</Td>
                  <Td py={3} borderColor="gray.200">{r.producto || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.materiaprima || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.peso ? `${r.peso} kg` : '-'}</Td>
                  <Td py={3} borderColor="gray.200" fontWeight="bold" color="#5D1A1A">{r.lotemateriaprima || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{formatDate(r.fecha)}</Td>
                  <Td py={3} borderColor="gray.200" maxW="150px">{r.observaciones || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </SeccionTabla>
      )}

      {/* ENVASADO */}
      {envasado.length > 0 && (
        <SeccionTabla numero="5" titulo="ENVASADO" registros={envasado.length}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr bg="gray.100">
                <Th py={3} fontSize="8pt" borderColor="gray.300">ID</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PRODUCTO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LOTE PROD</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LOTE ENVASADO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">CANT. ENVASES</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">DESCARTE</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">FECHA ELAB.</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">OBSERVACIONES</Th>
              </Tr>
            </Thead>
            <Tbody>
              {envasado.map((r, i) => (
                <Tr key={i} bg={i % 2 === 0 ? 'white' : 'gray.50'}>
                  <Td py={3} borderColor="gray.200">{r.id}</Td>
                  <Td py={3} borderColor="gray.200">{r.producto || '-'}</Td>
                  <Td py={3} borderColor="gray.200" fontWeight="bold" color="#5D1A1A">{r.loteprod || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.loteenvasado || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.cantenvases || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.cantdescarte || '0'}</Td>
                  <Td py={3} borderColor="gray.200">{formatDate(r.fechaelaboracion)}</Td>
                  <Td py={3} borderColor="gray.200" maxW="150px">{r.observaciones || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </SeccionTabla>
      )}

      {/* EXPENDIO */}
      {expendio.length > 0 && (
        <SeccionTabla numero="6" titulo="EXPENDIO / DISTRIBUCIÓN" registros={expendio.length}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr bg="gray.100">
                <Th py={3} fontSize="8pt" borderColor="gray.300">ID</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">PRODUCTO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LOTE</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">DESTINO</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">TEMP. TRANSP.</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">LIMP. TRANSP.</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">RESPONSABLE</Th>
                <Th py={3} fontSize="8pt" borderColor="gray.300">FECHA CREACIÓN</Th>
              </Tr>
            </Thead>
            <Tbody>
              {expendio.map((r, i) => (
                <Tr key={i} bg={i % 2 === 0 ? 'white' : 'gray.50'}>
                  <Td py={3} borderColor="gray.200">{r.id}</Td>
                  <Td py={3} borderColor="gray.200">{r.producto || '-'}</Td>
                  <Td py={3} borderColor="gray.200" fontWeight="bold" color="#5D1A1A">{r.lote || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.destino || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{r.temptransporte ? `${r.temptransporte}°C` : '-'}</Td>
                  <Td py={3} borderColor="gray.200">{formatBool(r.limptransporte)}</Td>
                  <Td py={3} borderColor="gray.200">{r.responsable || '-'}</Td>
                  <Td py={3} borderColor="gray.200">{formatDate(r.createdat)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </SeccionTabla>
      )}

      {/* PIE DE PÁGINA */}
      <Box mt={8} pt={4} borderTop="2px solid" borderColor="#5D1A1A" textAlign="center">
        <Text fontSize="sm" color="gray.600" mb={1}>
          Documento generado automáticamente por el Sistema de Gestión Il Sole
        </Text>
        <Text fontSize="sm" color="gray.600">
          <strong>Lote:</strong> {lote} | <strong>Fecha de emisión:</strong> {fecha}
        </Text>
      </Box>
    </Box>
  );
});

DocumentoImpresion.displayName = 'DocumentoImpresion';

export default TrazabilidadModal;
