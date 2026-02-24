const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, isAdmin, isBoutique } = require('../middlewares/auth.middleware');

// Dashboard admin
router.get('/dashboard', verifyToken, isAdmin, adminController.getDashboardStats);

// Gestion boutiques
router.get('/boutiques/:id/detail', verifyToken, isAdmin, adminController.getBoutiqueDetail);
router.put('/boutiques/:id/valider', verifyToken, isAdmin, adminController.validerBoutique);
router.put('/boutiques/:id/rejeter', verifyToken, isAdmin, adminController.rejeterBoutique);
router.put('/boutiques/:id/suspendre', verifyToken, isAdmin, adminController.suspendreBoutique);
router.put('/boutiques/:id/emplacement', verifyToken, isAdmin, adminController.updateEmplacementBoutique);

// Moderation avis
router.get('/avis', verifyToken, isAdmin, adminController.getAllAvis);
router.put('/avis/:id/moderer', verifyToken, isAdmin, adminController.modererAvis);
router.delete('/avis/:id', verifyToken, isAdmin, adminController.supprimerAvis);

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
