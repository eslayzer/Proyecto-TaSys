CREATE TABLE IF NOT EXISTS subtareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    estado ENUM('pendiente', 'completada') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_completado DATETIME NULL, -- Para registrar cuando se completó
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE
);subtareas