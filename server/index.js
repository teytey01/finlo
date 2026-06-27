const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/init');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

initDb();

app.use('/api/tasks', tasksRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Finlo' }));

app.listen(PORT, () => {
  console.log(`🐬 Finlo server running on http://localhost:${PORT}`);
});
