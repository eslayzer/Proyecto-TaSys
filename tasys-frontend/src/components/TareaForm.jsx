import { useState, useEffect } from 'react'; // Importa useEffect
import axios from 'axios';

// Importante: Cambia la prop de onTareaCreada a onTareaGuardada
// y añade las nuevas props tareaAEditar y onCancelarEdicion
const TareaForm = ({ onTareaGuardada, tareaAEditar, onCancelarEdicion }) => {
  const [tarea, setTarea] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    categoria: '',
    fecha_limite: '', // Mantén el nombre consistente con tu backend
    estado: 'Pendiente' // Añade el estado para manejarlo en edición
  });

  // useEffect para pre-rellenar el formulario cuando tareaAEditar cambie
  useEffect(() => {
    if (tareaAEditar) {
      // Si hay una tarea para editar, actualiza el estado del formulario
      setTarea({
        titulo: tareaAEditar.titulo || '',
        descripcion: tareaAEditar.descripcion || '',
        prioridad: tareaAEditar.prioridad || 'Media',
        categoria: tareaAEditar.categoria || '',
        // Formatear la fecha para el input type="date" (YYYY-MM-DD)
        fecha_limite: tareaAEditar.fecha_limite ? new Date(tareaAEditar.fecha_limite).toISOString().split('T')[0] : '',
        estado: tareaAEditar.estado || 'Pendiente' // Carga el estado actual de la tarea
      });
    } else {
      // Si no hay tarea para editar (modo creación), resetea el formulario
      setTarea({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        categoria: '',
        fecha_limite: '',
        estado: 'Pendiente' // Estado inicial para nuevas tareas
      });
    }
  }, [tareaAEditar]); // La dependencia es tareaAEditar, para que se ejecute cuando cambie

  const handleChange = (e) => {
    setTarea({
      ...tarea,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!tarea.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }
    if (!tarea.fecha_limite) { // Asegúrate de que la fecha límite no esté vacía
        alert('La fecha límite es obligatoria');
        return;
    }

    try {
      if (tareaAEditar) {
        // Modo Edición: Enviar PUT request a la ruta de actualización
        await axios.put(`http://localhost:3000/api/tareas/${tareaAEditar.id}`, tarea);
        alert('Tarea actualizada con éxito');
      } else {
        // Modo Creación: Enviar POST request a la ruta de creación
        // En este caso, el backend asigna 'Pendiente' por defecto,
        // pero podemos enviarlo explícitamente si queremos.
        await axios.post('http://localhost:3000/api/tareas', tarea);
        alert('Tarea creada con éxito');
      }

      // Llama a la función en App.jsx para recargar la lista y resetear el formulario en App.jsx
      if (onTareaGuardada) onTareaGuardada();

    } catch (error) {
      console.error(`Error al ${tareaAEditar ? 'actualizar' : 'crear'} tarea:`, error);
      // Muestra un mensaje más específico si hay una respuesta de error del servidor
      alert(`Error al ${tareaAEditar ? 'actualizar' : 'crear'} la tarea: ${error.response?.data?.mensaje || error.message || error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', marginBottom: '2rem' }}>
      <h2>{tareaAEditar ? 'Editar Tarea' : 'Crear Nueva Tarea'}</h2> {/* Título dinámico */}

      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <label style={{ width: '150px' }}>Título:</label>
        <input
          type="text"
          name="titulo"
          value={tarea.titulo}
          onChange={handleChange}
          required
          style={{ flex: 1 }}
        />
      </div>

      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <label style={{ width: '150px' }}>Descripción:</label>
        <textarea
          name="descripcion"
          value={tarea.descripcion}
          onChange={handleChange}
          style={{ flex: 1 }}
        />
      </div>

      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <label style={{ width: '150px' }}>Prioridad:</label>
        <select name="prioridad" value={tarea.prioridad} onChange={handleChange}>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <label style={{ width: '150px' }}>Categoría:</label>
        <input
          type="text"
          name="categoria"
          value={tarea.categoria}
          onChange={handleChange}
          style={{ flex: 1 }}
        />
      </div>

      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <label style={{ width: '150px' }}>Fecha de vencimiento:</label>
        <input
          type="date"
          name="fecha_limite" // <-- Asegúrate que este name sea 'fecha_limite'
          value={tarea.fecha_limite}
          onChange={handleChange}
          required // Campo requerido
        />
      </div>

      {/* Selector de Estado: solo visible en modo edición */}
      {tareaAEditar && (
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <label style={{ width: '150px' }}>Estado:</label>
          <select name="estado" value={tarea.estado} onChange={handleChange}>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completada">Completada</option>
            <option value="Vencida">Vencida</option>
          </select>
        </div>
      )}

      {/* Botones de acción */}
      <button type="submit" style={{ marginRight: '10px' }}>
        {tareaAEditar ? 'Actualizar Tarea' : 'Crear Tarea'} {/* Texto dinámico del botón */}
      </button>

      {/* Botón de Cancelar Edición: solo visible en modo edición */}
      {tareaAEditar && (
        <button type="button" onClick={onCancelarEdicion}>
          Cancelar Edición
        </button>
      )}
    </form>
  );
};

export default TareaForm;