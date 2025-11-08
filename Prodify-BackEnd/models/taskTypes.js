// Firestore model for TaskType (singular, capitalized)
const admin = require('firebase-admin');
function getDb() { return admin.firestore(); }

const COL = 'TaskType';

async function create(data) {
  const db = getDb();
  const ref = await db.collection(COL).add({ name: data.name });
  return { id: ref.id, name: data.name };
}

async function list() {
  const db = getDb();
  const snap = await db.collection(COL).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function update(id, payload) {
  const db = getDb();
  await db.collection(COL).doc(id).set(payload, { merge: true });
}

async function remove(id) {
  const db = getDb();
  await db.collection(COL).doc(id).delete();
}

module.exports = { create, list, update, remove };
