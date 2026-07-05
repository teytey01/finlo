const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeJSON(val, fallback) {
  try { return (val && typeof val === 'string') ? JSON.parse(val) : (val ?? fallback); }
  catch { return fallback; }
}

function parseTask(task) {
  if (!task) return null;
  return {
    ...task,
    tags:        safeJSON(task.tags,        []),
    subtasks:    safeJSON(task.subtasks,     []),
    attachments: safeJSON(task.attachments,  []),
    time_estimate: task.time_estimate || 0,
  };
}

// ── GET /api/tasks ────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { search, status, priority, sort } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (search)   { query += ' AND title LIKE ?'; params.push(`%${search}%`); }
    if (status)   { query += ' AND status = ?';   params.push(status); }
    if (priority) { query += ' AND priority = ?'; params.push(priority); }

    if (sort === 'oldest')        query += ' ORDER BY created_at ASC';
    else if (sort === 'priority') query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC";
    else if (sort === 'due_date') query += ' ORDER BY due_date ASC NULLS LAST';
    else                          query += ' ORDER BY created_at DESC';

    res.json(db.prepare(query).all(...params).map(parseTask));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const {
      title,
      description   = '',
      priority      = 'medium',
      category      = 'Work',
      due_date      = null,
      kanban_column = '',
      tags          = [],
      subtasks      = [],
      attachments   = [],
      time_estimate = 0,
    } = req.body;

    if (!title || !String(title).trim())
      return res.status(400).json({ error: 'Title is required.' });
    if (String(title).trim().length > 100)
      return res.status(400).json({ error: 'Title must be 100 characters or fewer.' });

    const result = db.prepare(`
      INSERT INTO tasks
        (title, description, priority, category, due_date,
         kanban_column, tags, subtasks, attachments, time_estimate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      String(title).trim(),
      description || '',
      priority    || 'medium',
      category    || 'Work',
      due_date    || null,
      kanban_column || '',
      JSON.stringify(Array.isArray(tags)        ? tags        : []),
      JSON.stringify(Array.isArray(subtasks)    ? subtasks    : []),
      JSON.stringify(Array.isArray(attachments) ? attachments : []),
      Number(time_estimate) || 0
    );

    const task = parseTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
    res.status(201).json(task);
  } catch (err) {
    console.error('POST /api/tasks error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    const {
      title, description, priority, category, due_date,
      kanban_column, tags, subtasks, attachments, time_estimate,
    } = req.body;

    if (!title || !String(title).trim())
      return res.status(400).json({ error: 'Title is required.' });
    if (String(title).trim().length > 100)
      return res.status(400).json({ error: 'Title must be 100 characters or fewer.' });

    const newTags        = tags        !== undefined ? (Array.isArray(tags)        ? tags        : []) : safeJSON(existing.tags,        []);
    const newSubtasks    = subtasks    !== undefined ? (Array.isArray(subtasks)    ? subtasks    : []) : safeJSON(existing.subtasks,     []);
    const newAttachments = attachments !== undefined ? (Array.isArray(attachments) ? attachments : []) : safeJSON(existing.attachments,  []);

    db.prepare(`
      UPDATE tasks SET
        title=?, description=?, priority=?, category=?, due_date=?,
        kanban_column=?, tags=?, subtasks=?, attachments=?, time_estimate=?,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(
      String(title).trim(),
      description   ?? existing.description,
      priority      ?? existing.priority,
      category      ?? existing.category,
      due_date      !== undefined ? (due_date || null) : existing.due_date,
      kanban_column ?? existing.kanban_column,
      JSON.stringify(newTags),
      JSON.stringify(newSubtasks),
      JSON.stringify(newAttachments),
      Number(time_estimate) || existing.time_estimate || 0,
      id
    );

    res.json(parseTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)));
  } catch (err) {
    console.error('PUT /api/tasks error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/tasks/:id/toggle ───────────────────────────────────────────────
router.patch('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const newStatus = task.status === 'active' ? 'completed' : 'active';
    db.prepare('UPDATE tasks SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(newStatus, id);
    res.json(parseTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/tasks/:id/move ─────────────────────────────────────────────────
router.patch('/:id/move', (req, res) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const { kanban_column, due_date } = req.body;
    const sets = ['updated_at=CURRENT_TIMESTAMP'];
    const params = [];

    if (kanban_column !== undefined) { sets.unshift('kanban_column=?'); params.push(kanban_column); }
    if (due_date      !== undefined) { sets.unshift('due_date=?');      params.push(due_date); }
    params.push(id);

    db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id=?`).run(...params);
    res.json(parseTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!db.prepare('SELECT id FROM tasks WHERE id = ?').get(id))
      return res.status(404).json({ error: 'Task not found.' });
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
