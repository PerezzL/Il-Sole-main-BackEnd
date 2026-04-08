import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import logo  from '../images/logo.png';

const Footer = () => {
  return (
    <Box w="full">
        <Flex 
          bg="brand.plum" 
          p={{ base: 4, md: 5 }} 
          justifyContent="space-between" 
          alignItems="center"
          direction={{ base: 'column', sm: 'row' }}
          gap={{ base: 2, sm: 0 }}
          textAlign={{ base: 'center', sm: 'left' }}
          minH={{ base: 'auto', md: '80px' }}
          borderTop="1px solid"
          borderColor="whiteAlpha.200"
          boxShadow="0 -8px 32px rgba(0,0,0,0.08)"
        >
            {/* Logo a la izquierda */}
            <Flex alignItems="center" gap={3}>
                <Box 
                    as="img" 
                    src={logo} 
                    alt="Footer Logo" 
                    boxSize={{ base: '35px', md: '45px' }}
                    objectFit="contain"
                    transition="all 0.3s ease"
                    _hover={{ transform: 'scale(1.05)' }}
                />
                <Text 
                    color="white" 
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="medium"
                    display={{ base: 'none', sm: 'block' }}
                >
                    Il Sole
                </Text>
            </Flex>

            {/* Información adicional a la derecha */}
            <Text 
                color="white" 
                fontSize={{ base: 'xs', md: 'sm' }}
                opacity="0.85"
                textAlign={{ base: 'center', sm: 'right' }}
            >
                © {new Date().getFullYear()} Il Sole
            </Text>
        </Flex>
    </Box>
  )
}

export default Footer