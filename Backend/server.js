require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// CONFIGURATION
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mall';

// CONNEXION MONGODB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true
})
  .then(() => {
    console.log('Connexion MongoDB reussie!');
    console.log('Base de donnees:', mongoose.connection.name);
  })
  .catch((error) => {
    console.error('Erreur connexion MongoDB:', error.message);
  });

mongoose.connection.on('error', (err) => {
  console.error('Erreur MongoDB:', err.message);
});

// ROUTE RACINE
app.get('/', (req, res) => {
  res.json({
    message: 'MallConnect API',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      boutiques: '/api/boutiques',
      produits: '/api/produits',
      panier: '/api/panier',
      commandes: '/api/commandes',
      avis: '/api/avis',
      favoris: '/api/favoris',
      admin: '/api/admin'
    }
  });
});

// ROUTES
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');
const boutiqueRoutes = require('./routes/boutique.routes');
const uploadRoutes = require('./routes/upload.routes');
const produitRoutes = require('./routes/produit.routes');
const panierRoutes = require('./routes/panier.routes');
const commandeRoutes = require('./routes/commande.routes');
const avisRoutes = require('./routes/avis.routes');
const favoriRoutes = require('./routes/favori.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/boutiques', boutiqueRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/favoris', favoriRoutes);
app.use('/api/admin', adminRoutes);

// GESTION ERREURS
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvee', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('Erreur Express:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

// DEMARRAGE
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('SERVEUR MALLCONNECT DEMARRE');
  console.log('='.repeat(60));
  console.log('Port:', PORT);
  console.log('URL: http://localhost:' + PORT);
  console.log('\nEndpoints:');
  console.log('  POST /api/auth/register    - Inscription');
  console.log('  POST /api/auth/login       - Connexion');
  console.log('  GET  /api/auth/profile     - Profil');
  console.log('  GET  /api/boutiques        - Boutiques');
  console.log('  GET  /api/produits         - Produits');
  console.log('  GET  /api/panier           - Panier');
  console.log('  GET  /api/commandes        - Commandes');
  console.log('  GET  /api/avis             - Avis');
  console.log('  GET  /api/favoris          - Favoris');
  console.log('  GET  /api/admin/dashboard  - Admin Dashboard');
  console.log('='.repeat(60) + '\n');
});
