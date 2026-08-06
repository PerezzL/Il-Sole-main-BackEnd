import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  Badge,
  VStack,
  Flex,
  Button,
} from '@chakra-ui/react';
import { Bell } from 'lucide-react';
import {
  getNotificaciones,
  getNotificacionesNoLeidasCount,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../config/api';

const POLL_MS = 30000;

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const intervalRef = useRef(null);

  const fetchCount = useCallback(async () => {
    try {
      const { count } = await getNotificacionesNoLeidasCount();
      setNoLeidas(count);
    } catch {
      // silencioso: no interrumpir la navegación por un fallo de polling
    }
  }, []);

  const fetchNotificaciones = useCallback(async () => {
    try {
      const data = await getNotificaciones();
      setNotificaciones(data);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    fetchCount();
    intervalRef.current = setInterval(fetchCount, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchCount]);

  const handleOpen = () => {
    fetchNotificaciones();
  };

  const handleClickNotificacion = async (notif) => {
    if (!notif.leido) {
      try {
        await marcarNotificacionLeida(notif.id);
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, leido: true } : n))
        );
        setNoLeidas((prev) => Math.max(0, prev - 1));
      } catch {
        // silencioso
      }
    }
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
      setNoLeidas(0);
    } catch {
      // silencioso
    }
  };

  return (
    <Menu onOpen={handleOpen} placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="Notificaciones"
        icon={
          <Box position="relative">
            <Bell size={20} />
            {noLeidas > 0 && (
              <Badge
                position="absolute"
                top="-8px"
                right="-8px"
                borderRadius="full"
                bg="red.500"
                color="white"
                fontSize="0.65rem"
                px={1.5}
                minW="18px"
                textAlign="center"
              >
                {noLeidas > 9 ? '9+' : noLeidas}
              </Badge>
            )}
          </Box>
        }
        backgroundColor="transparent"
        color="white"
        _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        _active={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        borderRadius="xl"
      />
      <MenuList
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="0 16px 48px rgba(102,0,51,0.12)"
        borderRadius="xl"
        minW="320px"
        maxW="380px"
        py={1}
      >
        <Flex justify="space-between" align="center" px={4} py={2}>
          <Text fontWeight="bold" fontSize="sm" color="gray.800">
            Notificaciones
          </Text>
          {noLeidas > 0 && (
            <Button size="xs" variant="ghost" colorScheme="orange" onClick={handleMarcarTodas}>
              Marcar todas leídas
            </Button>
          )}
        </Flex>
        <MenuDivider />
        <VStack spacing={0} align="stretch" maxH="360px" overflowY="auto">
          {notificaciones.length === 0 ? (
            <Text px={4} py={4} fontSize="sm" color="gray.500" textAlign="center">
              No tenés notificaciones
            </Text>
          ) : (
            notificaciones.map((notif) => (
              <MenuItem
                key={notif.id}
                onClick={() => handleClickNotificacion(notif)}
                bg={notif.leido ? 'white' : 'orange.50'}
                _hover={{ bg: 'orange.100' }}
                whiteSpace="normal"
                py={3}
                px={4}
              >
                <Box>
                  <Text fontSize="sm" color="gray.800" fontWeight={notif.leido ? 'normal' : 'semibold'}>
                    {notif.mensaje}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {formatFecha(notif.created_at)}
                  </Text>
                </Box>
              </MenuItem>
            ))
          )}
        </VStack>
      </MenuList>
    </Menu>
  );
};

export default NotificationBell;
