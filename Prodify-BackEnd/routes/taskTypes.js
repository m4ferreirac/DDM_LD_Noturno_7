const express = require('express');
const requireManager = require('../middlewares/requireManager');
const ctrl = require('../controllers/taskTypesController');

const router = express.Router();

router.post('/', requireManager, ctrl.createTaskType);
router.get('/', ctrl.listTaskTypes);
router.patch('/:id', requireManager, ctrl.updateTaskType);
router.delete('/:id', requireManager, ctrl.deleteTaskType);

module.exports = router;
