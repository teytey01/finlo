const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

// GET /api/columns
router.get('/', (req, res) => {
  try {
    const cols = db.prepare('SELECT * FROM kanban_columns ORDER BY position ASC').all();
    res.json(cols);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/columns
router.post('/', (req, res) => {
  try {
    const { title, color = '#00d4ff' } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required.' });

    const maxPos = db.prepare('SELECT MAX(position) as m FROM kanban_columns').get();
    const position = (maxPos.m ?? -1) + 1;

    const result = db.prepare(
      'INSERT INTO kanban_columns (title, color, position) VALUES (?, ?, ?)'
    ).run(title.trim(), color, position);

    const col = db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(col);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/columns/:id  — rename or recolor
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const col = db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(id);
    if (!col) return res.status(404).json({ error: 'Column not found.' });

    const { title, color } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required.' });

    db.prepare('UPDATE kanban_columns SET title=?, color=? WHERE id=?')
      .run(title.trim(), color ?? col.color, id);

    res.json(db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/columns/reorder  — array of { id, position }
router.patch('/reorder', (req, res) => {
  try {
    const { order } = req.body; // [{ id, position }, ...]
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array.' });

    const update = db.prepare('UPDATE kanban_columns SET position=? WHERE id=?');
    const tx = db.transaction(() => order.forEach(({ id, position }) => update.run(position, id)));
    tx();

    const cols = db.prepare('SELECT * FROM kanban_columns ORDER BY position ASC').all();
    res.json(cols);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/columns/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const col = db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(id);
    if (!col) return res.status(404).json({ error: 'Column not found.' });

    // Unassign tasks in this column
    db.prepare("UPDATE tasks SET kanban_column='' WHERE kanban_column=?").run(col.title);
    db.prepare('DELETE FROM kanban_columns WHERE id=?').run(id);

    res.json({ message: 'Column deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
