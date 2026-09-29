const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ success: false, error: 'Database error fetching tasks' });
  }
});

// GET task by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`Error fetching task ${id}:`, err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// POST create task
router.post('/', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title.trim(), description ? description.trim() : null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  try {
    const existing = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const currentTask = existing.rows[0];
    const newTitle = title !== undefined ? title.trim() : currentTask.title;
    const newDesc = description !== undefined ? description : currentTask.description;
    const newCompleted = completed !== undefined ? Boolean(completed) : currentTask.completed;

    const result = await db.query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [newTitle, newDesc, newCompleted, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`Error updating task ${id}:`, err);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully', data: result.rows[0] });
  } catch (err) {
    console.error(`Error deleting task ${id}:`, err);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

module.exports = router;
