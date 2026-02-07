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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mall';

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

// Import des modèles
const User = require('./models/User');
const Boutique = require('./models/Boutique');

// Route d'inscription (Register) avec support des rôles
app.post('/api/auth/register', async (req, res) => {
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

// Route pour obtenir les utilisateurs par rôle
app.get('/api/auth/users/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['admin', 'boutique', 'client'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide. Rôles valides: admin, boutique, client'
      });
    }

    const users = await User.find({ role: role, actif: true }).select('-password');
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
});

// ============================================================================
// ROUTES API POUR LES BOUTIQUES
// ============================================================================

// Créer une nouvelle boutique
app.post('/api/boutiques', async (req, res) => {
  try {
    const boutiqueData = req.body;

    // Validation des champs requis
    if (!boutiqueData.utilisateur_id || !boutiqueData.nom || !boutiqueData.categorie_principale) {
      return res.status(400).json({
        success: false,
        message: 'Les champs requis sont: utilisateur_id, nom, categorie_principale'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(boutiqueData.utilisateur_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Générer un slug automatiquement si non fourni
    if (!boutiqueData.slug) {
      function generateSlug(nom) {
        return nom
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
          .replace(/[^a-z0-9]+/g, '-') // Remplacer les espaces par des tirets
          .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
      }

      let baseSlug = generateSlug(boutiqueData.nom);
      let slug = baseSlug;
      let counter = 1;

      // Vérifier l'unicité du slug
      while (await Boutique.findOne({ slug: slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      boutiqueData.slug = slug;
    } else {
      // Vérifier si le slug existe déjà
      const existingBoutique = await Boutique.findOne({ slug: boutiqueData.slug });
      if (existingBoutique) {
        return res.status(400).json({
          success: false,
          message: 'Ce slug est déjà utilisé'
        });
      }
    }

    // Créer la boutique
    const boutique = new Boutique(boutiqueData);
    await boutique.save();

    // Populate pour obtenir les détails de l'utilisateur
    await boutique.populate('utilisateur_id', 'email nom prenom role');

    res.status(201).json({
      success: true,
      message: 'Boutique créée avec succès!',
      boutique: boutique
    });
  } catch (error) {
    console.error('Erreur lors de la création de la boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la boutique',
      error: error.message
    });
  }
});

// Obtenir toutes les boutiques
app.get('/api/boutiques', async (req, res) => {
  try {
    const { statut, categorie, search } = req.query;
    let query = {};

    // Filtres optionnels
    if (statut) {
      query.statut = statut;
    }
    if (categorie) {
      query.categorie_principale = categorie;
    }
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description_courte: { $regex: search, $options: 'i' } }
      ];
    }

    const boutiques = await Boutique.find(query)
      .populate('utilisateur_id', 'email nom prenom role')
      .populate('validee_par', 'email nom')
      .sort({ date_creation: -1 });

    res.json({
      success: true,
      count: boutiques.length,
      boutiques: boutiques
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des boutiques',
      error: error.message
    });
  }
});

// Obtenir une boutique par ID
app.get('/api/boutiques/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('utilisateur_id', 'email nom prenom role')
      .populate('validee_par', 'email nom');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    res.json({
      success: true,
      boutique: boutique
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la boutique',
      error: error.message
    });
  }
});

// Obtenir les boutiques d'un utilisateur
app.get('/api/boutiques/user/:userId', async (req, res) => {
  try {
    const boutiques = await Boutique.find({ utilisateur_id: req.params.userId })
      .populate('utilisateur_id', 'email nom prenom role')
      .sort({ date_creation: -1 });

    res.json({
      success: true,
      count: boutiques.length,
      boutiques: boutiques
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des boutiques',
      error: error.message
    });
  }
});

// Mettre à jour une boutique
app.put('/api/boutiques/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      { ...req.body, date_modification: new Date() },
      { new: true, runValidators: true }
    )
      .populate('utilisateur_id', 'email nom prenom role')
      .populate('validee_par', 'email nom');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Boutique mise à jour avec succès!',
      boutique: boutique
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la boutique',
      error: error.message
    });
  }
});

// Supprimer une boutique
app.delete('/api/boutiques/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndDelete(req.params.id);

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Boutique supprimée avec succès!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la boutique',
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

