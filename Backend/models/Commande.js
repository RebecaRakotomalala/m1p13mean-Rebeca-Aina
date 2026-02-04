const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  // Numéro de commande unique
  numero_commande: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50
  },
  
  // Référence client
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informations client
  client_nom: String,
  client_email: String,
  client_telephone: String,
  
  // Adresses
  adresse_livraison: {
    rue: String,
    code_postal: String,
    ville: String,
    pays: String,
    complement: String
  },
  adresse_facturation: {
    rue: String,
    code_postal: String,
    ville: String,
    pays: String,
    complement: String
  },
  
  // Détails commande
  sous_total: {
    type: Number,
    required: true,
    min: 0
  },
  frais_livraison: {
    type: Number,
    default: 0.00,
    min: 0
  },
  taxes: {
    type: Number,
    default: 0.00,
    min: 0
  },
  reduction_code_promo: {
    type: Number,
    default: 0.00,
    min: 0
  },
  reduction_points: {
    type: Number,
    default: 0.00,
    min: 0
  },
  montant_total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Code promo
  code_promo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodePromo'
  },
  code_promo_code: String,
  
  // Points fidélité
  points_utilises: {
    type: Number,
    default: 0
  },
  points_gagnes: {
    type: Number,
    default: 0
  },
  
  // Paiement
  methode_paiement: {
    type: String,
    enum: ['carte_credit', 'paypal', 'wallet', 'especes', 'paiement_fractionne']
  },
  statut_paiement: {
    type: String,
    enum: ['en_attente', 'paye', 'echoue', 'rembourse'],
    default: 'en_attente'
  },
  transaction_id: String,
  date_paiement: Date,
  
  // Mode de livraison
  mode_livraison: {
    type: String,
    enum: ['retrait_boutique', 'livraison_domicile', 'consigne_automatique']
  },
  
  // Statut global
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_preparation', 'prete', 'en_livraison', 'livree', 'annulee', 'remboursee'],
    default: 'en_attente'
  },
  
  // Notes
  note_client: String,
  note_interne: String,
  
  // Suivi
  date_confirmation: Date,
  date_preparation: Date,
  date_prete: Date,
  date_livraison: Date,
  date_annulation: Date,
  raison_annulation: String,
  
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
commandeSchema.index({ client_id: 1 });
commandeSchema.index({ numero_commande: 1 });
commandeSchema.index({ statut: 1 });
commandeSchema.index({ date_creation: -1 });

module.exports = mongoose.model('Commande', commandeSchema, 'commandes');

