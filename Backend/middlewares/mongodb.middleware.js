/**
 * Middleware Express pour vérifier la connexion MongoDB
 * Utilise Express middleware pattern
 */

const mongoose = require('mongoose');

exports.checkMongoConnection = (req, res, next) => {
  const dbStatus = mongoose.connection.readyState;
  
  if (dbStatus !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB n\'est pas connecté',
      readyState: dbStatus
    });
  }
  
  next();
};

