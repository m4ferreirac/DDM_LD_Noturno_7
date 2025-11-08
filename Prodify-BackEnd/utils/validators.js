const ALLOWED_DEPARTMENTS = ['IT', 'Marketing', 'Administração'];
const ALLOWED_LEVELS = ['Junior', 'Senior'];
const ALLOWED_STATES = ['ToDo', 'Doing', 'Done'];

function isIn(list, value) {
  return list.includes(value);
}

function validateUserPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['Invalid body'];
  if (!payload.userName || typeof payload.userName !== 'string') errors.push('userName required');
  if (!payload.name || typeof payload.name !== 'string') errors.push('name required');
  if (typeof payload.isManager !== 'boolean') errors.push('isManager required (boolean)');
  if (!payload.isManager) {
    if (!payload.managerId || typeof payload.managerId !== 'string') errors.push('managerId required for programmer');
    if (payload.experienceLevel && !isIn(ALLOWED_LEVELS, payload.experienceLevel)) errors.push('experienceLevel invalid');
    if (payload.department && !isIn(ALLOWED_DEPARTMENTS, payload.department)) errors.push('department invalid');
  }
  return errors;
}

function validateTaskPayload(payload) {
  const errors = [];
  if (!payload.description) errors.push('description required');
  if (typeof payload.storyPoints !== 'number') errors.push('storyPoints required (number)');
  if (!payload.idTaskType) errors.push('idTaskType required');
  if (!Array.isArray(payload.idProgrammers)) errors.push('idProgrammers must be array');
  if (typeof payload.orderTask !== 'number') errors.push('orderTask required (number)');
  if (payload.state && !isIn(ALLOWED_STATES, payload.state)) errors.push('state invalid');
  return errors;
}

module.exports = {
  ALLOWED_DEPARTMENTS,
  ALLOWED_LEVELS,
  ALLOWED_STATES,
  validateUserPayload,
  validateTaskPayload
};

