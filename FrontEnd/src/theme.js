import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    plum: '#660033',
    plumDark: '#4A0024',
    plumMuted: '#8B3D5C',
    orange: '#DE8F18',
    orangeHover: '#BF6F15',
    orangeSoft: '#E8A84A',
    cream: '#FAF6F0',
    creamDeep: '#F0E8DC',
    sand: '#C9A66B',
    whiteAlpha: 'rgba(255,255,255,0.12)',
  },
};

/** Tema Il Sole: paleta original + tipografía y tokens para UI moderna */
export const theme = extendTheme({
  colors,
  fonts: {
    heading: '"Fraunces", Georgia, "Times New Roman", serif',
    body: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  },
  styles: {
    global: {
      /* clip evita scroll horizontal sin romper position:sticky (hidden sí lo rompe) */
      'html, body': {
        overflowX: 'clip',
        WebkitTextSizeAdjust: '100%',
        bg: 'brand.cream',
        color: 'brand.plum',
      },
      '#root': {
        minHeight: '100%',
        overflowX: 'clip',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        _focusVisible: {
          boxShadow: '0 0 0 3px rgba(102, 0, 51, 0.35)',
        },
      },
    },
  },
});
