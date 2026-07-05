const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/init');
const tasksRouter   = require('./routes/tasks');
const columnsRouter = require('./routes/columns');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));

// Increase limit to handle base64-encoded file attachments
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

initDb();

app.use('/api/tasks',   tasksRouter);
app.use('/api/columns', columnsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Finlo' }));

// Global error handler — catches JSON parse errors and payload too large
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Attachments are too large. Keep total size under 15 MB.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid request data.' });
  }
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`🐬 Finlo server running on http://localhost:${PORT}`);
});
