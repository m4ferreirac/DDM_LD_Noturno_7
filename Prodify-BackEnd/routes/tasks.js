const express = require('express');
const requireManager = require('../middlewares/requireManager');
const ctrl = require('../controllers/tasksController');

const router = express.Router();

router.post('/', requireManager, ctrl.createTask);
router.get('/', ctrl.listTasks);
router.get('/kanban', ctrl.getKanban);
router.patch('/:id', requireManager, ctrl.updateTask);
router.delete('/:id', requireManager, ctrl.deleteTask);
router.post('/:id/move', ctrl.moveTask);

module.exports = router;
