/**
 * Routes de test
 * Utilise Express Router pour organiser les routes
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Route de test pour vérifier que le serveur fonctionne
router.get('/', (req, res) => {
  res.json({
    message: '🚀 Serveur backend fonctionne!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Route de test pour vérifier la connexion MongoDB
router.get('/mongodb', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const states = {
      0: 'déconnecté',
      1: 'connecté',
      2: 'connexion en cours',
      3: 'déconnexion en cours'
    };

    res.json({
      message: 'Test de connexion MongoDB',
      status: dbStatus === 1 ? '✅ Connecté' : '❌ Non connecté',
      readyState: dbStatus,
      state: states[dbStatus] || 'inconnu',
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors du test MongoDB',
      error: error.message
    });
  }
});

// Route de test pour vérifier la connexion Frontend-Backend
router.get('/connection', (req, res) => {
  res.json({
    message: '✅ Connexion Frontend-Backend réussie!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Express.js',
    version: '5.2.1'
  });
});

// Route POST de test
router.post('/data', (req, res) => {
  res.json({
    message: '✅ Données reçues avec succès!',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
