const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Informations de base
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  mot_de_passe_hash: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    enum: ['admin', 'boutique', 'client'],
    required: true,
    default: 'client'
  },
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    trim: true
  },
  telephone: String,
  avatar_url: String,
  
  // Authentification
  email_verifie: {
    type: Boolean,
    default: false
  },
  telephone_verifie: {
    type: Boolean,
    default: false
  },
  auth_2fa_active: {
    type: Boolean,
    default: false
  },
  auth_2fa_secret: String,
  derniere_connexion: Date,
  
  // Réinitialisation mot de passe
  token_reset_mdp: String,
  token_reset_mdp_expire: Date,
  
  // Vérification email
  token_verification: String,
  token_verification_expire: Date,
  
  // OAuth
  google_id: String,
  facebook_id: String,
  apple_id: String,
  
  // Statut
  actif: {
    type: Boolean,
    default: true
  },
  date_suspension: Date,
  raison_suspension: String,
  
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
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ actif: 1 });

module.exports = mongoose.model('User', userSchema, 'utilisateurs');

