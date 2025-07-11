// PROYECTO-TASYS/tasys-backend/routes/tareas.routes.js
const express = require('express');
const router = express.Router();
// Importa el pool de conexiones (que ya es promisificado)
const pool = require('../config/db'); // <<-- Importa el 'pool' que exportas desde db.js
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// --- ELIMINAR O COMENTAR: Ya no necesitas esta función auxiliar queryPromise ---
// const queryPromise = (sql, values) => {
//     return new Promise((resolve, reject) => {
//         db.query(sql, values, (error, results) => {
//             if (error) {
//                 return reject(error);
//             }
//             resolve(results);
//         });
//     });
// };


// Crear nueva tarea
// La ruta base ya es /api/tareas, así que aquí es '/'
router.post('/', async (req, res) => { // <<-- CORREGIDO: de '/tareas' a '/'
    const { titulo, descripcion, prioridad, categoria, fecha_limite } = req.body;
    const estado = 'Pendiente';

    if (!titulo) {
        return res.status(400).json({ mensaje: 'El título es obligatorio' });
    }

    const sql = `INSERT INTO tareas (titulo, descripcion, prioridad, categoria, fecha_limite, estado)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    try {
        // Usa directamente pool.query que ya devuelve una promesa
        const [resultado] = await pool.query(sql, [titulo, descripcion, prioridad, categoria, fecha_limite, estado]); // <<-- CORREGIDO: usar pool.query
        res.status(201).json({ mensaje: 'Tarea creada correctamente', id: resultado.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al crear la tarea' });
    }
});

// Obtener todas las tareas y actualizar las vencidas
// La ruta base ya es /api/tareas, así que aquí es '/'
router.get('/', async (req, res) => { // <<-- CORREGIDO: de '/tareas' a '/'
    const actualizarSql = `
        UPDATE tareas
        SET estado = 'Vencida'
        WHERE estado = 'Pendiente' AND fecha_limite < CURDATE()
    `;

    try {
        await pool.query(actualizarSql); // <<-- CORREGIDO: usar pool.query
        const obtenerSql = 'SELECT id, titulo, descripcion, prioridad, categoria, estado, fecha_creacion, fecha_limite FROM tareas';
        const [resultados] = await pool.query(obtenerSql); // <<-- CORREGIDO: usar pool.query y desestructurar
        res.json(resultados);
    } catch (err) {
        console.error('Error al procesar tareas:', err);
        res.status(500).json({ mensaje: 'Error al obtener o actualizar tareas.' });
    }
});

// Obtener tareas con filtros opcionales
// La ruta base ya es /api/tareas, así que aquí es '/filtrar'
router.get('/filtrar', async (req, res) => { // <<-- CORREGIDO: de '/tareas/filtrar' a '/filtrar'
    const { estado, prioridad, categoria, fecha_limite } = req.query;

    let sql = 'SELECT id, titulo, descripcion, prioridad, categoria, estado, fecha_creacion, fecha_limite FROM tareas WHERE 1=1';
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

    try {
        const [resultados] = await pool.query(sql, parametros); // <<-- CORREGIDO: usar pool.query y desestructurar
        res.json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al filtrar las tareas' });
    }
});

// Actualizar una tarea existente con historial
// La ruta base ya es /api/tareas, así que aquí es '/:id'
router.put('/:id', async (req, res) => { // <<-- CORREGIDO: de '/tareas/:id' a '/:id'
    const { id } = req.params;
    const { titulo, descripcion, prioridad, categoria, fecha_limite, estado } = req.body;

    const sql = `
        UPDATE tareas
        SET titulo = ?, descripcion = ?, prioridad = ?, categoria = ?, fecha_limite = ?, estado = ?
        WHERE id = ?
    `;

    try {
        const [resultado] = await pool.query(sql, [titulo, descripcion, prioridad, categoria, fecha_limite, estado, id]); // <<-- CORREGIDO: usar pool.query

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        }

        // Registrar en historial
        const historialSql = `
            INSERT INTO historial (tarea_id, descripcion)
            VALUES (?, ?)
        `;
        const resumenCambio = `Se actualizó la tarea con estado: ${estado}`;

        await pool.query(historialSql, [id, resumenCambio]); // <<-- CORREGIDO: usar pool.query
        res.json({ mensaje: 'Tarea actualizada y historial registrado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al actualizar la tarea o registrar historial' });
    }
});

// Eliminar una tarea por ID
// La ruta base ya es /api/tareas, así que aquí es '/:id'
router.delete('/:id', async (req, res) => { // <<-- CORREGIDO: de '/tareas/:id' a '/:id'
    const { id } = req.params;

    const sql = 'DELETE FROM tareas WHERE id = ?';

    try {
        const [resultado] = await pool.query(sql, [id]); // <<-- CORREGIDO: usar pool.query

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
// La ruta base ya es /api/tareas, así que aquí es '/exportar/csv'
router.get('/exportar/csv', async (req, res) => { // <<-- CORREGIDO: de '/tareas/exportar/csv' a '/exportar/csv'
    const sql = 'SELECT id, titulo, descripcion, prioridad, categoria, fecha_limite, estado, fecha_creacion FROM tareas';

    try {
        const [resultados] = await pool.query(sql); // <<-- CORREGIDO: usar pool.query y desestructurar

        if (resultados.length === 0) {
            return res.status(404).json({ mensaje: 'No hay tareas para exportar' });
        }

        const parser = new Parser({ fields: ['id', 'titulo', 'descripcion', 'prioridad', 'categoria', 'fecha_limite', 'estado', 'fecha_creacion'] });
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
// La ruta base ya es /api/tareas, así que aquí es '/exportar/pdf'
router.get('/exportar/pdf', async (req, res) => { // <<-- CORREGIDO: de '/tareas/exportar/pdf' a '/exportar/pdf'
    const sql = 'SELECT id, titulo, estado, fecha_creacion, fecha_limite FROM tareas';

    try {
        const [tasks] = await pool.query(sql); // <<-- CORREGIDO: usar pool.query y desestructurar

        if (tasks.length === 0) {
            return res.status(404).json({ mensaje: 'No hay tareas para exportar' });
        }

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_tareas_${Date.now()}.pdf"`);
        doc.pipe(res);

        // ... (el resto del código de PDFKit es correcto y no necesita cambios)
        doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Tareas', { align: 'center' });
        doc.moveDown(1);

        doc.fontSize(10).font('Helvetica').text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, { align: 'right' });
        doc.moveDown(1);

        const tableTop = doc.y;
        const idX = 50;
        const tituloX = 90;
        const estadoX = 300;
        const creacionX = 380;
        const limiteX = 470;
        const rowHeight = 25;

        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('ID', idX, tableTop, { width: 40 });
        doc.text('Título', tituloX, tableTop, { width: 200 });
        doc.text('Estado', estadoX, tableTop, { width: 80 });
        doc.text('Creación', creacionX, tableTop, { width: 80 });
        doc.text('Fecha Límite', limiteX, tableTop, { width: 80 });
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(idX, tableTop + rowHeight - 5).lineTo(doc.page.width - doc.page.margins.right, tableTop + rowHeight - 5).stroke();
        doc.moveDown(0.5);

        let currentY = tableTop + rowHeight;
        doc.font('Helvetica').fontSize(9);

        tasks.forEach(task => {
            if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                currentY = doc.page.margins.top;
                doc.font('Helvetica-Bold').fontSize(10);
                doc.text('ID', idX, currentY, { width: 40 });
                doc.text('Título', tituloX, currentY, { width: 200 });
                doc.text('Estado', estadoX, currentY, { width: 80 });
                doc.text('Creación', creacionX, currentY, { width: 80 });
                doc.text('Fecha Límite', limiteX, currentY, { width: 80 });
                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(idX, currentY + rowHeight - 5).lineTo(doc.page.width - doc.page.margins.right, currentY + rowHeight - 5).stroke();
                doc.moveDown(0.5);
                currentY += rowHeight;
                doc.font('Helvetica').fontSize(9);
            }

            let statusColor = 'black';
            if (task.estado === 'Pendiente') statusColor = '#ff9800';
            else if (task.estado === 'Completada') statusColor = '#4caf50';
            else if (task.estado === 'En Proceso') statusColor = '#2196f3';
            else if (task.estado === 'Vencida') statusColor = '#d32f2f';

            doc.text(task.id, idX, currentY, { width: 40 });
            doc.text(task.titulo, tituloX, currentY, { width: 200 });
            doc.fillColor(statusColor).text(task.estado, estadoX, currentY, { width: 80 });
            doc.fillColor('black').text(task.fecha_creacion ? new Date(task.fecha_creacion).toLocaleDateString('es-ES') : 'N/A', creacionX, currentY, { width: 80 });
            doc.text(task.fecha_limite ? new Date(task.fecha_limite).toLocaleDateString('es-ES') : 'N/A', limiteX, currentY, { width: 80 });
            doc.moveDown(0.5);

            currentY += rowHeight;
        });

        doc.end();

    } catch (error) {
        console.error("Error al generar el PDF con PDFKit:", error);
        res.status(500).send("Error interno del servidor al generar el PDF.");
    }
});


// Obtener estadísticas básicas de tareas
// La ruta base ya es /api/tareas, así que aquí es '/estadisticas'
router.get('/estadisticas', async (req, res) => { // <<-- CORREGIDO: de '/tareas/estadisticas' a '/estadisticas'
    const sql = `
        SELECT
            COUNT(*) AS total,
            SUM(estado = 'Pendiente') AS pendientes,
            SUM(estado = 'En Proceso') AS en_proceso,
            SUM(estado = 'Completada') AS completadas,
            SUM(estado != 'Completada' AND fecha_limite < CURDATE()) AS vencidas
        FROM tareas;
    `;

    try {
        const [resultados] = await pool.query(sql); // <<-- CORREGIDO: usar pool.query y desestructurar
        res.json(resultados[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener las estadísticas' });
    }
});

// Obtener historial de cambios de una tarea
// La ruta base ya es /api/tareas, así que aquí es '/:id/historial'
router.get('/:id/historial', async (req, res) => { // <<-- CORREGIDO: de '/tareas/:id/historial' a '/:id/historial'
    const { id } = req.params;

    const sql = `
        SELECT * FROM historial
        WHERE tarea_id = ?
        ORDER BY fecha DESC
    `;

    try {
        const [resultados] = await pool.query(sql, [id]); // <<-- CORREGIDO: usar pool.query y desestructurar
        res.json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener el historial' });
    }
});

// Obtener tareas próximas a vencer (ejemplo: en los próximos 2 días)
// La ruta base ya es /api/tareas, así que aquí es '/alertas/proximas'
router.get('/alertas/proximas', async (req, res) => { // <<-- CORREGIDO: de '/tareas/alertas/proximas' a '/alertas/proximas'
    const sql = `
        SELECT id, titulo, descripcion, prioridad, categoria, estado, fecha_creacion, fecha_limite FROM tareas
        WHERE estado != 'Completada'
        AND fecha_limite BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    `;

    try {
        const [resultados] = await pool.query(sql); // <<-- CORREGIDO: usar pool.query y desestructurar
        res.json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener las tareas próximas a vencer' });
    }
});

// Obtener tareas vencidas
// La ruta base ya es /api/tareas, así que aquí es '/alertas/vencidas'
router.get('/alertas/vencidas', async (req, res) => { // <<-- CORREGIDO: de '/tareas/alertas/vencidas' a '/alertas/vencidas'
    const sql = `
        SELECT id, titulo, descripcion, prioridad, categoria, estado, fecha_creacion, fecha_limite FROM tareas
        WHERE estado != 'Completada' AND fecha_limite < CURDATE()
    `;

    try {
        const [resultados] = await pool.query(sql); // <<-- CORREGIDO: usar pool.query y desestructurar
        res.json(resultados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener las tareas vencidas' });
    }
});

// Marcar tarea como completada
// La ruta base ya es /api/tareas, así que aquí es '/:id/completar'
router.put('/:id/completar', async (req, res) => { // <<-- CORREGIDO: de '/tareas/:id/completar' a '/:id/completar'
    const { id } = req.params;

    const sql = `UPDATE tareas SET estado = 'Completada' WHERE id = ?`;

    try {
        const [resultado] = await pool.query(sql, [id]); // <<-- CORREGIDO: usar pool.query

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