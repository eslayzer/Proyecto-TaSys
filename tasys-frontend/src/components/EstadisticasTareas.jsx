import React from 'react';

const EstadisticasTareas = ({ estadisticas }) => {
  if (!estadisticas) {
    return <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Cargando estadísticas...</div>;
  }

  return (
    <div style={{
      padding: '20px',
      border: 'none', // CAMBIADO: Quita el borde
      borderRadius: '8px',
      marginBottom: '30px',
      backgroundColor: 'transparent', // CAMBIADO A TRANSPARENTE
      boxShadow: 'none', // CAMBIADO: Elimina el sombreado
      textAlign: 'center'
    }}>
      {/* CAMBIADO: Color del título para que se vea sobre fondo oscuro */}
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Estadísticas de Tareas</h2>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* Los estilos de los recuadros individuales se mantienen */}
        <div style={{
          flex: '1',
          minWidth: '150px',
          padding: '15px',
          backgroundColor: '#fff3e0', // Naranja claro
          borderRadius: '6px',
          borderLeft: '5px solid #ff9800'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ff9800' }}>Pendientes</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold', color: '#ff9800' }}>
            {estadisticas.pendientes !== undefined ? estadisticas.pendientes : 0}
          </p>
        </div>

        <div style={{
          flex: '1',
          minWidth: '150px',
          padding: '15px',
          backgroundColor: '#ffebee', // Rojo claro
          borderRadius: '6px',
          borderLeft: '5px solid #d32f2f'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Vencidas</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold', color: '#d32f2f' }}>
            {estadisticas.vencidas !== undefined ? estadisticas.vencidas : 0}
          </p>
        </div>

        <div style={{
          flex: '1',
          minWidth: '150px',
          padding: '15px',
          backgroundColor: '#e8f5e9', // Verde claro
          borderRadius: '6px',
          borderLeft: '5px solid #4caf50'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>Completadas</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold', color: '#4caf50' }}>
            {estadisticas.completadas !== undefined ? estadisticas.completadas : 0}
          </p>
        </div>

        <div style={{
          flex: '1',
          minWidth: '150px',
          padding: '15px',
          backgroundColor: '#e3f2fd', // Azul claro
          borderRadius: '6px',
          borderLeft: '5px solid #2196f3'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2196f3' }}>En Proceso</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold', color: '#2196f3' }}>
            {estadisticas.en_proceso !== undefined ? estadisticas.en_proceso : 0}
          </p>
        </div>

        <div style={{
          flex: '1',
          minWidth: '150px',
          padding: '15px',
          backgroundColor: '#f0f0f0', // Gris claro
          borderRadius: '6px',
          borderLeft: '5px solid #888'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Total</h3>
          <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold', color: '#888' }}>
            {estadisticas.total !== undefined ? estadisticas.total : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasTareas;