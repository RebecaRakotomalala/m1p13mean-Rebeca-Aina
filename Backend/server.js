/**
 * Serveur Express.js
 * Utilise Express avec une architecture organisée (routes, controllers, middlewares)
 * 
 * Structure Express:
 * - routes/ : Définition des routes avec Express Router
 * - controllers/ : Logique métier (gestion des requêtes/réponses)
 * - middlewares/ : Middlewares Express personnalisés
 * - models/ : Modèles Mongoose
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Création de l'application Express
const app = express();

// ============================================================================
// MIDDLEWARES EXPRESS
// ============================================================================

// CORS - Permet les requêtes cross-origin
app.use(cors());

// Body Parser - Parse les données JSON et URL-encoded
// Augmenter la limite pour les uploads d'images en base64
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging (optionnel)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mall';

// ============================================================================
// CONNEXION MONGODB
// ============================================================================

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true
})
  .then(() => {
    console.log('✅ Connexion à MongoDB réussie!');
    console.log(`📊 Base de données: ${mongoose.connection.name}`);
  })
  .catch((error) => {
    console.error('⚠️  Erreur de connexion à MongoDB:', error.message);
    console.error('💡 Le serveur continue de fonctionner, mais MongoDB n\'est pas disponible.');
  });

// Gestion des événements de connexion MongoDB
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connecté avec succès!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB déconnecté');
});

// ============================================================================
// ROUTES EXPRESS
// Utilise Express Router pour organiser les routes
// ============================================================================

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Serveur Express.js fonctionne!',
    status: 'OK',
    framework: 'Express.js',
    version: '5.2.1',
    timestamp: new Date().toISOString(),
    endpoints: {
      test: '/api/test',
      auth: '/api/auth',
      boutiques: '/api/boutiques'
    }
  });
});

// Import des routes Express
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');
const boutiqueRoutes = require('./routes/boutique.routes');
const uploadRoutes = require('./routes/upload.routes');

// Utilisation des routes avec Express app.use()
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/boutiques', boutiqueRoutes);
app.use('/api/upload', uploadRoutes);

// ============================================================================
// GESTION DES ERREURS EXPRESS
// ============================================================================

// Middleware de gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.path
  });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur Express:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne du serveur'
  });
});

// ============================================================================
// DÉMARRAGE DU SERVEUR EXPRESS
// ============================================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVEUR EXPRESS.JS DÉMARRÉ');
  console.log('='.repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📊 Framework: Express.js v5.2.1`);
  console.log(`📦 Base de données: MongoDB (${mongoose.connection.name || 'non connecté'})`);
  console.log('\n📋 Endpoints disponibles:');
  console.log(`   GET  /                    - Page d'accueil`);
  console.log(`   GET  /api/test            - Routes de test`);
  console.log(`   GET  /api/test/mongodb   - Test MongoDB`);
  console.log(`   POST /api/auth/register  - Inscription`);
  console.log(`   POST /api/auth/login     - Connexion`);
  console.log(`   GET  /api/boutiques      - Liste des boutiques`);
  console.log('='.repeat(60) + '\n');
});
