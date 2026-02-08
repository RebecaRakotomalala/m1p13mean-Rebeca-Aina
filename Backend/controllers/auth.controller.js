/**
 * Contrôleur d'authentification
 * Utilise Express pour gérer les requêtes/réponses
 */

const User = require('../models/User');

// Inscription (Register) avec support des rôles
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, telephone } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (email, password, name)'
      });
    }

    // Valider le rôle si fourni
    const validRoles = ['admin', 'boutique', 'client'];
    const userRole = role && validRoles.includes(role) ? role : 'client';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      email: email.toLowerCase(),
      mot_de_passe_hash: password, // En production, utiliser bcrypt pour hasher
      nom: name,
      role: userRole,
      telephone: telephone || undefined
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès!',
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        telephone: user.telephone,
        createdAt: user.date_creation
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Connexion (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe (en production, utiliser bcrypt.compare)
    if (user.mot_de_passe_hash !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.actif) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été suspendu'
      });
    }

    // Connexion réussie
    res.json({
      success: true,
      message: 'Connexion réussie!',
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        telephone: user.telephone,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// Obtenir tous les utilisateurs (pour test)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-mot_de_passe_hash');
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Obtenir les utilisateurs par rôle
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['admin', 'boutique', 'client'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide. Rôles valides: admin, boutique, client'
      });
    }

    const users = await User.find({ role: role, actif: true }).select('-mot_de_passe_hash');
    res.json({
      success: true,
      count: users.length,
      role: role,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

