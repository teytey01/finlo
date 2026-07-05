const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'finlo.db'));

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      title          TEXT NOT NULL,
      description    TEXT DEFAULT '',
      status         TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
      priority       TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      category       TEXT DEFAULT 'Work',
      due_date       TEXT,
      kanban_column  TEXT DEFAULT '',
      tags           TEXT DEFAULT '[]',
      subtasks       TEXT DEFAULT '[]',
      attachments    TEXT DEFAULT '[]',
      time_estimate  INTEGER DEFAULT 0,
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrate existing DB — add new columns if they don't exist yet
  const cols = db.prepare("PRAGMA table_info(tasks)").all().map(c => c.name);
  if (!cols.includes('kanban_column'))  db.exec("ALTER TABLE tasks ADD COLUMN kanban_column TEXT DEFAULT ''");
  if (!cols.includes('tags'))           db.exec("ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT '[]'");
  if (!cols.includes('subtasks'))       db.exec("ALTER TABLE tasks ADD COLUMN subtasks TEXT DEFAULT '[]'");
  if (!cols.includes('attachments'))    db.exec("ALTER TABLE tasks ADD COLUMN attachments TEXT DEFAULT '[]'");
  if (!cols.includes('time_estimate'))  db.exec("ALTER TABLE tasks ADD COLUMN time_estimate INTEGER DEFAULT 0");

  // Kanban columns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS kanban_columns (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      title    TEXT NOT NULL,
      color    TEXT DEFAULT '#00d4ff',
      position INTEGER DEFAULT 0
    )
  `);

  // Seed default columns if empty
  const count = db.prepare('SELECT COUNT(*) as n FROM kanban_columns').get();
  if (count.n === 0) {
    db.exec(`
      INSERT INTO kanban_columns (title, color, position) VALUES
        ('To Do',       '#00d4ff', 0),
        ('In Progress', '#f59e0b', 1),
        ('Done',        '#00ff9f', 2)
    `);
  }
}

module.exports = { db, initDb };
