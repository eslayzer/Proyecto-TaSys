import { useEffect, useState } from 'react';
import axios from 'axios';

const TareaList = ({ actualizar }) => {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [filtro, setFiltro] = useState({
    estado: '',
    prioridad: '',
    categoria: ''
  });

  const cargarTareas = () => {
    setCargando(true);

    // Si no hay filtros, carga todas
    if (!filtro.estado && !filtro.prioridad && !filtro.categoria) {
      axios.get('http://localhost:3000/api/tareas')
        .then(res => {
          setTareas(res.data);
          setCargando(false);
        })
        .catch(err => {
          console.error('Error al obtener tareas:', err);
          setCargando(false);
        });
      return;
    }

    // Si hay filtros
    const params = new URLSearchParams();

    if (filtro.estado) params.append('estado', filtro.estado);
    if (filtro.prioridad) params.append('prioridad', filtro.prioridad);
    if (filtro.categoria) params.append('categoria', filtro.categoria);

    axios.get(`http://localhost:3000/api/tareas/filtrar?${params.toString()}`)
      .then(res => {
        setTareas(res.data);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al filtrar tareas:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarTareas();
  }, [actualizar]);

  const handleFiltroChange = (e) => {
    setFiltro({
      ...filtro,
      [e.target.name]: e.target.value
    });
  };

  const limpiarFiltros = () => {
    setFiltro({ estado: '', prioridad: '', categoria: '' });
    cargarTareas();
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

  return (
    <div>
      <h2>Listado de Tareas</h2>

      {/* Filtros */}
      <div style={{ marginBottom: '15px' }}>
        <label>Estado: </label>
        <select name="estado" value={filtro.estado} onChange={handleFiltroChange}>
          <option value="">-- Todos --</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Completada">Completada</option>
          <option value="Vencida">Vencida</option>
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

      {/* Lista */}
      {cargando ? (
        <p>Cargando tareas...</p>
      ) : tareas.length === 0 ? (
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
                Fecha límite: {tarea.fecha_limite}<br />
                Categoría: {tarea.categoria}<br />
                Descripción: {tarea.descripcion}<br />

                {tarea.estado !== 'Completada' && (
                  <button onClick={() => marcarComoCompletada(tarea.id)} style={{ marginTop: '8px' }}>
                    Marcar como Completada
                  </button>
                )}

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
