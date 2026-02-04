const mongoose = require('mongoose');

const boutiqueSchema = new mongoose.Schema({
  // Référence utilisateur
  utilisateur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informations générales
  nom: {
    type: String,
    required: [true, 'Le nom de la boutique est requis'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 200
  },
  description_courte: {
    type: String,
    maxlength: 500
  },
  description_longue: String,
  logo_url: String,
  banniere_url: String,
  
  // Catégories
  categorie_principale: {
    type: String,
    required: true,
    maxlength: 100
  },
  categories_secondaires: [String], // Array de catégories
  
  // Coordonnées
  email_contact: String,
  telephone_contact: String,
  site_web: String,
  
  // Réseaux sociaux
  facebook_url: String,
  instagram_url: String,
  twitter_url: String,
  tiktok_url: String,
  
  // Localisation dans le centre
  numero_emplacement: String,
  etage: String,
  zone: String,
  surface_m2: Number,
  
  // Coordonnées GPS (pour plan interactif)
  position_x: Number,
  position_y: Number,
  
  // Horaires (JSON pour flexibilité)
  horaires: {
    type: Map,
    of: {
      ouverture: String,
      fermeture: String
    }
  },
  
  // Services proposés
  services: [String], // Array: ["livraison", "retrait", "click_and_collect", etc.]
  
  // Galerie photos
  galerie_photos: [String], // Array d'URLs
  
  // Statistiques
  note_moyenne: {
    type: Number,
    default: 0.00,
    min: 0,
    max: 5
  },
  nombre_avis: {
    type: Number,
    default: 0
  },
  nombre_vues: {
    type: Number,
    default: 0
  },
  nombre_favoris: {
    type: Number,
    default: 0
  },
  
  // Statut et validation
  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'active', 'suspendue', 'fermee'],
    default: 'en_attente'
  },
  date_validation: Date,
  validee_par: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Abonnement/Plan
  plan: {
    type: String,
    enum: ['basique', 'premium', 'vip'],
    default: 'basique'
  },
  date_debut_abonnement: Date,
  date_fin_abonnement: Date,
  
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
boutiqueSchema.index({ utilisateur_id: 1 });
boutiqueSchema.index({ slug: 1 });
boutiqueSchema.index({ categorie_principale: 1 });
boutiqueSchema.index({ statut: 1 });
boutiqueSchema.index({ note_moyenne: -1 });

module.exports = mongoose.model('Boutique', boutiqueSchema, 'boutiques');

