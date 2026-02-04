const mongoose = require('mongoose');

const ligneCommandeSchema = new mongoose.Schema({
  // Références
  commande_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: true
  },
  boutique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  produit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  
  // Informations produit au moment de la commande
  nom_produit: String,
  reference_sku: String,
  image_produit: String,
  
  // Variation choisie
  variation_selectionnee: {
    type: Map,
    of: String
  },
  
  // Prix et quantité
  prix_unitaire: {
    type: Number,
    required: true,
    min: 0
  },
  quantite: {
    type: Number,
    required: true,
    min: 1
  },
  prix_total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Statut spécifique à cette ligne
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_preparation', 'prete', 'livree', 'annulee'],
    default: 'en_attente'
  },
  
  // Métadonnées
  date_creation: {
    type: Date,
    default: Date.now
  }
});

// Index
ligneCommandeSchema.index({ commande_id: 1 });
ligneCommandeSchema.index({ boutique_id: 1 });
ligneCommandeSchema.index({ produit_id: 1 });

module.exports = mongoose.model('LigneCommande', ligneCommandeSchema, 'lignes_commandes');

