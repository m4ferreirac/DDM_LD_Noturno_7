const admin = require('firebase-admin');

module.exports = async function loadRole(req, res, next) {
  try {
    const uid = req.user && req.user.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const db = admin.firestore();
    const snap = await db.collection('User').doc(uid).get();
    if (!snap.exists) {
      // User doc not found; default minimal role
      req.role = { isManager: false };
      return next();
    }
    const data = snap.data() || {};
    req.role = {
      isManager: !!data.isManager,
      managerId: data.managerId || null,
      department: data.department || null,
      experienceLevel: data.experienceLevel || null,
      userName: data.userName || null,
      name: data.name || null
    };
    return next();
  } catch (err) {
    console.error('role middleware error', err);
    return res.status(500).json({ error: 'Failed to load user role' });
  }
};
