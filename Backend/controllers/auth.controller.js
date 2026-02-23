/**
 * Contrôleur d'authentification
 * Utilise Express pour gérer les requêtes/réponses
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mallconnect_secret_key_2026';

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

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès!',
      token: token,
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

    // Vérifier le mot de passe avec bcrypt
    const isMatch = await bcrypt.compare(password, user.mot_de_passe_hash);
    if (!isMatch) {
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

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Connexion réussie
    res.json({
      success: true,
      message: 'Connexion réussie!',
      token: token,
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

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-mot_de_passe_hash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// Mettre à jour le profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, avatar_url } = req.body;
    
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (telephone) updateData.telephone = telephone;
    if (avatar_url) updateData.avatar_url = avatar_url;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-mot_de_passe_hash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// Obtenir tous les utilisateurs (admin)
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

// Activer/Désactiver un utilisateur (admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    user.actif = !user.actif;
    await user.save();

    res.json({
      success: true,
      message: `Utilisateur ${user.actif ? 'activé' : 'désactivé'} avec succès`,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        role: user.role,
        actif: user.actif
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
};