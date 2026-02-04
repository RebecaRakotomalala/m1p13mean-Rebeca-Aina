const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  // Référence boutique
  boutique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  
  // Informations produit
  nom: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  reference_sku: String,
  description_courte: {
    type: String,
    maxlength: 500
  },
  description_longue: String,
  
  // Catégorisation
  categorie: {
    type: String,
    required: true,
    maxlength: 100
  },
  sous_categorie: String,
  tags: [String], // Array de tags pour recherche
  
  // Prix
  prix_initial: {
    type: Number,
    required: true,
    min: 0
  },
  prix_promo: Number,
  pourcentage_reduction: Number,
  date_debut_promo: Date,
  date_fin_promo: Date,
  
  // Stock
  stock_quantite: {
    type: Number,
    default: 0,
    min: 0
  },
  stock_seuil_alerte: {
    type: Number,
    default: 5
  },
  stock_illimite: {
    type: Boolean,
    default: false
  },
  
  // Variations (tailles, couleurs, etc.)
  variations: [{
    nom: String,
    valeurs: [String]
  }],
  variants: [{
    sku: String,
    taille: String,
    couleur: String,
    prix: Number,
    stock: Number
  }],
  
  // Images
  image_principale: String,
  images_secondaires: [String], // Array d'URLs
  
  // Caractéristiques
  caracteristiques: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Dimension et poids (pour livraison)
  poids_kg: Number,
  longueur_cm: Number,
  largeur_cm: Number,
  hauteur_cm: Number,
  
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
  nombre_ventes: {
    type: Number,
    default: 0
  },
  nombre_favoris: {
    type: Number,
    default: 0
  },
  
  // SEO
  meta_titre: String,
  meta_description: String,
  
  // Statut
  actif: {
    type: Boolean,
    default: true
  },
  epuise: {
    type: Boolean,
    default: false
  },
  nouveau: {
    type: Boolean,
    default: true
  },
  coup_de_coeur: {
    type: Boolean,
    default: false
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
produitSchema.index({ boutique_id: 1 });
produitSchema.index({ slug: 1 });
produitSchema.index({ categorie: 1 });
produitSchema.index({ prix_initial: 1 });
produitSchema.index({ stock_quantite: 1 });
produitSchema.index({ actif: 1 });
produitSchema.index({ nom: 'text', description_courte: 'text', description_longue: 'text' });

module.exports = mongoose.model('Produit', produitSchema, 'produits');

