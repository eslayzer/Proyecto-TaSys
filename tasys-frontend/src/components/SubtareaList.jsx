// tasys-frontend/src/components/SubtareaList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SubtareaItem from './subtareaItem';
import SubtareaForm from './SubtareaForm';

const SubtareaList = ({ tareaId }) => {
  const [subtareas, setSubtareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubtareas = async () => {
    setLoading(true);
    setError('');
    try {
      // <<-- ¡ESTA ES LA LÍNEA QUE DEBES CAMBIAR! -->>
      // URL ACTUAL: `http://localhost:3000/api/tareas/${tareaId}/subtareas`
      // URL CORRECTA: `http://localhost:3000/api/subtareas/tareas/${tareaId}/subtareas`
      const res = await axios.get(`http://localhost:3000/api/subtareas/tareas/${tareaId}/subtareas`); // <<-- CAMBIO CLAVE AQUÍ

      setSubtareas(res.data);
    } catch (err) {
      console.error('Error al cargar subtareas:', err);
      setError('Error al cargar las subtareas: ' + (err.response?.data?.mensaje || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Asegúrate de que solo se intente cargar subtareas si hay un tareaId válido
    if (tareaId) {
      fetchSubtareas();
    }
  }, [tareaId]); // Recargar subtareas si cambia la tareaId

  const handleSubtareaChange = () => {
    // Esta función se llama cuando una subtarea se agrega, actualiza o elimina
    fetchSubtareas(); // Recargar la lista de subtareas
  };

  if (loading) {
    return <div style={{ color: '#888', textAlign: 'center', marginTop: '10px' }}>Cargando subtareas...</div>;
  }

  if (error) {
    return <div style={{ color: '#dc3545', textAlign: 'center', marginTop: '10px' }}>{error}</div>;
  }

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#2a2a2a' }}>
      <h3 style={{ color: 'white', marginBottom: '15px' }}>Subtareas ({subtareas.length})</h3>
      <SubtareaForm tareaId={tareaId} onSubtareaAgregada={handleSubtareaChange} />
      {subtareas.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>No hay subtareas para esta tarea.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {subtareas.map(subtarea => (
            <SubtareaItem
              key={subtarea.id}
              subtarea={subtarea}
              onSubtareaActualizada={handleSubtareaChange}
              onSubtareaEliminada={handleSubtareaChange}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default SubtareaList;