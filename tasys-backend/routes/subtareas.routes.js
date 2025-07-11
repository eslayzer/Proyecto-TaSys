// tasys-backend/routes/subtareas.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Asegúrate de que esta ruta sea correcta a tu archivo db.js

// Middleware para verificar si la tarea existe antes de operar con subtareas
async function verificarTareaExistente(req, res, next) {
    const { tareaId } = req.params;
    try {
        const [rows] = await pool.query('SELECT id FROM tareas WHERE id = ?', [tareaId]);
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Tarea principal no encontrada.' });
        }
        next(); // La tarea existe, continuar
    } catch (error) {
        console.error('Error al verificar tarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al verificar tarea.' });
    }
}

// 1. Crear una nueva subtarea para una tarea
router.post('/tareas/:tareaId/subtareas', verificarTareaExistente, async (req, res) => {
    const { tareaId } = req.params;
    const { descripcion } = req.body;

    if (!descripcion) {
        return res.status(400).json({ mensaje: 'La descripción de la subtarea es obligatoria.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO subtareas (tarea_id, descripcion) VALUES (?, ?)',
            [tareaId, descripcion]
        );
        res.status(201).json({ id: result.insertId, tarea_id: parseInt(tareaId), descripcion, estado: 'pendiente' });
    } catch (error) {
        console.error('Error al crear subtarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al crear la subtarea.' });
    }
});

// 2. Obtener todas las subtareas de una tarea específica
router.get('/tareas/:tareaId/subtareas', verificarTareaExistente, async (req, res) => {
    const { tareaId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM subtareas WHERE tarea_id = ? ORDER BY fecha_creacion ASC', [tareaId]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener subtareas:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener las subtareas.' });
    }
});

// 3. Marcar una subtarea como completada/pendiente
router.put('/:id/completar', async (req, res) => { // <<-- ¡CAMBIO CLAVE: quitado '/subtareas'!
    const { id } = req.params;
    const { estado } = req.body; // 'completada' o 'pendiente'

    if (!['pendiente', 'completada'].includes(estado)) {
        return res.status(400).json({ mensaje: 'El estado debe ser "pendiente" o "completada".' });
    }

    const fechaCompletado = (estado === 'completada') ? new Date() : null;

    try {
        const [result] = await pool.query(
            'UPDATE subtareas SET estado = ?, fecha_completado = ? WHERE id = ?',
            [estado, fechaCompletado, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Subtarea no encontrada.' });
        }
        res.json({ mensaje: `Subtarea marcada como ${estado}.` });
    } catch (error) {
        console.error('Error al actualizar estado de subtarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al actualizar el estado de la subtarea.' });
    }
});

// 4. Actualizar la descripción de una subtarea
router.put('/:id', async (req, res) => { // <<-- ¡CAMBIO CLAVE: quitado '/subtareas'!
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!descripcion) {
        return res.status(400).json({ mensaje: 'La descripción de la subtarea es obligatoria.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE subtareas SET descripcion = ? WHERE id = ?',
            [descripcion, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Subtarea no encontrada.' });
        }
        res.json({ mensaje: 'Subtarea actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar subtarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al actualizar la subtarea.' });
    }
});


// 5. Eliminar una subtarea
router.delete('/:id', async (req, res) => { // <<-- ¡CAMBIO CLAVE: quitado '/subtareas'!
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM subtareas WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Subtarea no encontrada.' });
        }
        res.json({ mensaje: 'Subtarea eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar subtarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al eliminar la subtarea.' });
    }
});

module.exports = router;