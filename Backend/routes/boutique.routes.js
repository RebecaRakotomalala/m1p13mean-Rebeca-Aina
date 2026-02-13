const express = require('express');
const router = express.Router();
const boutiqueController = require('../controllers/boutique.controller');
const { verifyToken, isBoutiqueOrAdmin } = require('../middlewares/auth.middleware');

// Routes publiques - routes specifiques avant :id
router.get('/', boutiqueController.getAllBoutiques);

// Routes protegees - routes specifiques avant :id
router.get('/user/:userId', verifyToken, boutiqueController.getBoutiquesByUserId);
router.post('/', verifyToken, isBoutiqueOrAdmin, boutiqueController.createBoutique);

// Routes avec :id (doivent etre en dernier)
router.get('/:id', boutiqueController.getBoutiqueById);
router.put('/:id', verifyToken, isBoutiqueOrAdmin, boutiqueController.updateBoutique);
router.delete('/:id', verifyToken, isBoutiqueOrAdmin, boutiqueController.deleteBoutique);

module.exports = router;
