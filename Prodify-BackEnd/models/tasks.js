// Firestore model for Task (singular, capitalized)
const admin = require('firebase-admin');
function getDb() { return admin.firestore(); }

const COL = 'Task';

async function create(doc) {
  const db = getDb();
  const ref = await db.collection(COL).add(doc);
  return { id: ref.id, ...doc };
}

async function getById(id) {
  const db = getDb();
  const snap = await db.collection(COL).doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function update(id, payload) {
  const db = getDb();
  await db.collection(COL).doc(id).set(payload, { merge: true });
}

async function remove(id) {
  const db = getDb();
  await db.collection(COL).doc(id).delete();
}

async function list({ managerId, programmerId, state } = {}) {
  const db = getDb();
  let q = db.collection(COL);
  if (managerId) q = q.where('idManager', '==', managerId);
  if (programmerId) q = q.where('idProgrammers', 'array-contains', programmerId);
  if (state) q = q.where('state', '==', state);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function countDoingByUser(uid) {
  const db = getDb();
  const snap = await db
    .collection(COL)
    .where('idProgrammers', 'array-contains', uid)
    .where('state', '==', 'Doing')
    .get();
  return snap.size;
}

async function minOrderInStateByUser(uid, state) {
  const db = getDb();
  const snap = await db
    .collection(COL)
    .where('idProgrammers', 'array-contains', uid)
    .where('state', '==', state)
    .get();
  const arr = snap.docs.map((d) => d.data().orderTask).filter((x) => typeof x === 'number');
  return arr.length ? Math.min(...arr) : null;
}

async function hasOrderConflictForManager(pid, managerId, orderTask) {
  const db = getDb();
  const qs = await db
    .collection(COL)
    .where('idProgrammers', 'array-contains', pid)
    .where('idManager', '==', managerId)
    .get();
  return qs.docs.some((d) => d.data().orderTask === orderTask);
}

module.exports = {
  create,
  getById,
  update,
  remove,
  list,
  countDoingByUser,
  minOrderInStateByUser,
  hasOrderConflictForManager
};
