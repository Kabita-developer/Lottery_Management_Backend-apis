const express = require('express');
const { whoAmI } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/centralAuth');

const router = express.Router();

// Central Who Am I endpoint - works for all user types
router.get('/whoami', requireAuth, whoAmI);

module.exports = router;
