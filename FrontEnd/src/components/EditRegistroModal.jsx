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
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react';
import {
  updateRegistroBySector,
  getMateriasPrimas,
  getProducts,
  getMateriasPrimasByProducto,
  getSemielaboradosNombres,
} from '../config/api';

const CAMPOS_NO_EDITABLES = ['id', 'codigo', 'created_at', 'updated_at', 'usuario_id', 'responsable'];

// Igual que en los formularios de alta: qué campos son un dropdown y de dónde
// sacan las opciones, por sector.
const SELECT_CONFIG = {
  recepcion: {
    materiaprima: { type: 'materiaPrima' },
    control1: { type: 'static', options: ['OK', 'Mal estado'] },
    control2: { type: 'static', options: ['OK', 'Mal estado'] },
    control3: { type: 'static', options: ['OK', 'Mal estado'] },
  },
  semielaborado: {
    semielaborado: { type: 'semielaboradoNombre' },
    ingrediente: { type: 'materiaPrima' },
  },
  production: {
    producto: { type: 'producto' },
    materiaprima: { type: 'materiaPrimaPorProducto' },
  },
  'control-pesado': {
    producto: { type: 'producto' },
    materiaprima: { type: 'materiaPrimaPorProducto' },
  },
  envasado: {
    producto: { type: 'producto' },
  },
  expendio: {
    producto: { type: 'producto' },
    limptransporte: { type: 'boolean' },
  },
};

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
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [semielaboradosNombres, setSemielaboradosNombres] = useState([]);
  const [materiasPrimasProducto, setMateriasPrimasProducto] = useState([]);
  const [loadingOpciones, setLoadingOpciones] = useState(false);
  const toast = useToast();

  const campos = columns.filter((c) => !CAMPOS_NO_EDITABLES.includes(c.key));
  const selectConfig = SELECT_CONFIG[sector] || {};

  // Cargar las opciones de los dropdowns de este sector
  useEffect(() => {
    if (!isOpen) return;
    const tipos = new Set(Object.values(selectConfig).map((c) => c.type));

    const fetchOpciones = async () => {
      setLoadingOpciones(true);
      try {
        const tareas = [];
        if (tipos.has('materiaPrima')) {
          tareas.push(getMateriasPrimas().then(setMateriasPrimas));
        }
        if (tipos.has('producto') || tipos.has('materiaPrimaPorProducto')) {
          tareas.push(getProducts().then(setProductos));
        }
        if (tipos.has('semielaboradoNombre')) {
          tareas.push(getSemielaboradosNombres().then(setSemielaboradosNombres));
        }
        await Promise.all(tareas);
      } catch (error) {
        toast({
          title: 'Error al cargar opciones',
          description: error.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoadingOpciones(false);
      }
    };

    fetchOpciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sector]);

  useEffect(() => {
    if (!registro) return;
    const initial = {};
    campos.forEach((c) => {
      const raw = registro[c.key];
      const tipo = selectConfig[c.key]?.type;
      if (tipo === 'boolean') {
        initial[c.key] = raw === true ? 'true' : raw === false ? 'false' : '';
      } else if (inputType(c.key) === 'date') {
        initial[c.key] = toDateInputValue(raw);
      } else {
        initial[c.key] = raw ?? '';
      }
    });
    setFormData(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registro]);

  // Materias primas del producto seleccionado, para los sectores con dropdown dependiente
  useEffect(() => {
    const tieneDependiente = Object.values(selectConfig).some((c) => c.type === 'materiaPrimaPorProducto');
    if (!tieneDependiente || !formData.producto) {
      setMateriasPrimasProducto([]);
      return;
    }
    const producto = productos.find((p) => p.name === formData.producto);
    if (!producto) {
      setMateriasPrimasProducto([]);
      return;
    }
    getMateriasPrimasByProducto(producto.id)
      .then(setMateriasPrimasProducto)
      .catch(() => setMateriasPrimasProducto([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.producto, productos]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // El backend espera los nombres de parámetro en camelCase (c.field);
      // formData está keyed por el nombre de columna de la DB (c.key).
      const payload = {};
      campos.forEach((c) => {
        payload[c.field || c.key] = formData[c.key];
      });
      await updateRegistroBySector(sector, registro.id, payload);
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

  const renderCampo = (c) => {
    const config = selectConfig[c.key];

    if (config?.type === 'static') {
      return (
        <Select
          value={formData[c.key] ?? ''}
          onChange={(e) => handleChange(c.key, e.target.value)}
          placeholder="Seleccionar"
          bg="white"
        >
          {config.options.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </Select>
      );
    }

    if (config?.type === 'boolean') {
      return (
        <Select
          value={formData[c.key] ?? ''}
          onChange={(e) => handleChange(c.key, e.target.value)}
          placeholder="Seleccionar"
          bg="white"
        >
          <option value="true">Sí</option>
          <option value="false">No</option>
        </Select>
      );
    }

    if (config?.type === 'materiaPrima') {
      return (
        <Select
          value={formData[c.key] ?? ''}
          onChange={(e) => handleChange(c.key, e.target.value)}
          placeholder="Seleccionar"
          bg="white"
          isDisabled={loadingOpciones}
        >
          {materiasPrimas.map((m) => (
            <option key={m.id} value={m.nombre}>
              {m.nombre}
            </option>
          ))}
        </Select>
      );
    }

    if (config?.type === 'semielaboradoNombre') {
      return (
        <Select
          value={formData[c.key] ?? ''}
          onChange={(e) => handleChange(c.key, e.target.value)}
          placeholder="Seleccionar"
          bg="white"
          isDisabled={loadingOpciones}
        >
          {semielaboradosNombres.map((nombre) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </Select>
      );
    }

    if (config?.type === 'producto') {
      const nombresUnicos = [...new Map(productos.map((p) => [p.name, p])).values()];
      return (
        <Select
          value={formData[c.key] ?? ''}
          onChange={(e) => handleChange(c.key, e.target.value)}
          placeholder="Seleccionar"
          bg="white"
          isDisabled={loadingOpciones}
        >
          {nombresUnicos.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </Select>
      );
    }

    if (config?.type === 'materiaPrimaPorProducto') {
      return (
        <Select
          value={formData[c.key] ?? ''}
          onChange={(e) => handleChange(c.key, e.target.value)}
          placeholder={formData.producto ? 'Seleccionar materia prima' : 'Primero elegí un producto'}
          bg="white"
          isDisabled={!formData.producto}
        >
          {materiasPrimasProducto.map((m) => (
            <option key={m.materia_prima_id} value={m.materia_prima_nombre}>
              {m.materia_prima_nombre}
            </option>
          ))}
        </Select>
      );
    }

    return (
      <Input
        type={inputType(c.key)}
        value={formData[c.key] ?? ''}
        onChange={(e) => handleChange(c.key, e.target.value)}
        bg="white"
      />
    );
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
                {renderCampo(c)}
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
