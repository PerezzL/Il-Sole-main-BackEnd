import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Heading, Text, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Package,
  Layers,
  Factory,
  Scale,
  BoxIcon,
  Store,
  ShieldCheck,
} from 'lucide-react';
import backgroundImg from './images/background.png';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { useAuth } from './context/AuthContext';

const MotionBox = motion(Box);

const MODULES = [
  {
    path: '/recepcion',
    title: 'Recepción de mercadería',
    description: 'Control de ingreso y verificación de productos.',
    Icon: Package,
  },
  {
    path: '/semielaborados',
    title: 'Semielaborados',
    description: 'Gestión de productos en proceso.',
    Icon: Layers,
  },
  {
    path: '/produccion',
    title: 'Producción',
    description: 'Seguimiento de líneas productivas.',
    Icon: Factory,
  },
  {
    path: '/producto-pesados',
    title: 'Productos pesados',
    description: 'Registro y control de pesadas.',
    Icon: Scale,
  },
  {
    path: '/productos-envasados',
    title: 'Productos envasados',
    description: 'Trazabilidad de envasado y lotes.',
    Icon: BoxIcon,
  },
  {
    path: '/expendio',
    title: 'Control expendio',
    description: 'Salidas y distribución.',
    Icon: Store,
  },
];

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const items =
    user?.role === 'admin'
      ? [
          ...MODULES,
          {
            path: '/admin',
            title: 'Panel de administrador',
            description: 'Usuarios, productos y configuración.',
            Icon: ShieldCheck,
          },
        ]
      : MODULES;

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="brand.cream">
      <Header />

      {/* Hero */}
      <Box
        position="relative"
        overflow="hidden"
        bg="brand.cream"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bgImage: `linear-gradient(135deg, rgba(250,246,240,0.97) 0%, rgba(250,246,240,0.88) 45%, rgba(240,232,220,0.92) 100%), url(${backgroundImg})`,
          bgSize: 'cover',
          bgPosition: 'center',
          opacity: 1,
        }}
      >
        <Box
          position="absolute"
          right={{ base: '-60px', md: '8%' }}
          top={{ base: '12%', md: '18%' }}
          w={{ base: '200px', md: '280px' }}
          h={{ base: '200px', md: '280px' }}
          borderRadius="full"
          border="1px dashed"
          borderColor="brand.plum"
          opacity={0.14}
          pointerEvents="none"
          display={{ base: 'none', sm: 'block' }}
        />
        <Box
          position="absolute"
          left={{ base: '-40px', md: '5%' }}
          bottom="10%"
          w="120px"
          h="220px"
          borderLeft="2px solid"
          borderColor="brand.plum"
          opacity={0.1}
          borderRadius="sm"
          pointerEvents="none"
          display={{ base: 'none', lg: 'block' }}
        />

        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          position="relative"
          zIndex={1}
          px={{ base: 4, md: 8 }}
          py={{ base: 10, md: 16 }}
          maxW="container.lg"
          mx="auto"
        >
          <Heading
            as="h1"
            fontFamily="heading"
            fontWeight="700"
            fontSize={{ base: '2.75rem', md: '4rem' }}
            letterSpacing="-0.02em"
            color="brand.plum"
            lineHeight="1.05"
            mb={3}
          >
            IL Sole
          </Heading>
          <Text
            fontSize={{ base: 'md', md: 'xl' }}
            fontWeight="500"
            color="brand.plumMuted"
            maxW="md"
          >
            Registro de datos
          </Text>
        </Flex>
      </Box>

      {/* Módulos */}
      <Box
        flex="1"
        w="100%"
        maxW="container.xl"
        mx="auto"
        px={{ base: 4, sm: 5, md: 8 }}
        pb={{ base: 10, md: 14 }}
      >
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            xl: 'repeat(3, 1fr)',
          }}
          gap={{ base: 4, md: 5 }}
        >
          {items.map(({ path, title, description, Icon: LucideIcon }, i) => (
            <MotionBox
              key={path}
              role="group"
              as="button"
              type="button"
              onClick={() => navigate(path)}
              textAlign="left"
              borderRadius="2xl"
              bg="brand.orange"
              color="brand.plum"
              p={{ base: 5, md: 6 }}
              minH={{ base: '132px', md: '148px' }}
              position="relative"
              overflow="hidden"
              cursor="pointer"
              border="1px solid"
              borderColor="blackAlpha.100"
              boxShadow="0 4px 24px -6px rgba(102, 0, 51, 0.18)"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{
                y: -6,
                boxShadow: '0 20px 40px -12px rgba(102, 0, 51, 0.28)',
              }}
              whileTap={{ scale: 0.99 }}
              _hover={{
                bg: 'linear-gradient(145deg, #E3992A 0%, #DE8F18 50%, #D68514 100%)',
              }}
              _focusVisible={{
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(102, 0, 51, 0.45)',
              }}
            >
              <Flex justify="space-between" align="flex-start" gap={3}>
                <Box
                  flex="1"
                  minW={0}
                  pr={{ base: 8, md: 10 }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    w="44px"
                    h="44px"
                    borderRadius="xl"
                    bg="rgba(102, 0, 51, 0.12)"
                    color="brand.plum"
                    mb={3}
                    _groupHover={{ bg: 'rgba(102, 0, 51, 0.18)' }}
                    transition="background 0.2s"
                  >
                    <LucideIcon size={22} strokeWidth={1.75} aria-hidden />
                  </Flex>
                  <Text
                    fontWeight="700"
                    fontSize={{ base: 'md', md: 'lg' }}
                    letterSpacing="-0.01em"
                    mb={1.5}
                    lineHeight="short"
                  >
                    {title}
                  </Text>
                  <Text
                    fontSize="sm"
                    opacity={0.92}
                    lineHeight="tall"
                    fontWeight="500"
                  >
                    {description}
                  </Text>
                </Box>
                <Box
                  position="absolute"
                  top={4}
                  right={4}
                  color="brand.plum"
                  opacity={0.55}
                  _groupHover={{ opacity: 0.95, transform: 'translateX(2px)' }}
                  transition="all 0.2s"
                >
                  <ChevronRightIcon boxSize={6} />
                </Box>
              </Flex>
            </MotionBox>
          ))}
        </Grid>
      </Box>

      <Footer />
    </Box>
  );
};

export default Homepage;
