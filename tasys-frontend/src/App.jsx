import './App.css'
import { useState } from 'react'
import TareaList from './components/TareaList'
import TareaForm from './components/TareaForm'

function App() {
  const [actualizarLista, setActualizarLista] = useState(0); // Usamos un contador para forzar actualización
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null); // NUEVO ESTADO: para la tarea que se va a editar

  // Esta función se llama cuando una tarea es CREADA o ACTUALIZADA
  const handleTareaGuardada = () => {
    setActualizarLista(prev => prev + 1); // Incrementa para forzar la recarga de la lista en TareaList
    setTareaSeleccionada(null); // Importante: Limpia la tarea seleccionada después de guardar (vuelve a modo "crear")
  };

  // Esta función se llama desde TareaList cuando el usuario hace clic en "Editar"
  const handleEditarTarea = (tarea) => {
    setTareaSeleccionada(tarea); // Guarda la tarea completa que se va a editar en el estado
    // Opcional: podrías añadir aquí un scroll a la parte superior de la página para enfocar el formulario
  };

  // Esta función se llama desde TareaForm cuando el usuario hace clic en "Cancelar Edición"
  const handleCancelarEdicion = () => {
    setTareaSeleccionada(null); // Vuelve el formulario al modo "crear"
  };

  return (
    <div className="App">
      <h1>Sistema de Tareas - TASys</h1>
      
      {/* Pasar el estado de la tarea seleccionada y las funciones de manejo al TareaForm */}
      <TareaForm
        onTareaGuardada={handleTareaGuardada} // Se mantiene la lógica de recarga
        tareaAEditar={tareaSeleccionada}     // Se le pasa la tarea que debe editar
        onCancelarEdicion={handleCancelarEdicion} // Se le pasa la función para cancelar la edición
      />
      
      <hr />
      
      {/* Pasar la función para iniciar la edición al TareaList */}
      <TareaList
        actualizar={actualizarLista}       // Se mantiene la lógica de recarga
        onEditarTarea={handleEditarTarea}  // Se le pasa la función para que TareaList le diga a App qué tarea editar
      />
    </div>
  );
}

export default App;