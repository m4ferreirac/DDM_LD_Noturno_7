module.exports = function requireManager(req, res, next) {
  if (req.role && req.role.isManager) return next();
  return res.status(403).json({ error: 'Manager role required' });
};

