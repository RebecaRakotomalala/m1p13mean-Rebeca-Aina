/**
 * Routes pour les boutiques
 * Utilise Express Router pour organiser les routes
 */

const express = require('express');
const router = express.Router();
const boutiqueController = require('../controllers/boutique.controller');

// Créer une nouvelle boutique
router.post('/', boutiqueController.createBoutique);

// Obtenir toutes les boutiques
router.get('/', boutiqueController.getAllBoutiques);

// Obtenir une boutique par ID
router.get('/:id', boutiqueController.getBoutiqueById);

// Obtenir les boutiques d'un utilisateur spécifique
router.get('/user/:userId', boutiqueController.getBoutiquesByUserId);

// Mettre à jour une boutique
router.put('/:id', boutiqueController.updateBoutique);

// Supprimer une boutique
router.delete('/:id', boutiqueController.deleteBoutique);

module.exports = router;

