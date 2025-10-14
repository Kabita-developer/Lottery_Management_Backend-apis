const express = require('express');

const router = express.Router();

// Super admin auth routes
router.use('/super-admin', require('./superAdmin.routes'));

// Admin auth routes
router.use('/admin', require('./admin.routes'));

// User auth routes
router.use('/user', require('./user.routes'));

// Draw Master routes (Super Admin only)
router.use('/draw-master', require('./drawMaster.routes'));

// Same Master routes (Super Admin only)
router.use('/same-master', require('./sameMaster.routes'));

// Tickets routes (Admin only)
router.use('/tickets', require('./ticket.routes'));

module.exports = router;


