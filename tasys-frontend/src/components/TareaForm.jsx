import { useState } from 'react';
import axios from 'axios';

const TareaForm = ({ onTareaCreada }) => {
  const [tarea, setTarea] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    categoria: '',
    fecha_limite: ''
  });

  const handleChange = (e) => {
    setTarea({
      ...tarea,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tarea.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/tareas', tarea);
      alert('Tarea creada con éxito');
      setTarea({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        categoria: '',
        fecha_limite: ''
      });

      if (onTareaCreada) onTareaCreada(); // Para recargar la lista si se usa

    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('Error al crear la tarea');
    }
  };

    return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', marginBottom: '2rem' }}>
        <h2>Crear Nueva Tarea</h2>

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
            name="fecha_limite"
            value={tarea.fecha_limite}
            onChange={handleChange}
        />
        </div>

        <button type="submit">Crear Tarea</button>
    </form>
    );
};

export default TareaForm;
