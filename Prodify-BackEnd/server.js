require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Core middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

// Always initialize Firebase (real Firestore), even if auth bypass is on
require('./firebase');

// Auth + role middlewares
const authMiddleware = require('./authMiddleware');
const loadRole = require('./middlewares/role');

// Routers
const usersRouter = require('./routes/users');
const taskTypesRouter = require('./routes/taskTypes');
const tasksRouter = require('./routes/tasks');
const statsRouter = require('./routes/stats');
const exportRouter = require('./routes/export');

// Protected routes
app.use(authMiddleware, loadRole);
// Singular, capitalized API paths per project convention
app.use('/User', usersRouter);
app.use('/TaskType', taskTypesRouter);
app.use('/Task', tasksRouter);
app.use('/stats', statsRouter);
app.use('/export', exportRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
