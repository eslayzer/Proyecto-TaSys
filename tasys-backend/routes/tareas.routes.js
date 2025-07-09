const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Crear nueva tarea
router.post('/tareas', (req, res) => {
    const { titulo, descripcion, prioridad, categoria, fecha_limite } = req.body;
    const estado = 'Pendiente'; // Siempre asignamos estado por defecto

    if (!titulo) {
        return res.status(400).json({ mensaje: 'El título es obligatorio' });
    }

    const sql = `INSERT INTO tareas (titulo, descripcion, prioridad, categoria, fecha_limite, estado)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [titulo, descripcion, prioridad, categoria, fecha_limite, estado], (err, resultado) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al crear la tarea' });
        }

        res.status(201).json({ mensaje: 'Tarea creada correctamente', id: resultado.insertId });
    });
});


// Obtener todas las tareas y actualizar las vencidas
router.get('/tareas', (req, res) => {
    const actualizarSql = `
        UPDATE tareas
        SET estado = 'Vencida'
        WHERE estado = 'Pendiente' AND fecha_limite < CURDATE()
    `;

    db.query(actualizarSql, (err) => {
        if (err) {
            console.error('Error al actualizar tareas vencidas:', err);
            return res.status(500).json({ mensaje: 'Error al actualizar tareas vencidas' });
        }

        const obtenerSql = 'SELECT * FROM tareas';

        db.query(obtenerSql, (err2, resultados) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ mensaje: 'Error al obtener tareas' });
            }

            res.json(resultados);
        });
    });
});


// Obtener tareas con filtros opcionales
router.get('/tareas/filtrar', (req, res) => {
    const { estado, prioridad, categoria, fecha_limite } = req.query;

    let sql = 'SELECT * FROM tareas WHERE 1=1';
    const parametros = [];

    if (estado) {
        sql += ' AND estado = ?';
        parametros.push(estado);
    }
    if (prioridad) {
        sql += ' AND prioridad = ?';
        parametros.push(prioridad);
    }
    if (categoria) {
        sql += ' AND categoria = ?';
        parametros.push(categoria);
    }
    if (fecha_limite) {
        sql += ' AND fecha_limite = ?';
        parametros.push(fecha_limite);
    }

    db.query(sql, parametros, (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al filtrar las tareas' });
        }

        res.json(resultados);
    });
});

// Actualizar una tarea existente con historial
router.put('/tareas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, prioridad, categoria, fecha_limite, estado } = req.body;

    const sql = `
        UPDATE tareas
        SET titulo = ?, descripcion = ?, prioridad = ?, categoria = ?, fecha_limite = ?, estado = ?
        WHERE id = ?
    `;

    db.query(sql, [titulo, descripcion, prioridad, categoria, fecha_limite, estado, id], (err, resultado) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al actualizar la tarea' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        }

        // Registrar en historial
        const historialSql = `
            INSERT INTO historial (tarea_id, descripcion)
            VALUES (?, ?)
        `;
        const resumenCambio = `Se actualizó la tarea con estado: ${estado}`;

        db.query(historialSql, [id, resumenCambio], (err2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ mensaje: 'Tarea actualizada, pero falló el historial' });
            }

            res.json({ mensaje: 'Tarea actualizada y historial registrado' });
        });
    });
});

// Eliminar una tarea por ID
router.delete('/tareas/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM tareas WHERE id = ?';

    db.query(sql, [id], (err, resultado) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al eliminar la tarea' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        }

        res.json({ mensaje: 'Tarea eliminada correctamente' });
    });
});

const { Parser } = require('json2csv');

// Exportar tareas en formato CSV
router.get('/tareas/exportar/csv', (req, res) => {
    const sql = 'SELECT * FROM tareas';

    db.query(sql, (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al exportar las tareas' });
        }

        if (resultados.length === 0) {
            return res.status(404).json({ mensaje: 'No hay tareas para exportar' });
        }

        try {
            const parser = new Parser();
            const csv = parser.parse(resultados);

            res.header('Content-Type', 'text/csv');
            res.attachment('tareas.csv');
            return res.send(csv);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensaje: 'Error al generar el CSV' });
        }
    });
});

const PDFDocument = require('pdfkit');

// Exportar tareas en formato PDF
router.get('/tareas/exportar/pdf', (req, res) => {
    const sql = 'SELECT * FROM tareas';

    db.query(sql, (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al exportar las tareas' });
        }

        if (resultados.length === 0) {
            return res.status(404).json({ mensaje: 'No hay tareas para exportar' });
        }

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="tareas.pdf"');

        doc.pipe(res);

        doc.fontSize(16).text('Listado de Tareas', { align: 'center' });
        doc.moveDown();

        resultados.forEach((tarea, index) => {
            doc.fontSize(12).text(`Tarea #${index + 1}`);
            doc.text(`Título: ${tarea.titulo}`);
            doc.text(`Descripción: ${tarea.descripcion}`);
            doc.text(`Prioridad: ${tarea.prioridad}`);
            doc.text(`Categoría: ${tarea.categoria}`);
            doc.text(`Fecha Límite: ${tarea.fecha_limite}`);
            doc.text(`Estado: ${tarea.estado}`);
            doc.text(`Creado: ${tarea.fecha_creacion}`);
            doc.text(`Actualizado: ${tarea.fecha_actualizacion}`);
            doc.moveDown();
        });

        doc.end();
    });
});

// Obtener estadísticas básicas de tareas
router.get('/tareas/estadisticas', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) AS total,
            SUM(estado = 'Pendiente') AS pendientes,
            SUM(estado = 'En Proceso') AS en_proceso,
            SUM(estado = 'Completada') AS completadas,
            SUM(estado != 'Completada' AND fecha_limite < CURDATE()) AS vencidas
        FROM tareas;
    `;

    db.query(sql, (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al obtener las estadísticas' });
        }

        res.json(resultados[0]);
    });
});

// Obtener historial de cambios de una tarea
router.get('/tareas/:id/historial', (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT * FROM historial
        WHERE tarea_id = ?
        ORDER BY fecha DESC
    `;

    db.query(sql, [id], (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al obtener el historial' });
        }

        res.json(resultados);
    });
});

// Obtener tareas próximas a vencer (ejemplo: en los próximos 2 días)
router.get('/tareas/alertas/proximas', (req, res) => {
    const sql = `
        SELECT * FROM tareas
        WHERE estado != 'Completada'
        AND fecha_limite BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    `;

    db.query(sql, (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al obtener las tareas próximas a vencer' });
        }

        res.json(resultados);
    });
});

// Obtener tareas vencidas
router.get('/tareas/alertas/vencidas', (req, res) => {
    const sql = `
        SELECT * FROM tareas
        WHERE estado != 'Completada' AND fecha_limite < CURDATE()
    `;

    db.query(sql, (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al obtener las tareas vencidas' });
        }

        res.json(resultados);
    });
});

// Marcar tarea como completada
router.put('/tareas/:id/completar', (req, res) => {
    const { id } = req.params;

    const sql = `UPDATE tareas SET estado = 'Completada' WHERE id = ?`;

    db.query(sql, [id], (err, resultado) => {
        if (err) {
            console.error('Error al completar tarea:', err);
            return res.status(500).json({ mensaje: 'Error al completar la tarea' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        }

        res.json({ mensaje: 'Tarea marcada como completada' });
    });
});


module.exports = router;
