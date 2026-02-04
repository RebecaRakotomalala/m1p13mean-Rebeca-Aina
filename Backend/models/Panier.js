const mongoose = require('mongoose');

const panierSchema = new mongoose.Schema({
  // Référence client (peut être null pour utilisateurs non connectés)
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  session_id: String, // Pour les utilisateurs non connectés
  
  // Statut
  statut: {
    type: String,
    enum: ['actif', 'abandonne', 'converti'],
    default: 'actif'
  },
  
  // Métadonnées
  date_creation: {
    type: Date,
    default: Date.now
  },
  date_modification: {
    type: Date,
    default: Date.now
  },
  date_abandon: Date,
  date_conversion: Date
}, {
  timestamps: { createdAt: 'date_creation', updatedAt: 'date_modification' }
});

// Index
panierSchema.index({ client_id: 1 });
panierSchema.index({ session_id: 1 });
panierSchema.index({ statut: 1 });

module.exports = mongoose.model('Panier', panierSchema, 'paniers');

