const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
  // Référence client
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type d'avis
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
  
  // Contenu de l'avis
  note: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  titre: String,
  commentaire: String,
  
  // Photos jointes
  photos: [String], // Array d'URLs
  
  // Informations achat
  achat_verifie: {
    type: Boolean,
    default: false
  },
  commande_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande'
  },
  
  // Utilité de l'avis
  nombre_utile: {
    type: Number,
    default: 0
  },
  nombre_non_utile: {
    type: Number,
    default: 0
  },
  
  // Réponse de la boutique
  reponse_boutique: String,
  date_reponse: Date,
  
  // Modération
  signale: {
    type: Boolean,
    default: false
  },
  nombre_signalements: {
    type: Number,
    default: 0
  },
  approuve: {
    type: Boolean,
    default: true
  },
  modere_par: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  raison_moderation: String,
  
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
avisSchema.index({ client_id: 1 });
avisSchema.index({ produit_id: 1 });
avisSchema.index({ boutique_id: 1 });
avisSchema.index({ note: 1 });
avisSchema.index({ date_creation: -1 });

module.exports = mongoose.model('Avis', avisSchema, 'avis');

