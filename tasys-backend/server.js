const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // Asumo que este 'db' es tu conexión a la base de datos
const tareasRoutes = require('./routes/tareas.routes');
const subtareasRoutes = require('./routes/subtareas.routes'); // Importa las rutas de subtareas


const app = express();
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON en el cuerpo de las peticiones

// Rutas
// <<-- CAMBIO CRÍTICO AQUÍ -->>
app.use('/api/tareas', tareasRoutes); // Monta las rutas de tareas bajo el prefijo '/api/tareas'
app.use('/api/subtareas', subtareasRoutes); // Monta las rutas de subtareas bajo el prefijo '/api/subtareas'

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});