/**
 * Contrôleur d'authentification
 * Utilise Express pour gérer les requêtes/réponses
 * Délègue toute la logique métier au service auth.service.js
 */

const authService = require('../services/auth.service');

// Inscription (Register) avec support des rôles
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, telephone } = req.body;

    const result = await authService.register({
      email,
      password,
      name,
      role,
      telephone
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès!',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    const statusCode = error.message.includes('déjà utilisé') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Connexion (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: 'Connexion réussie!',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    const statusCode = error.message.includes('incorrect') || error.message.includes('suspendu') ? 
      (error.message.includes('suspendu') ? 403 : 401) : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user._id);
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// Mettre à jour le profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, avatar_url } = req.body;
    
    const user = await authService.updateProfile(req.user._id, {
      nom,
      prenom,
      telephone,
      avatar_url
    });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: user
    });
  } catch (error) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// Obtenir tous les utilisateurs (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Obtenir les utilisateurs par rôle
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await authService.getUsersByRole(role);
    res.json({
      success: true,
      count: users.length,
      role: role,
      users: users
    });
  } catch (error) {
    const statusCode = error.message.includes('invalide') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Activer/Désactiver un utilisateur (admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await authService.toggleUserStatus(req.params.id);
    res.json({
      success: true,
      message: `Utilisateur ${user.actif ? 'activé' : 'désactivé'} avec succès`,
      user: user
    });
  } catch (error) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors du changement de statut',
      error: error.message
    });
  }
};
