const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protegees
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

// Routes admin
router.get('/users', verifyToken, isAdmin, authController.getAllUsers);
router.get('/users/role/:role', verifyToken, isAdmin, authController.getUsersByRole);
router.put('/users/:id/toggle-status', verifyToken, isAdmin, authController.toggleUserStatus);

module.exports = router;
