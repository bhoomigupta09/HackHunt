const express = require('express');
const router = express.Router();
const {
  getHackathons,
  getHackathonStats
} = require('../utils/controllers/hackathonController');

router.get('/', getHackathons);
router.get('/stats', getHackathonStats);

module.exports = router;
