const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'boutique', 'client'],
    default: 'client',
    required: true
  },
  // Informations supplémentaires selon le rôle
  telephone: String,
  avatar_url: String,
  actif: {
    type: Boolean,
    default: true
  },
  // Pour les boutiques
  boutique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);

