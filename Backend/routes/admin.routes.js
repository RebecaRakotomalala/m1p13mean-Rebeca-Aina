const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, isAdmin, isBoutique } = require('../middlewares/auth.middleware');

// Dashboard admin
router.get('/dashboard', verifyToken, isAdmin, adminController.getDashboardStats);

// Gestion boutiques
router.put('/boutiques/:id/valider', verifyToken, isAdmin, adminController.validerBoutique);
router.put('/boutiques/:id/suspendre', verifyToken, isAdmin, adminController.suspendreBoutique);

// Stats boutique (pour le proprietaire)
router.get('/boutique-stats', verifyToken, isBoutique, adminController.getBoutiqueStats);

// Stats stock (pour le proprietaire)
router.get('/stock-stats', verifyToken, isBoutique, adminController.getStockStats);

// Import CSV prix d'achat
router.post('/import-prix-achat', verifyToken, isBoutique, adminController.importCsvPrixAchat);

// Import stock en masse (produit + categorie + cout + quantite)
router.post('/import-stock', verifyToken, isBoutique, adminController.importStock);

// Stats bénéfice
router.get('/benefice-stats', verifyToken, isBoutique, adminController.getBeneficeStats);

module.exports = router;
