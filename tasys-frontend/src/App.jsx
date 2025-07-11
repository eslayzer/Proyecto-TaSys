import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import TareaList from './components/TareaList';
import TareaForm from './components/TareaForm';
import EstadisticasTareas from './components/EstadisticasTareas';

function App() {
  const [actualizarLista, setActualizarLista] = useState(0);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  const cargarEstadisticas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/tareas/estadisticas');
      setEstadisticas(res.data);
    } catch (error) {
      console.error('Error al cargar las estadísticas:', error);
      alert('Error al cargar las estadísticas: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, [actualizarLista]);

  const handleTareaGuardada = () => {
    setActualizarLista(prev => prev + 1);
    setTareaSeleccionada(null);
  };

  const handleEditarTarea = (tarea) => {
    setTareaSeleccionada(tarea);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => {
    setTareaSeleccionada(null);
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      {/* MODIFICADO: Eliminado backgroundColor y borderRadius del header */}
      <header style={{ textAlign: 'center', marginBottom: '40px', color: 'white', padding: '20px' }}>
        <h1 style={{ margin: '0' }}>Sistema de Gestión de Tareas (TASys)</h1>
      </header>

      {/* Renderiza el componente de estadísticas */}
      <EstadisticasTareas estadisticas={estadisticas} />

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <TareaForm
        onTareaGuardada={handleTareaGuardada}
        tareaAEditar={tareaSeleccionada}
        onCancelarEdicion={handleCancelarEdicion}
      />

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <TareaList
        actualizar={actualizarLista}
        onEditarTarea={handleEditarTarea}
      />

      <footer style={{ textAlign: 'center', marginTop: '40px', padding: '20px', borderTop: '1px solid #eee', color: '#777' }}>
        <p>&copy; 2024 TASys. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;