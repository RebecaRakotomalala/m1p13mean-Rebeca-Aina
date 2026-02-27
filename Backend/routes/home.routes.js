const express = require('express');
const router = express.Router();
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const User = require('../models/User');
const Commande = require('../models/Commande');

// GET /api/home/stats - Statistiques publiques pour la page d'accueil
router.get('/stats', async (req, res) => {
  try {
    const [
      totalBoutiques,
      totalProduits,
      totalClients,
      totalCommandes,
      categories
    ] = await Promise.all([
      Boutique.countDocuments({ statut: 'active' }),
      Produit.countDocuments({ actif: true }),
      User.countDocuments({ role: 'client', actif: true }),
      Commande.countDocuments({ statut: { $in: ['livree', 'confirmee', 'en_preparation', 'prete', 'en_livraison'] } }),
      Boutique.distinct('categorie_principale', { statut: 'active' })
    ]);

    res.json({
      success: true,
      stats: {
        boutiques: totalBoutiques,
        produits: totalProduits,
        clients: totalClients,
        commandes: totalCommandes,
        categories: categories.length
      }
    });
  } catch (error) {
    console.error('[Home Stats] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

module.exports = router;
