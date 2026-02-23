const mongoose = require('mongoose');

const favoriSchema = new mongoose.Schema({
  // Référence client
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type de favori
  type: {
    type: String,
    enum: ['produit', 'boutique'],
    required: true
  },
  produit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  },
  boutique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique'
  },
  
  // Notes personnelles
  note_personnelle: String,
  
  // Métadonnées
  date_creation: {
    type: Date,
    default: Date.now
  }
});

// Index
favoriSchema.index({ client_id: 1 });
favoriSchema.index({ produit_id: 1 });
favoriSchema.index({ boutique_id: 1 });
favoriSchema.index({ client_id: 1, type: 1, produit_id: 1, boutique_id: 1 }, { unique: true });

module.exports = mongoose.model('Favori', favoriSchema, 'favoris');

