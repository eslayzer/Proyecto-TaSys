import { useEffect, useState } from 'react';
import axios from 'axios';

const HistorialTarea = ({ tareaId }) => {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!tareaId) return;

    axios.get(`http://localhost:3000/api/tareas/${tareaId}/historial`)
      .then(res => {
        setHistorial(res.data);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al cargar historial:', err);
        setCargando(false);
      });
  }, [tareaId]);

  if (!tareaId) return <p>Selecciona una tarea para ver su historial.</p>;

  if (cargando) return <p>Cargando historial...</p>;

  if (historial.length === 0) return <p>Esta tarea no tiene historial.</p>;

  return (
    <div>
      <h3>Historial de cambios</h3>
      <ul>
        {historial.map((cambio, index) => (
          <li key={index}>
            <strong>{new Date(cambio.fecha).toLocaleString()}</strong>: {cambio.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistorialTarea;
