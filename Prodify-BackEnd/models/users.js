// Firestore model for User (singular, capitalized)
const admin = require('firebase-admin');
function getDb() { return admin.firestore(); }

const COL = 'User';

async function getById(uid) {
  const db = getDb();
  const doc = await db.collection(COL).doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function list() {
  const db = getDb();
  const snap = await db.collection(COL).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function create(data) {
  const db = getDb();
  const uid = data.uid || db.collection(COL).doc().id;
  // Best-effort unique userName check via query (no extra collection)
  if (data.userName) {
    const dup = await db.collection(COL).where('userName', '==', data.userName).limit(1).get();
    if (!dup.empty) throw new Error('userName already exists');
  }
  await db.collection(COL).doc(uid).set({
    userName: data.userName,
    name: data.name,
    isManager: !!data.isManager,
    department: data.department || null,
    experienceLevel: data.experienceLevel || null,
    managerId: data.isManager ? null : data.managerId || null
  });
  return uid;
}

async function update(uid, payload) {
  const db = getDb();
  await db.collection(COL).doc(uid).set(payload, { merge: true });
}

async function remove(uid) {
  const db = getDb();
  const doc = await db.collection(COL).doc(uid).get();
  if (!doc.exists) return false;
  await db.collection(COL).doc(uid).delete();
  return true;
}

async function programmersBelongToManager(programmerIds, managerId) {
  const db = getDb();
  if (!Array.isArray(programmerIds) || programmerIds.length === 0) return false;
  const snaps = await Promise.all(programmerIds.map((pid) => db.collection(COL).doc(pid).get()));
  return snaps.every((s) => s.exists && s.data().managerId === managerId && s.data().isManager === false);
}

module.exports = {
  getById,
  list,
  create,
  update,
  remove,
  programmersBelongToManager
};
