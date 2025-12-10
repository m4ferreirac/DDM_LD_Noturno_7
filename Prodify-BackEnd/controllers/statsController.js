const Tasks = require("../models/tasks");

// Helper function to convert Firestore timestamp to Date
function toDate(value) {
  if (!value) return null;
  // Handle Firestore timestamp with _seconds
  if (value._seconds !== undefined) {
    return new Date(value._seconds * 1000);
  }
  // Handle Firestore timestamp with seconds
  if (value.seconds !== undefined) {
    return new Date(value.seconds * 1000);
  }
  // Handle regular date string or Date object
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// Calculate days between two dates
function daysBetween(a, b) {
  const dateA = toDate(a);
  const dateB = toDate(b);
  if (!dateA || !dateB) return null;
  const ms = Math.abs(dateB.getTime() - dateA.getTime());
  return +(ms / (1000 * 60 * 60 * 24)).toFixed(2);
}

// Programmer completed tasks stats
async function programmerCompleted(req, res) {
  try {
    const uid = req.user.uid;

    // Get all tasks and filter by programmer
    const allTasks = await Tasks.list({ state: "Done" });
    const rows = allTasks.filter(
      (t) => Array.isArray(t.idProgrammers) && t.idProgrammers.includes(uid),
    );

    const data = rows.map((t) => ({
      id: t.id,
      description: t.description,
      storyPoints: t.storyPoints,
      durationDays: daysBetween(t.realStartDate, t.realEndDate),
      realStartDate: t.realStartDate,
      realEndDate: t.realEndDate,
    }));
    res.json(data);
  } catch (err) {
    console.error("Programmer completed error:", err);
    res.status(500).json({ error: "Failed to get programmer completed stats" });
  }
}

// Manager completed tasks stats
async function managerCompleted(req, res) {
  try {
    if (!req.role.isManager)
      return res.status(403).json({ error: "Manager role required" });

    const uid = req.user.uid;
    const rows = await Tasks.list({ managerId: uid, state: "Done" });

    const data = rows.map((t) => ({
      id: t.id,
      description: t.description,
      programmerIds: t.idProgrammers || [],
      storyPoints: t.storyPoints,
      durationDays: daysBetween(t.realStartDate, t.realEndDate),
      expectedDays: daysBetween(t.expectedStartDate, t.expectedEndDate),
    }));
    res.json(data);
  } catch (err) {
    console.error("Manager completed error:", err);
    res.status(500).json({ error: "Failed to get manager completed stats" });
  }
}

// Manager pending tasks stats
async function managerPending(req, res) {
  try {
    if (!req.role.isManager)
      return res.status(403).json({ error: "Manager role required" });

    const uid = req.user.uid;
    const rowsAll = await Tasks.list({ managerId: uid });
    const nowDt = new Date();

    const rows = rowsAll
      .filter((t) => t.state !== "Done")
      .map((t) => {
        const expectedEnd = toDate(t.expectedEndDate);
        let remainingDays = null;
        let lateDays = 0;

        if (expectedEnd) {
          remainingDays = +(
            (expectedEnd.getTime() - nowDt.getTime()) /
            (1000 * 60 * 60 * 24)
          ).toFixed(2);
          lateDays = remainingDays < 0 ? Math.abs(remainingDays) : 0;
        }

        return {
          id: t.id,
          description: t.description,
          state: t.state,
          storyPoints: t.storyPoints,
          programmerIds: t.idProgrammers || [],
          remainingDays,
          lateDays,
        };
      })
      .sort((a, b) => a.state.localeCompare(b.state));

    res.json(rows);
  } catch (err) {
    console.error("Manager pending error:", err);
    res.status(500).json({ error: "Failed to get manager pending stats" });
  }
}

// Manager ToDo forecast
async function managerForecast(req, res) {
  try {
    if (!req.role.isManager)
      return res.status(403).json({ error: "Manager role required" });

    const uid = req.user.uid;
    const doneRows = await Tasks.list({ managerId: uid, state: "Done" });

    // Calculate average duration by story points
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
      Object.entries(durationsBySP).map(([sp, arr]) => [
        sp,
        arr.reduce((a, b) => a + b, 0) / arr.length,
      ]),
    );

    // Get ToDo and Doing tasks and estimate duration
    const [todoRows, doingRows] = await Promise.all([
      Tasks.list({ managerId: uid, state: "ToDo" }),
      Tasks.list({ managerId: uid, state: "Doing" }),
    ]);
    const pendingTasks = [...todoRows, ...doingRows];
    const sps = Object.keys(avgBySP)
      .map((x) => parseInt(x, 10))
      .sort((a, b) => a - b);

    let totalDays = 0;
    const items = [];

    for (const t of pendingTasks) {
      const sp = t.storyPoints;
      let est = null;

      if (avgBySP[sp] != null) {
        est = avgBySP[sp];
      } else if (sps.length) {
        // Find closest story points value
        let bestSp = sps[0];
        let bestDiff = Math.abs(sp - bestSp);
        for (const cand of sps) {
          const diff = Math.abs(sp - cand);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestSp = cand;
          }
        }
        est = avgBySP[bestSp];
      }

      if (est != null) totalDays += est;
      items.push({
        id: t.id,
        description: t.description,
        state: t.state,
        storyPoints: sp,
        estimatedDays: est !== null ? +est.toFixed(2) : null,
      });
    }

    res.json({ totalDays: +totalDays.toFixed(2), items });
  } catch (err) {
    console.error("Manager forecast error:", err);
    res.status(500).json({ error: "Failed to get manager forecast" });
  }
}

module.exports = {
  programmerCompleted,
  managerCompleted,
  managerPending,
  managerForecast,
};
