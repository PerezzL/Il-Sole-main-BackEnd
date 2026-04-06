/**
 * ============================================================================
 * COMPONENTE: Diagrama de Trazabilidad con Flechas
 * ============================================================================
 * 
 * LÓGICA DE CONEXIONES:
 * - Expendio → Envasado (por lote de producción)
 * - Envasado → Producción (por fecha de elaboración)
 * - Producción → Pesado (por lote de pesada)
 * - Producción → Recepción (por lote de materia prima)
 * - Pesado → Producción (por fecha de pesado = lote de producción)
 * - Pesado → Recepción (por lote de materia prima)
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Flex,
  Button,
  Collapse,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const TrazabilidadFlujo = ({ data }) => {
  if (!data) return null;

  const { loteConsultado, expendio, envasado, produccion, pesado, recepcion, semielaborado = [], resumen } = data;
  const etapasTotales = resumen.etapasTotales || 6;
  const [selectedEtapa, setSelectedEtapa] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const abrirDetalle = (etapa, registros, titulo) => {
    setSelectedEtapa({ etapa, registros, titulo });
    onOpen();
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* ENCABEZADO */}
      <Box
        bgGradient="linear(to-r, orange.500, red.500)"
        p={5}
        borderRadius="xl"
        color="white"
        boxShadow="lg"
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Text fontSize="sm" opacity={0.9}>Trazabilidad del Lote</Text>
            <Heading size="lg">{loteConsultado}</Heading>
          </Box>
          <HStack spacing={3}>
            <Badge colorScheme="blackAlpha" fontSize="md" p={2} borderRadius="md" bg="whiteAlpha.300">
              📊 {resumen.totalRegistros} registros
            </Badge>
            <Badge colorScheme="blackAlpha" fontSize="md" p={2} borderRadius="md" bg="whiteAlpha.300">
              📋 {resumen.etapasEncontradas}/{etapasTotales} etapas
            </Badge>
            <Badge 
              fontSize="md" 
              p={2} 
              borderRadius="md"
              bg={resumen.completitud === 'completa' ? 'green.400' : 
                  resumen.completitud === 'parcial' ? 'yellow.400' : 'red.400'}
              color="white"
            >
              {resumen.completitud === 'completa' ? '✓ COMPLETA' : 
               resumen.completitud === 'parcial' ? '⚠ PARCIAL' : '✗ INCOMPLETA'}
            </Badge>
          </HStack>
        </Flex>
      </Box>

      {/* ADVERTENCIAS */}
      {resumen.warnings.length > 0 && (
        <Alert status="warning" borderRadius="lg" variant="left-accent">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Etapas sin datos:</Text>
            <Text fontSize="sm">{resumen.warnings.join(' • ')}</Text>
          </Box>
        </Alert>
      )}

      {/* ================================================================
          DIAGRAMA DE FLUJO CON FLECHAS
          ================================================================ */}
      <Box 
        bg="gray.900" 
        p={8} 
        borderRadius="2xl" 
        position="relative"
        minH="500px"
      >
        <Heading size="md" color="white" textAlign="center" mb={8}>
          📊 Diagrama de Trazabilidad
        </Heading>

        {/* Contenedor del diagrama */}
        <Box position="relative" maxW="900px" mx="auto">
          
          {/* FILA 1: EXPENDIO */}
          <Flex justify="center" mb={2}>
            <NodoSector
              titulo="EXPENDIO"
              icono="🚚"
              cantidad={expendio.length}
              color="purple"
              onClick={() => abrirDetalle('expendio', expendio, 'Expendio')}
            />
          </Flex>

          {/* FLECHA: Expendio → Envasado */}
          <FlechaVertical label="lote de producción" />

          {/* FILA 2: ENVASADO */}
          <Flex justify="center" mb={2}>
            <NodoSector
              titulo="ENVASADO"
              icono="📦"
              cantidad={envasado.length}
              color="blue"
              onClick={() => abrirDetalle('envasado', envasado, 'Envasado')}
            />
          </Flex>

          {/* FLECHA: Envasado → Producción */}
          <FlechaVertical label="fecha de elaboración" />

          {/* FILA 3: PRODUCCIÓN (CENTRAL) */}
          <Flex justify="center" mb={2}>
            <NodoSector
              titulo="PRODUCCIÓN"
              icono="🏭"
              cantidad={produccion.length}
              color="green"
              destacado
              onClick={() => abrirDetalle('produccion', produccion, 'Producción')}
            />
          </Flex>

          {/* FLECHAS BIFURCADAS desde Producción */}
          <Box position="relative" h="80px" mb={2}>
            {/* Línea vertical desde producción */}
            <Box 
              position="absolute" 
              left="50%" 
              top="0" 
              w="4px" 
              h="20px" 
              bg="green.400" 
              transform="translateX(-50%)"
            />
            
            {/* Línea horizontal */}
            <Box 
              position="absolute" 
              left="25%" 
              top="20px" 
              w="50%" 
              h="4px" 
              bg="green.400"
            />
            
            {/* Línea vertical izquierda (hacia Pesado) */}
            <Box 
              position="absolute" 
              left="25%" 
              top="20px" 
              w="4px" 
              h="40px" 
              bg="orange.400" 
              transform="translateX(-50%)"
            />
            
            {/* Línea vertical derecha (hacia Recepción) */}
            <Box 
              position="absolute" 
              left="75%" 
              top="20px" 
              w="4px" 
              h="40px" 
              bg="teal.400" 
              transform="translateX(-50%)"
            />

            {/* Labels */}
            <Text 
              position="absolute" 
              left="25%" 
              top="65px" 
              transform="translateX(-50%)" 
              fontSize="xs" 
              color="orange.300"
              textAlign="center"
              w="120px"
            >
              lote de pesada
            </Text>
            <Text 
              position="absolute" 
              left="75%" 
              top="65px" 
              transform="translateX(-50%)" 
              fontSize="xs" 
              color="teal.300"
              textAlign="center"
              w="120px"
            >
              lote materia prima
            </Text>

            {/* Flechas (triángulos) */}
            <Box
              position="absolute"
              left="25%"
              top="56px"
              transform="translateX(-50%)"
              w="0"
              h="0"
              borderLeft="8px solid transparent"
              borderRight="8px solid transparent"
              borderTop="12px solid"
              borderTopColor="orange.400"
            />
            <Box
              position="absolute"
              left="75%"
              top="56px"
              transform="translateX(-50%)"
              w="0"
              h="0"
              borderLeft="8px solid transparent"
              borderRight="8px solid transparent"
              borderTop="12px solid"
              borderTopColor="teal.400"
            />
          </Box>

          {/* FILA 4: RECEPCIÓN, SEMIELABORADOS y PESADO */}
          <Flex justify="space-around" mb={4} px={4} wrap="wrap" gap={3}>
            <NodoSector
              titulo="RECEPCIÓN"
              icono="📥"
              cantidad={recepcion.length}
              color="teal"
              onClick={() => abrirDetalle('recepcion', recepcion, 'Recepción')}
            />
            <NodoSector
              titulo="SEMIELABORADOS"
              icono="🧪"
              cantidad={semielaborado.length}
              color="cyan"
              onClick={() => abrirDetalle('semielaborado', semielaborado, 'Semielaborados')}
            />
            <NodoSector
              titulo="PESADO"
              icono="⚖️"
              cantidad={pesado.length}
              color="orange"
              onClick={() => abrirDetalle('pesado', pesado, 'Control de Pesado')}
            />
          </Flex>

          {/* FLECHA: Pesado → Recepción (horizontal) */}
          <Box position="relative" h="40px" px={8}>
            <Box 
              position="absolute" 
              left="calc(25% + 80px)" 
              top="0" 
              w="calc(50% - 160px)" 
              h="4px" 
              bg="yellow.400"
            />
            <Text 
              position="absolute" 
              left="50%" 
              top="10px" 
              transform="translateX(-50%)" 
              fontSize="xs" 
              color="yellow.300"
              bg="gray.900"
              px={2}
            >
              lote materia prima
            </Text>
            {/* Flecha apuntando a Recepción */}
            <Box
              position="absolute"
              right="calc(25% + 60px)"
              top="-4px"
              w="0"
              h="0"
              borderTop="8px solid transparent"
              borderBottom="8px solid transparent"
              borderLeft="12px solid"
              borderLeftColor="yellow.400"
            />
          </Box>

          {/* FLECHA BIDIRECCIONAL: Pesado ↔ Producción */}
          <Box 
            position="absolute" 
            left="10%" 
            top="50%" 
            transform="translateY(-50%)"
            textAlign="center"
          >
            <Box 
              w="4px" 
              h="100px" 
              bg="pink.400" 
              mx="auto"
              borderRadius="full"
            />
            <Text fontSize="xs" color="pink.300" mt={1} w="80px">
              fecha pesado = lote prod
            </Text>
            {/* Flechas bidireccionales */}
            <Box
              position="absolute"
              top="-6px"
              left="50%"
              transform="translateX(-50%)"
              w="0"
              h="0"
              borderLeft="6px solid transparent"
              borderRight="6px solid transparent"
              borderBottom="10px solid"
              borderBottomColor="pink.400"
            />
            <Box
              position="absolute"
              bottom="20px"
              left="50%"
              transform="translateX(-50%)"
              w="0"
              h="0"
              borderLeft="6px solid transparent"
              borderRight="6px solid transparent"
              borderTop="10px solid"
              borderTopColor="pink.400"
            />
          </Box>

        </Box>

        {/* LEYENDA */}
        <Box mt={8} p={4} bg="gray.800" borderRadius="lg">
          <Text color="gray.400" fontSize="sm" fontWeight="bold" mb={2}>LEYENDA DE CONEXIONES:</Text>
          <Flex wrap="wrap" gap={4} fontSize="xs">
            <LeyendaItem color="purple.400" texto="Expendio → Envasado (lote producción)" />
            <LeyendaItem color="blue.400" texto="Envasado → Producción (fecha elaboración)" />
            <LeyendaItem color="orange.400" texto="Producción → Pesado (lote pesada)" />
            <LeyendaItem color="teal.400" texto="Producción → Recepción (lote MP)" />
            <LeyendaItem color="yellow.400" texto="Pesado → Recepción (lote MP)" />
            <LeyendaItem color="pink.400" texto="Pesado ↔ Producción (fecha = lote)" />
            <LeyendaItem color="cyan.400" texto="Recepción / Pesado ↔ Semielaborados (lote MP)" />
          </Flex>
        </Box>
      </Box>

      {/* MODAL DE DETALLE */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="white" maxH="80vh">
          <ModalHeader bg="orange.500" color="white" borderTopRadius="md">
            📋 Detalle: {selectedEtapa?.titulo}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={4}>
            {selectedEtapa && (
              <TablaDetalle etapa={selectedEtapa.etapa} registros={selectedEtapa.registros} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

// ============================================================================
// COMPONENTE: Nodo de Sector
// ============================================================================
const NodoSector = ({ titulo, icono, cantidad, color, destacado, onClick }) => {
  const hasData = cantidad > 0;
  
  return (
    <Box
      bg={hasData ? `${color}.500` : 'gray.600'}
      color="white"
      p={4}
      borderRadius="xl"
      minW="150px"
      textAlign="center"
      cursor="pointer"
      onClick={onClick}
      boxShadow={destacado ? '0 0 20px rgba(72, 187, 120, 0.5)' : 'lg'}
      border={destacado ? '3px solid' : '2px solid'}
      borderColor={destacado ? 'green.300' : hasData ? `${color}.300` : 'gray.500'}
      opacity={hasData ? 1 : 0.5}
      transition="all 0.2s"
      _hover={{ 
        transform: 'scale(1.05)', 
        boxShadow: 'xl',
      }}
    >
      <Text fontSize="2xl">{icono}</Text>
      <Text fontWeight="bold" fontSize="sm">{titulo}</Text>
      <Badge 
        mt={2} 
        colorScheme={hasData ? 'green' : 'gray'} 
        variant="solid"
        fontSize="xs"
      >
        {cantidad} {cantidad === 1 ? 'registro' : 'registros'}
      </Badge>
      {hasData && (
        <Text fontSize="xs" mt={1} opacity={0.8}>
          Click para ver detalle
        </Text>
      )}
    </Box>
  );
};

// ============================================================================
// COMPONENTE: Flecha Vertical
// ============================================================================
const FlechaVertical = ({ label }) => (
  <Flex direction="column" align="center" my={1}>
    <Box w="4px" h="20px" bg="gray.500" />
    <Box 
      bg="gray.700" 
      px={3} 
      py={1} 
      borderRadius="full" 
      border="2px solid" 
      borderColor="gray.500"
    >
      <Text fontSize="xs" color="gray.300">
        ↓ {label}
      </Text>
    </Box>
    <Box w="4px" h="15px" bg="gray.500" />
    {/* Punta de flecha */}
    <Box
      w="0"
      h="0"
      borderLeft="8px solid transparent"
      borderRight="8px solid transparent"
      borderTop="12px solid"
      borderTopColor="gray.500"
    />
  </Flex>
);

// ============================================================================
// COMPONENTE: Item de Leyenda
// ============================================================================
const LeyendaItem = ({ color, texto }) => (
  <HStack spacing={2}>
    <Box w="12px" h="12px" bg={color} borderRadius="sm" />
    <Text color="gray.300">{texto}</Text>
  </HStack>
);

// ============================================================================
// COMPONENTE: Tabla de Detalle
// ============================================================================
const TablaDetalle = ({ etapa, registros }) => {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '-';

  if (!registros.length) {
    return (
      <Box p={8} textAlign="center" color="gray.500">
        <Text fontSize="4xl">📭</Text>
        <Text>No hay registros en esta etapa</Text>
      </Box>
    );
  }

  const columnas = {
    expendio: ['ID', 'Producto', 'Lote', 'Destino', 'Responsable', 'Temp.'],
    envasado: ['ID', 'Producto', 'Lote Prod', 'Lote Envasado', 'Cantidad', 'Fecha Elab.'],
    produccion: ['ID', 'Producto', 'Lote', 'Materia Prima', 'Producción', 'Fecha Elab.'],
    pesado: ['ID', 'Producto', 'Materia Prima', 'Lote MP', 'Peso', 'Fecha'],
    recepcion: ['ID', 'Materia Prima', 'Lote', 'Proveedor', 'Cantidad', 'Fecha VTO'],
    semielaborado: ['ID', 'Semielaborado', 'Ingrediente', 'Lote MP', 'Lote', 'Peso', 'Fecha'],
  };

  const renderFila = (r) => {
    switch (etapa) {
      case 'expendio':
        return [r.id, r.producto, r.lote, r.destino, r.responsable, `${r.temptransporte}°C`];
      case 'envasado':
        return [r.id, r.producto, r.loteprod, r.loteenvasado, r.cantenvases, formatDate(r.fechaelaboracion)];
      case 'produccion':
        return [r.id, r.producto, r.lote, r.materiaprima, `${r.produccion} kg`, formatDate(r.fechaelaboracion)];
      case 'pesado':
        return [r.id, r.producto, r.materiaprima, r.lotemateriaprima || '-', `${r.peso} kg`, formatDate(r.fecha)];
      case 'recepcion':
        return [r.id, r.materiaprima, r.lote, r.proveedor, r.cant, formatDate(r.fechavto)];
      case 'semielaborado':
        return [r.id, r.semielaborado, r.ingrediente, r.lotemateriaprima || '-', r.lote || '-', r.peso != null ? `${r.peso} kg` : '-', formatDate(r.fecha)];
      default:
        return [];
    }
  };

  return (
    <TableContainer>
      <Table size="sm" variant="striped" colorScheme="orange">
        <Thead bg="orange.100">
          <Tr>
            {columnas[etapa]?.map((col, i) => (
              <Th key={i}>{col}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {registros.map((r, idx) => (
            <Tr key={idx}>
              {renderFila(r).map((cell, i) => (
                <Td key={i}>{cell}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default TrazabilidadFlujo;
