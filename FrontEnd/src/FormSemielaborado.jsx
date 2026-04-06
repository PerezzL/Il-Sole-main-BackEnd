import React from 'react';
import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Semielaborado from './components/Semielaborado';

const FormSemielaborado = () => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />

        <Semielaborado />

      <Footer />
    </Box>
  )
}

export default FormSemielaborado
