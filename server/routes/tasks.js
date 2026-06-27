const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

// GET /api/tasks
router.get('/', (req, res) => {
  try {
    const { search, status, priority, sort } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (sort === 'oldest') {
      query += ' ORDER BY created_at ASC';
    } else if (sort === 'priority') {
      query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC";
    } else if (sort === 'due_date') {
      query += ' ORDER BY due_date ASC NULLS LAST';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', (req, res) => {
  try {
    const { title, description = '', priority = 'medium', category = 'Work', due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({ error: 'Title must be 100 characters or fewer.' });
    }

    const stmt = db.prepare(
      'INSERT INTO tasks (title, description, priority, category, due_date) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(title.trim(), description, priority, category, due_date || null);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    const { title, description, priority, category, due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({ error: 'Title must be 100 characters or fewer.' });
    }

    db.prepare(
      `UPDATE tasks SET title=?, description=?, priority=?, category=?, due_date=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(title.trim(), description ?? existing.description, priority ?? existing.priority, category ?? existing.category, due_date ?? existing.due_date, id);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id/toggle
router.patch('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const newStatus = task.status === 'active' ? 'completed' : 'active';
    db.prepare('UPDATE tasks SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(newStatus, id);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
