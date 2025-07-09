import './App.css'
import { useState } from 'react'
import TareaList from './components/TareaList'
import TareaForm from './components/TareaForm'

function App() {
  const [recargar, setRecargar] = useState(false);

  const manejarTareaCreada = () => {
    setRecargar(!recargar); // Cambia el valor para que TareaList vuelva a cargar
  };

  return (
    <div className="App">
      <h1>Sistema de Tareas - TASys</h1>
      <TareaForm onTareaCreada={manejarTareaCreada} />
      <hr />
      <TareaList actualizar={recargar} />
    </div>
  );
}

export default App;
