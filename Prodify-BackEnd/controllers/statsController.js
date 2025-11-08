const Tasks = require('../models/tasks');

function daysBetween(a, b) {
  if (!a || !b) return null;
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return +(ms / (1000 * 60 * 60 * 24)).toFixed(2);
}

async function programmerCompleted(req, res) {
  const uid = req.user.uid;
  const rows = await Tasks.list({ programmerId: uid, state: 'Done' });
  const data = rows.map((t) => ({
    id: t.id,
    description: t.description,
    durationDays: daysBetween(t.realStartDate, t.realEndDate),
    realStartDate: t.realStartDate,
    realEndDate: t.realEndDate
  }));
  res.json(data);
}

async function managerCompleted(req, res) {
  if (!req.role.isManager) return res.status(403).json({ error: 'Manager role required' });
  const uid = req.user.uid;
  const rows = await Tasks.list({ managerId: uid, state: 'Done' });
  const data = rows.map((t) => ({
    id: t.id,
    description: t.description,
    programmerIds: t.idProgrammers || [],
    durationDays: daysBetween(t.realStartDate, t.realEndDate),
    expectedDays: daysBetween(t.expectedStartDate, t.expectedEndDate)
  }));
  res.json(data);
}

async function managerPending(req, res) {
  if (!req.role.isManager) return res.status(403).json({ error: 'Manager role required' });
  const uid = req.user.uid;
  const rowsAll = await Tasks.list({ managerId: uid });
  const nowDt = new Date();
  const rows = rowsAll
    .filter((t) => t.state !== 'Done')
    .map((t) => {
      const remainingDays = t.expectedEndDate ? +(((new Date(t.expectedEndDate).getTime() - nowDt.getTime())/(1000*60*60*24)).toFixed(2)) : null;
      const lateDays = remainingDays !== null && remainingDays < 0 ? Math.abs(remainingDays) : 0;
      return { id: t.id, state: t.state, programmerIds: t.idProgrammers || [], remainingDays, lateDays };
    })
    .sort((a, b) => a.state.localeCompare(b.state));
  res.json(rows);
}

async function managerForecast(req, res) {
  if (!req.role.isManager) return res.status(403).json({ error: 'Manager role required' });
  const uid = req.user.uid;
  const doneRows = await Tasks.list({ managerId: uid, state: 'Done' });
  const durationsBySP = {};
  for (const t of doneRows) {
    const sp = t.storyPoints;
    const dur = daysBetween(t.realStartDate, t.realEndDate);
    if (sp != null && dur != null) {
      durationsBySP[sp] = durationsBySP[sp] || [];
      durationsBySP[sp].push(dur);
    }
  }
  const avgBySP = Object.fromEntries(
    Object.entries(durationsBySP).map(([sp, arr]) => [sp, arr.reduce((a, b) => a + b, 0) / arr.length])
  );

  const todoRows = await Tasks.list({ managerId: uid, state: 'ToDo' });
  const sps = Object.keys(avgBySP).map((x) => parseInt(x, 10)).sort((a, b) => a - b);
  let totalDays = 0;
  const items = [];
  for (const t of todoRows) {
    const sp = t.storyPoints;
    let est = null;
    if (avgBySP[sp] != null) {
      est = avgBySP[sp];
    } else if (sps.length) {
      let bestSp = sps[0];
      let bestDiff = Math.abs(sp - bestSp);
      for (const cand of sps) {
        const diff = Math.abs(sp - cand);
        if (diff < bestDiff) { bestDiff = diff; bestSp = cand; }
      }
      est = avgBySP[bestSp];
    }
    if (est != null) totalDays += est;
    items.push({ id: t.id, storyPoints: sp, estimatedDays: est });
  }

  res.json({ totalDays: +totalDays.toFixed(2), items });
}

module.exports = {
  programmerCompleted,
  managerCompleted,
  managerPending,
  managerForecast
};
