const express = require('express');
const { exportManagerCompletedCsv } = require('../controllers/exportController');

const router = express.Router();

// Manager: export completed tasks as CSV (; separated)
router.get('/manager/completed.csv', exportManagerCompletedCsv);

module.exports = router;

