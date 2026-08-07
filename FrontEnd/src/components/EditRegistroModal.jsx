import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { updateRegistroBySector } from '../config/api';

const CAMPOS_NO_EDITABLES = ['id', 'codigo', 'created_at', 'updated_at', 'usuario_id', 'responsable'];

const inputType = (key) => {
  if (key.includes('fecha')) return 'date';
  if (['peso', 'cant', 'produccion', 'pesodescarte', 'cantenvases', 'cantdescarte', 'temp', 'temptransporte'].includes(key)) {
    return 'number';
  }
  return 'text';
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const EditRegistroModal = ({ isOpen, onClose, sector, columns, registro, onSaved }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const campos = columns.filter((c) => !CAMPOS_NO_EDITABLES.includes(c.key));

  useEffect(() => {
    if (!registro) return;
    const initial = {};
    campos.forEach((c) => {
      const raw = registro[c.key];
      initial[c.key] = inputType(c.key) === 'date' ? toDateInputValue(raw) : raw ?? '';
    });
    setFormData(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registro]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRegistroBySector(sector, registro.id, formData);
      toast({
        title: 'Registro actualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSaved?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error al guardar los cambios',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!registro) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar registro {registro.codigo || `#${registro.id}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3} align="stretch">
            {campos.map((c) => (
              <FormControl key={c.key}>
                <FormLabel fontSize="sm">{c.label}</FormLabel>
                <Input
                  type={inputType(c.key)}
                  value={formData[c.key] ?? ''}
                  onChange={(e) => handleChange(c.key, e.target.value)}
                  bg="white"
                />
              </FormControl>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="orange" onClick={handleSave} isLoading={saving}>
            Guardar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditRegistroModal;
