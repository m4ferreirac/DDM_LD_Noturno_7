const { validateTaskPayload, ALLOWED_STATES } = require('../utils/validators');
const Tasks = require('../models/tasks');
const Users = require('../models/users');

const now = () => new Date();

async function programmersBelongToManager(programmerIds, managerId) {
  if (!Array.isArray(programmerIds) || programmerIds.length === 0) return false;
  return Users.programmersBelongToManager(programmerIds, managerId);
}

// Create task (manager)
async function createTask(req, res) {
  try {
    const body = req.body || {};
    const errors = validateTaskPayload(body);
    if (errors.length) return res.status(400).json({ errors });

    const managerId = req.user.uid;
    const ok = await programmersBelongToManager(body.idProgrammers, managerId);
    if (!ok) return res.status(400).json({ error: 'Programmers must belong to the manager' });

    for (const pid of body.idProgrammers) {
      const conflict = await Tasks.hasOrderConflictForManager(pid, managerId, body.orderTask);
      if (conflict) return res.status(400).json({ error: `orderTask ${body.orderTask} already used for programmer ${pid}` });
    }

    const doc = {
      description: body.description,
      state: 'ToDo',
      storyPoints: body.storyPoints,
      createDate: now(),
      expectedStartDate: body.expectedStartDate ? new Date(body.expectedStartDate) : null,
      expectedEndDate: body.expectedEndDate ? new Date(body.expectedEndDate) : null,
      realStartDate: null,
      realEndDate: null,
      idManager: managerId,
      idProgrammers: body.idProgrammers,
      idTaskType: body.idTaskType,
      orderTask: body.orderTask
    };

    const out = await Tasks.create(doc);
    console.log('Task created', out.id);
    res.status(201).json(out);
  } catch (err) {
    console.error('Create task error', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

// List tasks
async function listTasks(req, res) {
  try {
    const uid = req.user.uid;
    const isManager = !!req.role.isManager;
    const { state, programmer } = req.query;

    const data = await Tasks.list({
      managerId: isManager ? uid : undefined,
      programmerId: programmer,
      state: state && ALLOWED_STATES.includes(state) ? state : undefined
    });
    res.json(data);
  } catch (err) {
    console.error('List tasks error', err);
    res.status(500).json({ error: 'Failed to list tasks' });
  }
}

// Kanban grouped
async function getKanban(req, res) {
  try {
    const uid = req.user.uid;
    const isManager = !!req.role.isManager;
    const all = await Tasks.list({ managerId: isManager ? uid : undefined });
    const grouped = { ToDo: [], Doing: [], Done: [] };
    for (const t of all) grouped[t.state] && grouped[t.state].push(t);
    res.json(grouped);
  } catch (err) {
    console.error('Kanban error', err);
    res.status(500).json({ error: 'Failed to build kanban' });
  }
}

// Update task (manager)
async function updateTask(req, res) {
  try {
    const id = req.params.id;
    const uid = req.user.uid;
    const task = await Tasks.getById(id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    if (task.idManager !== uid) return res.status(403).json({ error: 'Forbidden' });
    if (task.state === 'Done') return res.status(400).json({ error: 'Done tasks cannot be edited' });

    const payload = { ...req.body };
    delete payload.idManager;
    delete payload.realStartDate;
    delete payload.realEndDate;
    delete payload.state;
    await Tasks.update(id, payload);
    res.json({ ok: true });
  } catch (err) {
    console.error('Update task error', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

// Delete task (manager)
async function deleteTask(req, res) {
  try {
    const id = req.params.id;
    const uid = req.user.uid;
    const task = await Tasks.getById(id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    if (task.idManager !== uid) return res.status(403).json({ error: 'Forbidden' });
    await Tasks.remove(id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete task error', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}

// Move task state (programmer)
async function moveTask(req, res) {
  try {
    const id = req.params.id;
    const { toState } = req.body || {};
    const uid = req.user.uid;

    if (!ALLOWED_STATES.includes(toState)) return res.status(400).json({ error: 'Invalid state' });

    const task = await Tasks.getById(id);
    if (!task) return res.status(404).json({ error: 'Not found' });

    if (!Array.isArray(task.idProgrammers) || !task.idProgrammers.includes(uid)) {
      return res.status(403).json({ error: 'Not your task' });
    }
    if (task.state === 'Done') return res.status(400).json({ error: 'Done is terminal' });
    if (toState === task.state) return res.json({ ok: true });

    if (toState === 'Doing') {
      const doingCount = await Tasks.countDoingByUser(uid);
      if (doingCount >= 2) return res.status(400).json({ error: 'You already have 2 tasks in Doing' });

      const minOrder = await Tasks.minOrderInStateByUser(uid, 'ToDo');
      if (minOrder !== null && task.orderTask !== minOrder) {
        return res.status(400).json({ error: 'Respect order before moving to Doing' });
      }
      await Tasks.update(id, { state: 'Doing', realStartDate: task.realStartDate || now() });
      console.log('Task moved to Doing', id);
      return res.json({ ok: true });
    }

    if (toState === 'Done') {
      const minDoing = await Tasks.minOrderInStateByUser(uid, 'Doing');
      if (minDoing !== null && task.orderTask !== minDoing) {
        return res.status(400).json({ error: 'Respect order before moving to Done' });
      }
      await Tasks.update(id, { state: 'Done', realEndDate: now() });
      console.log('Task moved to Done', id);
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Invalid transition' });
  } catch (err) {
    console.error('Move task error', err);
    res.status(500).json({ error: 'Failed to move task' });
  }
}

module.exports = {
  createTask,
  listTasks,
  getKanban,
  updateTask,
  deleteTask,
  moveTask
};
