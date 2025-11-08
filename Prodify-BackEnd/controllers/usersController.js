const { validateUserPayload } = require('../utils/validators');
const Users = require('../models/users');

// Create user (manager-only; username unique)
async function createUser(req, res) {
  try {
    const body = req.body;
    const errors = validateUserPayload(body);
    if (errors.length) return res.status(400).json({ errors });

    await Users.create(body);
    return res.status(201).json({ ok: true });
  } catch (err) {
    const msg = err && err.message ? err.message : 'Failed to create user';
    return res.status(400).json({ error: msg });
  }
}

// List users (manager-only)
async function listUsers(_req, res) {
  const data = await Users.list();
  return res.json(data);
}

// Get user (self or manager)
async function getUser(req, res) {
  const uid = req.params.uid;
  if (!req.role.isManager && uid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });
  const user = await Users.getById(uid);
  if (!user) return res.status(404).json({ error: 'Not found' });
  return res.json(user);
}

// Update user (manager-only)
async function updateUser(req, res) {
  const uid = req.params.uid;
  const payload = req.body || {};
  delete payload.userName; // immutable here
  await Users.update(uid, payload);
  return res.json({ ok: true });
}

// Delete user (manager-only)
async function deleteUser(req, res) {
  const uid = req.params.uid;
  const ok = await Users.remove(uid);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  return res.json({ ok: true });
}

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser
};
