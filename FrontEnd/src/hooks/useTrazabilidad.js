import { useState } from 'react';

export const useTrazabilidad = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [registroActual, setRegistroActual] = useState(null);
  const [tipoTablaActual, setTipoTablaActual] = useState(null);

  const openTrazabilidad = (registroId, tipoTabla) => {
    setRegistroActual(registroId);
    setTipoTablaActual(tipoTabla);
    setModalOpen(true);
  };

  const closeTrazabilidad = () => {
    setModalOpen(false);
    setRegistroActual(null);
    setTipoTablaActual(null);
  };

  return {
    modalOpen,
    registroActual,
    tipoTablaActual,
    openTrazabilidad,
    closeTrazabilidad
  };
};
