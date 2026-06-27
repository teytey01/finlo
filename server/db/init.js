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
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT DEFAULT '',
      status      TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
      priority    TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      category    TEXT DEFAULT 'Work',
      due_date    TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

module.exports = { db, initDb };
