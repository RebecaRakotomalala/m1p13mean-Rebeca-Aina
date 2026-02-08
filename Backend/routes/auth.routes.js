/**
 * Routes d'authentification
 * Utilise Express Router pour organiser les routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route d'inscription
router.post('/register', authController.register);

// Route de connexion
router.post('/login', authController.login);

// Route pour obtenir tous les utilisateurs (pour test)
router.get('/users', authController.getAllUsers);

// Route pour obtenir les utilisateurs par rôle
router.get('/users/role/:role', authController.getUsersByRole);

module.exports = router;

