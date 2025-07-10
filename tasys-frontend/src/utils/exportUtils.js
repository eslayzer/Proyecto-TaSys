// tasys-frontend/src/utils/exportUtils.js

// Las URLs deben coincidir con tu configuración de backend
// Tu backend corre en el puerto 3000 y sus rutas de tareas están bajo /api/tareas
export const downloadTasksAsCsv = () => {
    // *** CAMBIO AQUÍ: Se eliminó '/tasks' y se cambió a '/tareas' ***
    window.open(`http://localhost:3000/api/tareas/exportar/csv`, '_blank'); // <-- CORRECTO
};

export const downloadPdfFromServer = () => {
    // *** CAMBIO AQUÍ: Se eliminó '/tasks' y se cambió a '/tareas' ***
    window.open('http://localhost:3000/api/tareas/exportar/pdf', '_blank'); // <-- CORRECTO
};