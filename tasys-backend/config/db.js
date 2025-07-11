// tasys-backend/config/db.js
const mysql = require('mysql2/promise'); // <<-- CAMBIO CLAVE: Usa 'mysql2/promise'

// Es una buena práctica usar un pool de conexiones para aplicaciones web
// en lugar de una conexión directa, ya que maneja las conexiones de forma más eficiente.
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root', // Tu contraseña de MySQL
    database: 'tasys',
    waitForConnections: true, // Si el pool está lleno, espera por una conexión disponible
    connectionLimit: 10,     // Número máximo de conexiones en el pool
    queueLimit: 0            // Número máximo de solicitudes en cola (0 = ilimitado)
});

// Prueba la conexión del pool al inicio para asegurarte de que funciona
pool.getConnection()
    .then(connection => {
        console.log('Conectado a la base de datos MySQL usando Pool de Promesas');
        connection.release(); // Libera la conexión de vuelta al pool
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
    });

module.exports = pool; // Exporta el pool de conexiones en lugar de la conexión directa