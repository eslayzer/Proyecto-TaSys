// tasys-frontend/src/components/TareaList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { downloadTasksAsCsv, downloadPdfFromServer } from '../utils/exportUtils';

// Añade onEditarTarea como prop
const TareaList = ({ actualizar, onEditarTarea }) => { // <-- CAMBIO IMPORTANTE AQUÍ: Añadido onEditarTarea
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtro, setFiltro] = useState({
    estado: '',
    prioridad: '',
    categoria: ''
  });

  const cargarTareas = async () => {
    setCargando(true);
    setError(null);

    try {
      let url = 'http://localhost:3000/api/tareas';
      if (filtro.estado || filtro.prioridad || filtro.categoria) {
        const params = new URLSearchParams();
        if (filtro.estado) params.append('estado', filtro.estado);
        if (filtro.prioridad) params.append('prioridad', filtro.prioridad);
        if (filtro.categoria) params.append('categoria', filtro.categoria);
        url = `http://localhost:3000/api/tareas/filtrar?${params.toString()}`;
      }
      const res = await axios.get(url);
      setTareas(res.data);
    } catch (err) {
      console.error('Error al obtener/filtrar tareas:', err);
      setError(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, [actualizar, filtro]);

  const handleFiltroChange = (e) => {
    setFiltro({
      ...filtro,
      [e.target.name]: e.target.value
    });
  };

  const limpiarFiltros = () => {
    setFiltro({ estado: '', prioridad: '', categoria: '' });
  };

  const marcarComoCompletada = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/tareas/${id}/completar`);
      cargarTareas();
    } catch (error) {
      console.error('Error al completar tarea:', error);
      alert('No se pudo marcar como completada');
    }
  };

  const eliminarTarea = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/tareas/${id}`);
      cargarTareas();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('No se pudo eliminar la tarea');
    }
  };

  if (cargando) {
    return <p style={{ textAlign: 'center', marginTop: '20px' }}>Cargando tareas...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: '20px', color: 'red' }}>Error al cargar las tareas: {error.message}</p>;
  }

  return (
    <div>
      <h2>Listado de Tareas</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px', marginTop: '20px' }}>
        <button
          onClick={downloadTasksAsCsv}
          style={{ padding: '10px 20px', fontSize: '15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'background-color 0.3s ease' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          Descargar CSV
        </button>
        <button
          onClick={downloadPdfFromServer}
          style={{ padding: '10px 20px', fontSize: '15px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'background-color 0.3s ease' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#007bb5'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#008CBA'}
        >
          Descargar PDF
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Estado: </label>
        <select name="estado" value={filtro.estado} onChange={handleFiltroChange}>
          <option value="">-- Todos --</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Completada">Completada</option>
          <option value="Vencida">Vencida</option>
          <option value="En Proceso">En Proceso</option>
        </select>

        <label style={{ marginLeft: '10px' }}>Prioridad: </label>
        <select name="prioridad" value={filtro.prioridad} onChange={handleFiltroChange}>
          <option value="">-- Todas --</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>

        <label style={{ marginLeft: '10px' }}>Categoría: </label>
        <input
          name="categoria"
          type="text"
          value={filtro.categoria}
          onChange={handleFiltroChange}
          placeholder="Ej: Académico"
        />

        <button onClick={cargarTareas} style={{ marginLeft: '10px' }}>Filtrar</button>
        <button onClick={limpiarFiltros} style={{ marginLeft: '5px' }}>Mostrar todo</button>
      </div>

      {tareas.length === 0 ? (
        <p>No hay tareas registradas.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tareas.map(tarea => {
            let colorFondo = '#eee';
            switch (tarea.estado) {
              case 'Vencida':
                colorFondo = '#ffdddd';
                break;
              case 'Pendiente':
                colorFondo = '#fff8d0';
                break;
              case 'Completada':
                colorFondo = '#d0ffd8';
                break;
              case 'En Proceso':
                colorFondo = '#d0e8ff';
                break;
              default:
                colorFondo = '#f0f0f0';
            }

            return (
              <li key={tarea.id} style={{
                background: colorFondo,
                marginBottom: '10px',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                color: '#000'
              }}>
                <strong>{tarea.titulo}</strong><br />
                Estado: <strong>{tarea.estado}</strong><br />
                Prioridad: {tarea.prioridad}<br />
                Fecha límite: {tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleDateString('es-EC', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : 'N/A'}<br />
                Categoría: {tarea.categoria}<br />
                Descripción: {tarea.descripcion}<br />

                {tarea.estado !== 'Completada' && (
                  <button onClick={() => marcarComoCompletada(tarea.id)} style={{ marginTop: '8px' }}>
                    Marcar como Completada
                  </button>
                )}
                
                {/* !!! NUEVO BOTÓN DE EDITAR !!! */}
                {/* Llama a la función onEditarTarea pasada desde App.jsx, enviando la tarea completa */}
                <button
                  onClick={() => onEditarTarea(tarea)} // <-- CAMBIO IMPORTANTE AQUÍ: Se añade el botón de editar
                  style={{ marginLeft: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
                >
                  Editar
                </button>

                <button
                  onClick={() => eliminarTarea(tarea.id)}
                  style={{ marginLeft: '10px', backgroundColor: '#ff5555', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
                >
                  Eliminar
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TareaList;