/**
 * Service d'authentification
 * Contient toute la logique métier pour l'authentification des utilisateurs
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mallconnect_secret_key_2026';

/**
 * Inscription d'un nouvel utilisateur
 * @param {Object} userData - Données de l'utilisateur (email, password, name, role, telephone)
 * @returns {Promise<Object>} - Utilisateur créé et token JWT
 */
async function register(userData) {
  const { email, password, name, role, telephone } = userData;

  // Validation
  if (!email || !password || !name) {
    throw new Error('Tous les champs sont requis (email, password, name)');
  }

  // Valider le rôle si fourni
  const validRoles = ['admin', 'boutique', 'client'];
  const userRole = role && validRoles.includes(role) ? role : 'client';

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }

  // Hasher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Créer un nouvel utilisateur
  const user = new User({
    email: email.toLowerCase(),
    mot_de_passe_hash: hashedPassword,
    nom: name,
    role: userRole,
    telephone: telephone || undefined
  });

  await user.save();

  // Générer le token JWT
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      telephone: user.telephone,
      createdAt: user.date_creation
    }
  };
}

/**
 * Connexion d'un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {Promise<Object>} - Utilisateur et token JWT
 */
async function login(email, password) {
  // Validation
  if (!email || !password) {
    throw new Error('Email et mot de passe sont requis');
  }

  // Trouver l'utilisateur
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Vérifier le mot de passe avec bcrypt
  const isMatch = await bcrypt.compare(password, user.mot_de_passe_hash);
  if (!isMatch) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Vérifier si l'utilisateur est actif
  if (!user.actif) {
    throw new Error('Votre compte a été suspendu');
  }

  // Générer le token JWT
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      telephone: user.telephone,
      avatar_url: user.avatar_url
    }
  };
}

/**
 * Obtenir le profil d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Données de l'utilisateur
 */
async function getProfile(userId) {
  const user = await User.findById(userId).select('-mot_de_passe_hash');
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  return user;
}

/**
 * Mettre à jour le profil d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour (nom, prenom, telephone, avatar_url)
 * @returns {Promise<Object>} - Utilisateur mis à jour
 */
async function updateProfile(userId, updateData) {
  const { nom, prenom, telephone, avatar_url } = updateData;
  
  const dataToUpdate = {};
  if (nom) dataToUpdate.nom = nom;
  if (prenom) dataToUpdate.prenom = prenom;
  if (telephone) dataToUpdate.telephone = telephone;
  if (avatar_url) dataToUpdate.avatar_url = avatar_url;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: dataToUpdate },
    { new: true }
  ).select('-mot_de_passe_hash');

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  return user;
}

/**
 * Obtenir tous les utilisateurs
 * @returns {Promise<Array>} - Liste de tous les utilisateurs
 */
async function getAllUsers() {
  const users = await User.find().select('-mot_de_passe_hash');
  return users;
}

/**
 * Obtenir les utilisateurs par rôle
 * @param {string} role - Rôle à filtrer (admin, boutique, client)
 * @returns {Promise<Array>} - Liste des utilisateurs avec ce rôle
 */
async function getUsersByRole(role) {
  const validRoles = ['admin', 'boutique', 'client'];
  
  if (!validRoles.includes(role)) {
    throw new Error('Rôle invalide. Rôles valides: admin, boutique, client');
  }

  const users = await User.find({ role: role, actif: true }).select('-mot_de_passe_hash');
  return users;
}

/**
 * Activer/Désactiver un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Utilisateur mis à jour
 */
async function toggleUserStatus(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  user.actif = !user.actif;
  await user.save();

  return {
    id: user._id,
    email: user.email,
    nom: user.nom,
    role: user.role,
    actif: user.actif
  };
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  getUsersByRole,
  toggleUserStatus
};

