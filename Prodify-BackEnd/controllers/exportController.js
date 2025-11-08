const Tasks = require('../models/tasks');
const admin = require('firebase-admin');

function toCsvValue(v) {
  if (v == null) return '';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

function pad2(n){ return n < 10 ? '0' + n : '' + n; }
function formatDate(val) {
  if (!val) return '';
  try {
    let d = null;
    if (typeof val.toDate === 'function') d = val.toDate();
    else if (val instanceof Date) d = val;
    else if (typeof val === 'object' && typeof val._seconds === 'number') {
      const ms = (val._seconds * 1000) + Math.floor((val._nanoseconds || 0) / 1e6);
      d = new Date(ms);
    } else if (typeof val === 'string' || typeof val === 'number') {
      const tmp = new Date(val);
      if (!isNaN(tmp.getTime())) d = tmp; else return String(val);
    }
    if (!d) return '';
    return `${pad2(d.getDate())}/${pad2(d.getMonth()+1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  } catch (_e) {
    return String(val);
  }
}

async function exportManagerCompletedCsv(req, res) {
  if (!req.role.isManager) return res.status(403).json({ error: 'Manager role required' });
  const uid = req.user.uid;
  const rows = await Tasks.list({ managerId: uid, state: 'Done' });

  const header = [
    'Programador',
    'Descricao',
    'DataPrevistaInicio',
    'DataPrevista',
    'TipoTarefa',
    'DataRealInicio',
    'DataRealFim'
  ];

  // Lookups for TaskType (name) and User (name)
  const db = admin.firestore();
  const typeIds = Array.from(new Set(rows.map(r => r.idTaskType).filter(Boolean)));
  const userIds = Array.from(new Set(rows.flatMap(r => Array.isArray(r.idProgrammers) ? r.idProgrammers : r.idProgrammers).filter(Boolean)));
  const typeMap = {};
  if (typeIds.length) {
    const snaps = await Promise.all(typeIds.map(id => db.collection('TaskType').doc(id).get()));
    snaps.forEach(s => { if (s.exists) typeMap[s.id] = (s.data().name || s.id); });
  }
  const userMap = {};
  if (userIds.length) {
    const snaps = await Promise.all(userIds.map(id => db.collection('User').doc(id).get()));
    snaps.forEach(s => { if (s.exists) userMap[s.id] = (s.data().name || s.data().userName || s.id); });
  }

  const lines = [header.join(';')];
  for (const t of rows) {
    const progId = (t.idProgrammers && t.idProgrammers[0]) || '';
    const progName = userMap[progId] || progId || '';
    const typeName = typeMap[t.idTaskType] || t.idTaskType || '';
    lines.push([
      toCsvValue(progName),
      toCsvValue(t.description || ''),
      toCsvValue(formatDate(t.expectedStartDate)),
      toCsvValue(formatDate(t.expectedEndDate)),
      toCsvValue(typeName),
      toCsvValue(formatDate(t.realStartDate)),
      toCsvValue(formatDate(t.realEndDate))
    ].join(';'));
  }

  // Excel hint for delimiter + CRLF line endings
  const csv = ['sep=;', ...lines].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="completed.csv"');
  res.send(csv);
}

module.exports = { exportManagerCompletedCsv };
