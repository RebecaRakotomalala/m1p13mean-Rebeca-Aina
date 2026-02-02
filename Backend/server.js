require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Variables d'environnement
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

// Connexion à MongoDB avec gestion d'erreur non-bloquante
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout après 5 secondes
  retryWrites: true
})
  .then(() => {
    console.log('✅ Connexion à MongoDB réussie!');
    console.log(`📊 Base de données: ${mongoose.connection.name}`);
  })
  .catch((error) => {
    console.error('⚠️  Erreur de connexion à MongoDB:', error.message);
    console.error('💡 Le serveur continue de fonctionner, mais MongoDB n\'est pas disponible.');
    console.error('💡 Pour tester MongoDB:');
    console.error('   1. Démarrer MongoDB: sudo systemctl start mongod');
    console.error('   2. Ou utiliser MongoDB Atlas et mettre à jour MONGODB_URI dans .env');
    console.error('   3. Le serveur tentera de se reconnecter automatiquement');
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

// Route de test pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Serveur backend fonctionne!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Route de test pour vérifier la connexion MongoDB
app.get('/api/test/mongodb', async (req, res) => {
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
app.get('/api/test/connection', (req, res) => {
  res.json({
    message: '✅ Connexion Frontend-Backend réussie!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Express.js',
    version: '5.2.1'
  });
});

// Route POST de test
app.post('/api/test/data', (req, res) => {
  res.json({
    message: '✅ Données reçues avec succès!',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Import du modèle User
const User = require('./models/User');

// Route d'inscription (Register)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (email, password, name)'
      });
    }

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
      password: password, // En production, utiliser bcrypt pour hasher
      name: name
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès!',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
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
});

// Route de connexion (Login)
app.post('/api/auth/login', async (req, res) => {
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
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Connexion réussie
    res.json({
      success: true,
      message: 'Connexion réussie!',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
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
});

// Route pour obtenir tous les utilisateurs (pour test)
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
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
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({
    message: 'Erreur serveur',
    error: err.message
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔗 Test MongoDB: http://localhost:${PORT}/api/test/mongodb`);
  console.log(`🔗 Test Connection: http://localhost:${PORT}/api/test/connection`);
});

