// PROYECTO-TASYS/tasys-backend/routes/tareas.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Tu conexión directa a la BD
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// --- Función auxiliar para Promisificar consultas ---
const queryPromise = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// Crear nueva tarea
router.post('/tareas', async (req, res) => {
    const { titulo, descripcion, prioridad, categoria, fecha_limite } = req.body; // <-- CORRECTO: fecha_limite
    const estado = 'Pendiente';

    if (!titulo) {
        return res.status(400).json({ mensaje: 'El título es obligatorio' });
    }

    const sql = `INSERT INTO tareas (titulo, descripcion, prioridad, categoria, fecha_limite, estado)
                  VALUES (?, ?, ?, ?, ?, ?)`; // <-- CORRECTO: fecha_limite
    try {
        const resultado = await queryPromise(sql, [titulo, descripcion, prioridad, categoria, fecha_limite, estado]); // <-- CORRECTO: fecha_limite
        res.status(201).json({ mensaje: 'Tarea creada correctamente', id: resultado.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al crear la tarea' });
    }
});

// Obtener todas las tareas y actualizar las vencidas
router.get('/tareas', async (req, res) => {
    const actualizarSql = `
        UPDATE tareas
        SET estado = 'Vencida'
        WHERE estado = 'Pendiente' AND fecha_limite < CURDATE()
    `; // <-- CORREGIDO: fecha_limite

    try {
        await queryPromise(actualizarSql); // Ejecutamos la actualización
        // Seleccionamos TODOS los campos para el frontend y exportaciones
        const obtenerSql = 'SELECT id, titulo, descripcion, prioridad, categoria, estado, fecha_creacion, fecha_limite FROM tareas'; // <-- CORREGIDO Y COMPLETO
        const resultados = await queryPromise(obtenerSql);
        res.json(resultados);
    } catch (err) {
        console.error('Error al procesar tareas:', err);
        res.status(500).json({ mensaje: 'Error al obtener o actualizar tareas.' });
    }
});

// Obtener tareas con filtros opcionales
router.get('/tareas/filtrar', async (req, res) => {
    const { estado, prioridad, categoria, fecha_limite } = req.query; // <-- CORREGIDO: fecha_limite

    // Seleccionamos TODOS los campos para el frontend
    let sql = 'SELECT id, titulo, descripcion, prioridad, categoria, estado, fecha_creacion, fecha_limite FROM tareas WHERE 1=1'; // <-- CORREGIDO Y COMPLETO
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
    if (fecha_limite) { // <-- CORREGIDO: fecha_limite
        sql += ' AND fecha_limite = ?'; // <-- CORREGIDO: fecha_limite
        parametros.push(fecha_limite); // <-- CORREGIDO: fecha_limite
    }

    try {
        const resultados = await queryPromise(sql, parametros);
        res.json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al filtrar las tareas' });
    }
});

// Actualizar una tarea existente con historial
router.put('/tareas/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, prioridad, categoria, fecha_limite, estado } = req.body; // <-- CORREGIDO: fecha_limite

    const sql = `
        UPDATE tareas
        SET titulo = ?, descripcion = ?, prioridad = ?, categoria = ?, fecha_limite = ?, estado = ?
        WHERE id = ?
    `; // <-- CORREGIDO: fecha_limite

    try {
        const resultado = await queryPromise(sql, [titulo, descripcion, prioridad, categoria, fecha_limite, estado, id]); // <-- CORREGIDO: fecha_limite

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        }

        // Registrar en historial
        const historialSql = `
            INSERT INTO historial (tarea_id, descripcion)
            VALUES (?, ?)
        `;
        const resumenCambio = `Se actualizó la tarea con estado: ${estado}`;

        await queryPromise(historialSql, [id, resumenCambio]);
        res.json({ mensaje: 'Tarea actualizada y historial registrado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al actualizar la tarea o registrar historial' });
    }
});

// Eliminar una tarea por ID
router.delete('/tareas/:id', async (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM tareas WHERE id = ?';

    try {
        const resultado = await queryPromise(sql, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        }
        res.json({ mensaje: 'Tarea eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al eliminar la tarea' });
    }
});

// Exportar tareas en formato CSV (backend)
router.get('/tareas/exportar/csv', async (req, res) => {
    // SELECT explícito para CSV con todos los campos necesarios
    const sql = 'SELECT id, titulo, descripcion, prioridad, categoria, fecha_limite, estado, fecha_creacion FROM tareas'; // <-- CORREGIDO: fecha_limite

    try {
        const resultados = await queryPromise(sql);

        if (resultados.length === 0) {
            return res.status(404).json({ mensaje: 'No hay tareas para exportar' });
        }

        const parser = new Parser({ fields: ['id', 'titulo', 'descripcion', 'prioridad', 'categoria', 'fecha_limite', 'estado', 'fecha_creacion'] }); // <-- CORREGIDO: fecha_limite
        const csv = parser.parse(resultados);

        res.header('Content-Type', 'text/csv');
        res.attachment('tareas.csv');
        return res.send(csv);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al generar el CSV' });
    }
});

// Exportar tareas en formato PDF (backend)
router.get('/tareas/exportar/pdf', async (req, res) => {
    // Seleccionamos explícitamente los campos que usaremos en el PDF
    const sql = 'SELECT id, titulo, estado, fecha_creacion, fecha_limite FROM tareas'; // <-- CORREGIDO: fecha_limite

    try {
        const tasks = await queryPromise(sql);

        if (tasks.length === 0) {
            return res.status(404).json({ mensaje: 'No hay tareas para exportar' });
        }

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_tareas_${Date.now()}.pdf"`);
        doc.pipe(res);

        // Título
        doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Tareas', { align: 'center' });
        doc.moveDown(1);

        // Información de generación
        doc.fontSize(10).font('Helvetica').text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, { align: 'right' });
        doc.moveDown(1);

        const tableTop = doc.y;
        const idX = 50;
        const tituloX = 90;
        const estadoX = 300;
        const creacionX = 380;
        const limiteX = 470; // Cambiado para reflejar 'fecha_limite'
        const rowHeight = 25;

        // Dibujar cabeceras de tabla
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('ID', idX, tableTop, { width: 40 });
        doc.text('Título', tituloX, tableTop, { width: 200 });
        doc.text('Estado', estadoX, tableTop, { width: 80 });
        doc.text('Creación', creacionX, tableTop, { width: 80 });
        doc.text('Fecha Límite', limiteX, tableTop, { width: 80 }); // <-- CORREGIDO: "Fecha Límite" en PDF
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(idX, tableTop + rowHeight - 5).lineTo(doc.page.width - doc.page.margins.right, tableTop + rowHeight - 5).stroke();
        doc.moveDown(0.5);

        let currentY = tableTop + rowHeight;
        doc.font('Helvetica').fontSize(9);

        // Dibujar filas de datos
        tasks.forEach(task => {
            if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                currentY = doc.page.margins.top; // Reiniciar Y en la nueva página
                // Redibujar cabeceras en la nueva página
                doc.font('Helvetica-Bold').fontSize(10);
                doc.text('ID', idX, currentY, { width: 40 });
                doc.text('Título', tituloX, currentY, { width: 200 });
                doc.text('Estado', estadoX, currentY, { width: 80 });
                doc.text('Creación', creacionX, currentY, { width: 80 });
                doc.text('Fecha Límite', limiteX, currentY, { width: 80 }); // <-- CORREGIDO: "Fecha Límite" en PDF
                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(idX, currentY + rowHeight - 5).lineTo(doc.page.width - doc.page.margins.right, currentY + rowHeight - 5).stroke();
                doc.moveDown(0.5);
                currentY += rowHeight;
                doc.font('Helvetica').fontSize(9);
            }

            // Colores para el estado
            let statusColor = 'black';
            if (task.estado === 'Pendiente') statusColor = '#ff9800'; // Naranja
            else if (task.estado === 'Completada') statusColor = '#4caf50'; // Verde
            else if (task.estado === 'En Proceso') statusColor = '#2196f3'; // Azul
            else if (task.estado === 'Vencida') statusColor = '#d32f2f'; // Rojo oscuro

            doc.text(task.id, idX, currentY, { width: 40 });
            doc.text(task.titulo, tituloX, currentY, { width: 200 });
            doc.fillColor(statusColor).text(task.estado, estadoX, currentY, { width: 80 });
            doc.fillColor('black').text(task.fecha_creacion ? new Date(task.fecha_creacion).toLocaleDateString('es-ES') : 'N/A', creacionX, currentY, { width: 80 });
            doc.text(task.fecha_limite ? new Date(task.fecha_limite).toLocaleDateString('es-ES') : 'N/A', limiteX, currentY, { width: 80 }); // <-- CORREGIDO: task.fecha_limite
            doc.moveDown(0.5); // Espacio entre filas

            currentY += rowHeight; // Mover al siguiente espacio de fila
        });

        doc.end();

    } catch (error) {
        console.error("Error al generar el PDF con PDFKit:", error);
        res.status(500).send("Error interno del servidor al generar el PDF.");
    }
});


// Obtener estadísticas básicas de tareas
router.get('/tareas/estadisticas', async (req, res) => {
    const sql = `
        SELECT
            COUNT(*) AS total,
            SUM(estado = 'Pendiente') AS pendientes,
            SUM(estado = 'En Proceso') AS en_proceso,
            SUM(estado = 'Completada') AS completadas,
            SUM(estado != 'Completada' AND fecha_limite < CURDATE()) AS vencidas
        FROM tareas;
    `; // <-- CORREGIDO: fecha_limite

    try {
        const resultados = await queryPromise(sql);
        res.json(resultados[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener las estadísticas' });
    }
});

// Obtener historial de cambios de una tarea
router.get('/tareas/:id/historial', async (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT * FROM historial
        WHERE tarea_id = ?
        ORDER BY fecha DESC
    `;

    try {
        const resultados = await queryPromise(sql, [id]);
        res.json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener el historial' });
    }
});

// Obtener tareas próximas a vencer (ejemplo: en los próximos 2 días)
router.get('/tareas/alertas/proximas', async (req, res) => {
    const sql = `
        SELECT id, titulo, descripcion, prioridad, categoria, estado, fecha_creacion, fecha_limite FROM tareas
        WHERE estado != 'Completada'
        AND fecha_limite BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    `; // <-- CORREGIDO Y COMPLETO: fecha_limite

    try {
        const resultados = await queryPromise(sql);
        res.json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener las tareas próximas a vencer' });
    }
});

// Obtener tareas vencidas
router.get('/tareas/alertas/vencidas', async (req, res) => {
    const sql = `
        SELECT id, titulo, descripcion, prioridad, categoria, estado, fecha_creacion, fecha_limite FROM tareas
        WHERE estado != 'Completada' AND fecha_limite < CURDATE()
    `; // <-- CORREGIDO Y COMPLETO: fecha_limite

    try {
        const resultados = await queryPromise(sql);
        res.json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener las tareas vencidas' });
    }
});

// Marcar tarea como completada
router.put('/tareas/:id/completar', async (req, res) => {
    const { id } = req.params;

    const sql = `UPDATE tareas SET estado = 'Completada' WHERE id = ?`;

    try {
        const resultado = await queryPromise(sql, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        }
        res.json({ mensaje: 'Tarea marcada como completada' });
    } catch (err) {
        console.error('Error al completar tarea:', err);
        res.status(500).json({ mensaje: 'Error al completar la tarea' });
    }
});

module.exports = router;