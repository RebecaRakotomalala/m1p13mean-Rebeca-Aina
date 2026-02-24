const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
  // Informations de base
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['promotion', 'animation', 'soldes', 'ouverture', 'special', 'autre'],
    default: 'promotion'
  },
  
  // Dates
  date_debut: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  date_fin: {
    type: Date,
    required: [true, 'La date de fin est requise']
  },
  
  // Image/Bannière
  image_url: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Boutiques participantes
  boutiques_participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique'
  }],
  capacite_max: {
    type: Number,
    default: null
  },
  
  // Lieu
  lieu: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Statut
  statut: {
    type: String,
    enum: ['brouillon', 'publie', 'en_cours', 'termine', 'annule'],
    default: 'brouillon'
  },
  
  // Créateur
  cree_par: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Statistiques
  nombre_participants: {
    type: Number,
    default: 0
  },
  nombre_vues: {
    type: Number,
    default: 0
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
  timestamps: { createdAt: 'date_creation', updatedAt: 'date_modification' },
  collection: 'evenements'
});

// Index
evenementSchema.index({ date_debut: 1 });
evenementSchema.index({ date_fin: 1 });
evenementSchema.index({ statut: 1 });
evenementSchema.index({ type: 1 });

module.exports = mongoose.model('Evenement', evenementSchema, 'evenements');
