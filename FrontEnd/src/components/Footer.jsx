import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import logo  from '../images/logo.png';

const Footer = () => {
  return (
    <Box w="full">
        <Flex 
          bg="#660033" 
          p={{ base: 3, md: 4 }} 
          justifyContent="space-between" 
          alignItems="center"
          direction={{ base: 'column', sm: 'row' }}
          gap={{ base: 2, sm: 0 }}
          textAlign={{ base: 'center', sm: 'left' }}
          minH={{ base: 'auto', md: '80px' }}
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
                © 2024 Il Sole
            </Text>
        </Flex>
    </Box>
  )
}

export default Footer