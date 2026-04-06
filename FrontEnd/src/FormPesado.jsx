import React from 'react';
import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import ControlPesado from './components/ControlPesado';

const FormPesado = () => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />

        <ControlPesado />

      <Footer />
    </Box>
  )
}

export default FormPesado