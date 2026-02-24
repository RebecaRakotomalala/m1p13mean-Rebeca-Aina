const express = require('express');
const router = express.Router();
const evenementController = require('../controllers/evenement.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// CRUD Evenements (admin)
router.get('/', verifyToken, isAdmin, evenementController.getAllEvenements);
router.get('/boutiques-actives', verifyToken, isAdmin, evenementController.getBoutiquesActives);
router.get('/:id', verifyToken, isAdmin, evenementController.getEvenementById);
router.post('/', verifyToken, isAdmin, evenementController.createEvenement);
router.put('/:id', verifyToken, isAdmin, evenementController.updateEvenement);
router.put('/:id/statut', verifyToken, isAdmin, evenementController.updateStatutEvenement);
router.delete('/:id', verifyToken, isAdmin, evenementController.deleteEvenement);

module.exports = router;
