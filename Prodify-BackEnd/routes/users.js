const express = require('express');
const requireManager = require('../middlewares/requireManager');
const ctrl = require('../controllers/usersController');

const router = express.Router();

// Manager-only
router.post('/', requireManager, ctrl.createUser);
router.get('/', requireManager, ctrl.listUsers);

// Self or manager
router.get('/:uid', ctrl.getUser);

// Manager-only
router.patch('/:uid', requireManager, ctrl.updateUser);
router.delete('/:uid', requireManager, ctrl.deleteUser);

module.exports = router;
