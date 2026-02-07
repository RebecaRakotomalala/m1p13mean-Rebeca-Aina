const mongoose = require('mongoose');

const boutiqueSchema = new mongoose.Schema({
  // Référence utilisateur
  utilisateur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID utilisateur est requis']
  },
  
  // Informations générales
  nom: {
    type: String,
    required: [true, 'Le nom de la boutique est requis'],
    trim: true,
    maxlength: 200
  },
  description_courte: {
    type: String,
    maxlength: 500,
    trim: true
  },
  description_longue: {
    type: String,
    trim: true
  },
  logo_url: {
    type: String,
    maxlength: 500,
    trim: true
  },
  banniere_url: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Catégories
  categorie_principale: {
    type: String,
    required: [true, 'La catégorie principale est requise'],
    maxlength: 100,
    trim: true
  },
  categories_secondaires: {
    type: [String],
    default: []
  },
  
  // Coordonnées
  email_contact: {
    type: String,
    maxlength: 255,
    trim: true,
    lowercase: true
  },
  telephone_contact: {
    type: String,
    maxlength: 20,
    trim: true
  },
  
  // Réseaux sociaux
  facebook_url: {
    type: String,
    maxlength: 500,
    trim: true
  },
  instagram_url: {
    type: String,
    maxlength: 500,
    trim: true
  },
  twitter_url: {
    type: String,
    maxlength: 500,
    trim: true
  },
  tiktok_url: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Localisation dans le centre
  numero_emplacement: {
    type: String,
    maxlength: 50,
    trim: true
  },
  etage: {
    type: String,
    maxlength: 50,
    trim: true
  },
  zone: {
    type: String,
    maxlength: 100,
    trim: true
  },
  surface_m2: {
    type: Number,
    default: null
  },
  
  // Coordonnées GPS (pour plan interactif)
  position_x: {
    type: Number,
    default: null
  },
  position_y: {
    type: Number,
    default: null
  },
  
  // Horaires (JSON pour flexibilité)
  horaires: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Services proposés
  services: {
    type: [String],
    default: []
  },
  
  // Galerie photos
  galerie_photos: {
    type: [String],
    default: []
  },
  
  // Statistiques
  note_moyenne: {
    type: Number,
    default: 0.00,
    min: 0,
    max: 5
  },
  nombre_avis: {
    type: Number,
    default: 0,
    min: 0
  },
  nombre_vues: {
    type: Number,
    default: 0,
    min: 0
  },
  nombre_favoris: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Statut et validation
  statut: {
    type: String,
    enum: {
      values: ['en_attente', 'validee', 'active', 'suspendue', 'fermee'],
      message: 'Le statut doit être: en_attente, validee, active, suspendue ou fermee'
    },
    default: 'en_attente'
  },
  date_validation: {
    type: Date,
    default: null
  },
  validee_par: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Abonnement/Plan
  plan: {
    type: String,
    enum: {
      values: ['basique', 'premium', 'vip'],
      message: 'Le plan doit être: basique, premium ou vip'
    },
    default: 'basique'
  },
  date_debut_abonnement: {
    type: Date,
    default: null
  },
  date_fin_abonnement: {
    type: Date,
    default: null
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
  collection: 'boutiques'
});

// Index (correspondant au schéma SQL)
boutiqueSchema.index({ utilisateur_id: 1 });
boutiqueSchema.index({ slug: 1 }, { unique: true });
boutiqueSchema.index({ categorie_principale: 1 });
boutiqueSchema.index({ statut: 1 });
boutiqueSchema.index({ note_moyenne: -1 });

module.exports = mongoose.model('Boutique', boutiqueSchema, 'boutiques');

