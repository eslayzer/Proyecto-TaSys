// tasys-frontend/src/components/subtareaItem.jsx
import React, { useState } from 'react';
import axios from 'axios';

const SubtareaItem = ({ subtarea, onSubtareaActualizada, onSubtareaEliminada }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nuevaDescripcion, setNuevaDescripcion] = useState(subtarea.descripcion);
  const [error, setError] = useState('');

  const handleToggleCompletada = async () => {
    setError('');
    // Determina el nuevo estado: si está completada, pasa a pendiente; si está pendiente, pasa a completada.
    const nuevoEstado = subtarea.estado === 'completada' ? 'pendiente' : 'completada';
    try {
      // Endpoint para marcar como completada/pendiente: PUT /api/subtareas/:id/completar
      await axios.put(`http://localhost:3000/api/subtareas/${subtarea.id}/completar`, {
        estado: nuevoEstado
      });
      onSubtareaActualizada(); // Notificar al componente padre (SubtareaList) para que recargue la lista de subtareas
    } catch (err) {
      console.error('Error al cambiar estado de subtarea:', err);
      setError('Error al cambiar el estado: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const handleGuardarEdicion = async () => {
    setError('');
    if (!nuevaDescripcion.trim()) {
      setError('La descripción no puede estar vacía.');
      return;
    }
    try {
      // Endpoint para actualizar descripción: PUT /api/subtareas/:id
      await axios.put(`http://localhost:3000/api/subtareas/${subtarea.id}`, {
        descripcion: nuevaDescripcion
      });
      setIsEditing(false); // Salir del modo edición
      onSubtareaActualizada(); // Notificar al componente padre para que recargue la lista y muestre la descripción actualizada
    } catch (err) {
      console.error('Error al actualizar subtarea:', err);
      setError('Error al actualizar: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const handleEliminar = async () => {
    setError('');
    if (window.confirm('¿Estás seguro de que quieres eliminar esta subtarea?')) {
      try {
        // Endpoint para eliminar: DELETE /api/subtareas/:id
        await axios.delete(`http://localhost:3000/api/subtareas/${subtarea.id}`);
        onSubtareaEliminada(); // Notificar al componente padre para que recargue la lista
      } catch (err) {
        console.error('Error al eliminar subtarea:', err);
        setError('Error al eliminar: ' + (err.response?.data?.mensaje || err.message));
      }
    }
  };

  return (
    <li style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #444', // Borde inferior para separar subtareas
      color: subtarea.estado === 'completada' ? '#888' : 'white', // Texto más claro si está completada
      textDecoration: subtarea.estado === 'completada' ? 'line-through' : 'none' // Tachado si está completada
    }}>
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={subtarea.estado === 'completada'}
          onChange={handleToggleCompletada}
          style={{ marginRight: '10px' }}
        />
        {isEditing ? (
          <input
            type="text"
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
            onBlur={handleGuardarEdicion} // Guarda al perder el foco del input
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGuardarEdicion(); // También guarda al presionar Enter
              }
            }}
            style={{
              flexGrow: 1, // Para que ocupe el espacio disponible
              padding: '5px',
              border: '1px solid #666',
              borderRadius: '3px',
              backgroundColor: '#444',
              color: 'white'
            }}
            autoFocus // Enfoca el input automáticamente al entrar en modo edición
          />
        ) : (
          <span style={{ flexGrow: 1 }} onDoubleClick={() => setIsEditing(true)}>
            {subtarea.descripcion}
          </span>
        )}
      </div>
      <div style={{ marginLeft: '10px' }}>
        {isEditing ? (
          <button
            onClick={handleGuardarEdicion}
            style={{
              padding: '5px 10px',
              backgroundColor: '#007bff', // Azul para guardar
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '5px'
            }}
          >
            Guardar
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ffc107', // Amarillo para editar
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '5px'
            }}
          >
            Editar
          </button>
        )}
        <button
          onClick={handleEliminar}
          style={{
            padding: '5px 10px',
            backgroundColor: '#dc3545', // Rojo para eliminar
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Eliminar
        </button>
      </div>
      {error && <p style={{ color: '#dc3545', marginTop: '5px' }}>{error}</p>}
    </li>
  );
};

export default SubtareaItem;