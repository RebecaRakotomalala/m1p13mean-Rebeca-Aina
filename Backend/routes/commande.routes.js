const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commande.controller');
const { verifyToken, isClient, isAdmin, isBoutique, isBoutiqueOrAdmin } = require('../middlewares/auth.middleware');

// Client
router.post('/', verifyToken, isClient, commandeController.createCommande);
router.get('/mes-commandes', verifyToken, isClient, commandeController.getMyCommandes);

// Boutique
router.get('/boutique', verifyToken, isBoutique, commandeController.getCommandesBoutique);

// Admin
router.get('/all', verifyToken, isAdmin, commandeController.getAllCommandes);

// Commun (detail + update statut)
router.get('/:id', verifyToken, commandeController.getCommandeById);
router.put('/:id/statut', verifyToken, isBoutiqueOrAdmin, commandeController.updateStatutCommande);

module.exports = router;
