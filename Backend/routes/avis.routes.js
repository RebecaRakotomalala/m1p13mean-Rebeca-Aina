const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avis.controller');
const { verifyToken, isClient, isBoutique } = require('../middlewares/auth.middleware');

// Routes publiques
router.get('/produit/:produitId', avisController.getAvisByProduit);
router.get('/boutique/:boutiqueId', avisController.getAvisByBoutique);

// Routes protegees
router.post('/', verifyToken, isClient, avisController.createAvis);
router.get('/mes-avis', verifyToken, isClient, avisController.getMyAvis);
router.put('/:id/repondre', verifyToken, isBoutique, avisController.repondreAvis);

module.exports = router;
