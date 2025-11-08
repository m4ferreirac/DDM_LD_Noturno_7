const express = require('express');
const ctrl = require('../controllers/statsController');

const router = express.Router();

router.get('/programmer/completed', ctrl.programmerCompleted);
router.get('/manager/completed', ctrl.managerCompleted);
router.get('/manager/pending', ctrl.managerPending);
router.get('/manager/todo-forecast', ctrl.managerForecast);

module.exports = router;
