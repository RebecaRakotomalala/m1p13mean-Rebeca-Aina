const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produit.controller');
const { verifyToken, isBoutiqueOrAdmin } = require('../middlewares/auth.middleware');

// Routes protegees (boutique/admin) - AVANT les routes avec :id
router.get('/me/list', verifyToken, isBoutiqueOrAdmin, produitController.getMyProduits);
router.post('/', verifyToken, isBoutiqueOrAdmin, produitController.createProduit);

// Routes publiques - routes specifiques avant :id
router.get('/', produitController.getAllProduits);
router.get('/boutique/:boutiqueId', produitController.getProduitsByBoutique);
router.get('/:id', produitController.getProduitById);

// Routes protegees (boutique/admin)
router.put('/:id', verifyToken, isBoutiqueOrAdmin, produitController.updateProduit);
router.delete('/:id', verifyToken, isBoutiqueOrAdmin, produitController.deleteProduit);

module.exports = router;
