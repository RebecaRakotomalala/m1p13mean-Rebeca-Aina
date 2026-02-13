/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT et ajoute l'utilisateur à la requête
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'mallconnect_secret_key_2026';

// Vérifier le token JWT
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-mot_de_passe_hash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.actif) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été suspendu'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré, veuillez vous reconnecter'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Vérifier le rôle admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs'
    });
  }
  next();
};

// Vérifier le rôle boutique
exports.isBoutique = (req, res, next) => {
  if (req.user.role !== 'boutique') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux boutiques'
    });
  }
  next();
};

// Vérifier le rôle client
exports.isClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux clients'
    });
  }
  next();
};

// Vérifier boutique OU admin
exports.isBoutiqueOrAdmin = (req, res, next) => {
  if (req.user.role !== 'boutique' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux boutiques et administrateurs'
    });
  }
  next();
};
