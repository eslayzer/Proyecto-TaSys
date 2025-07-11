// tasys-frontend/src/components/SubtareaForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const SubtareaForm = ({ tareaId, onSubtareaAgregada }) => {
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!descripcion.trim()) {
      setError('La descripción de la subtarea no puede estar vacía.');
      return;
    }

    try {
      // <<-- ¡CAMBIO CRÍTICO AQUÍ! -->>
      // URL ANTERIOR: `http://localhost:3000/api/tareas/${tareaId}/subtareas`
      // URL CORRECTA: `http://localhost:3000/api/subtareas/tareas/${tareaId}/subtareas`
      await axios.post(`http://localhost:3000/api/subtareas/tareas/${tareaId}/subtareas`, { // <<-- ¡MODIFICADO!
        descripcion
      });
      setDescripcion(''); // Limpiar el formulario
      onSubtareaAgregada(); // Notificar al componente padre que se agregó una subtarea
    } catch (err) {
      console.error('Error al agregar subtarea:', err);
      setError('Error al agregar la subtarea: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  return (
    <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#333' }}>
      <h4 style={{ color: 'white', marginBottom: '10px' }}>Agregar Subtarea</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción de la subtarea"
          style={{
            width: 'calc(100% - 80px)',
            padding: '8px',
            marginRight: '10px',
            border: '1px solid #666',
            borderRadius: '4px',
            backgroundColor: '#444',
            color: 'white'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Añadir
        </button>
      </form>
      {error && <p style={{ color: '#dc3545', marginTop: '5px' }}>{error}</p>}
    </div>
  );
};

export default SubtareaForm;