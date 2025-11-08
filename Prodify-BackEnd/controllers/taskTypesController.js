const TaskTypes = require('../models/taskTypes');

async function createTaskType(req, res) {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const out = await TaskTypes.create({ name });
  res.status(201).json(out);
}

async function listTaskTypes(_req, res) {
  const data = await TaskTypes.list();
  res.json(data);
}

async function updateTaskType(req, res) {
  const id = req.params.id;
  await TaskTypes.update(id, { name: req.body.name });
  res.json({ ok: true });
}

async function deleteTaskType(req, res) {
  const id = req.params.id;
  await TaskTypes.remove(id);
  res.json({ ok: true });
}

module.exports = {
  createTaskType,
  listTaskTypes,
  updateTaskType,
  deleteTaskType
};
