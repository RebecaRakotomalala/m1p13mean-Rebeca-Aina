const mongoose = require('mongoose');

const lignePanierSchema = new mongoose.Schema({
  // Références
  panier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Panier',
    required: true
  },
  produit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  
  // Variation choisie
  variation_selectionnee: {
    type: Map,
    of: String
  },
  
  // Quantité
  quantite: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  
  // Métadonnées
  date_creation: {
    type: Date,
    default: Date.now
  },
  date_modification: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'date_creation', updatedAt: 'date_modification' }
});

// Index
lignePanierSchema.index({ panier_id: 1 });
lignePanierSchema.index({ produit_id: 1 });

module.exports = mongoose.model('LignePanier', lignePanierSchema, 'lignes_paniers');

