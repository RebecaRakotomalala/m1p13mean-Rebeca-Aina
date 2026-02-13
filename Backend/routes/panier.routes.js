const express = require('express');
const router = express.Router();
const panierController = require('../controllers/panier.controller');
const { verifyToken, isClient } = require('../middlewares/auth.middleware');

// Toutes les routes panier necessitent authentification client
router.get('/', verifyToken, isClient, panierController.getMyPanier);
router.post('/add', verifyToken, isClient, panierController.addToPanier);
router.put('/item/:ligneId', verifyToken, isClient, panierController.updateQuantite);
router.delete('/item/:ligneId', verifyToken, isClient, panierController.removeFromPanier);
router.delete('/clear', verifyToken, isClient, panierController.clearPanier);

module.exports = router;
