const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const tareasRoutes = require('./routes/tareas.routes');


const app = express();
app.use(cors());
app.use(express.json());

//app.use('/api', tareasRoutes);

// Rutas
app.use('/api', tareasRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

