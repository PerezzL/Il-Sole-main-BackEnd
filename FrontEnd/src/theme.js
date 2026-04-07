import { extendTheme } from '@chakra-ui/react';

/** Tema con ajustes responsive y accesibilidad táctil */
export const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        overflowX: 'hidden',
        WebkitTextSizeAdjust: '100%',
      },
      '#root': {
        minHeight: '100%',
        overflowX: 'hidden',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        _focusVisible: {
          boxShadow: 'outline',
        },
      },
    },
  },
});
