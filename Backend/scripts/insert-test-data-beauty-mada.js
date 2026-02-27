/**
 * Script pour insérer des produits et commandes de test pour "Beauty Mada"
 * 
 * Usage: node scripts/insert-test-data-beauty-mada.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');
const LigneCommande = require('../models/LigneCommande');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mall';

// IDs de référence
const BOUTIQUE_USER_ID = '69a07d512b32fffa626a6d49'; // utilisateur_id de Beauty Mada
const BOUTIQUE_ID = '69a07d522b32fffa626a6d5b'; // _id de Beauty Mada

// Fonction pour générer un slug à partir du nom
function generateSlug(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les espaces et caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
}

// Fonction pour générer un numéro de commande unique
function generateNumeroCommande() {
  const prefix = 'CMD';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Produits de test pour Beauty Mada
const produitsData = [
  {
    nom: 'Crème Hydratante Visage Bio',
    description_courte: 'Crème hydratante naturelle pour tous types de peaux',
    description_longue: 'Crème hydratante enrichie en aloe vera et huile d\'argan. Parfaite pour hydrater et nourrir votre peau en profondeur. Convient à tous types de peaux, même sensibles.',
    categorie: 'Soins visage',
    sous_categorie: 'Hydratation',
    tags: ['bio', 'naturel', 'hydratant', 'visage'],
    prix_initial: 45000,
    prix_promo: 38000,
    pourcentage_reduction: 15,
    stock_quantite: 25,
    stock_seuil_alerte: 5,
    image_principale: 'https://res.cloudinary.com/ddsocampb/image/upload/v1700000000/boutiques/produits/creme-hydratante.jpg',
    images_secondaires: [
      'https://res.cloudinary.com/ddsocampb/image/upload/v1700000001/boutiques/produits/creme-hydratante-2.jpg',
      'https://res.cloudinary.com/ddsocampb/image/upload/v1700000002/boutiques/produits/creme-hydratante-3.jpg'
    ],
    poids_kg: 0.15,
    actif: true,
    nouveau: true,
    coup_de_coeur: true
  },
  {
    nom: 'Rouge à Lèvres Matte Longue Tenue',
    description_courte: 'Rouge à lèvres matte avec tenue jusqu\'à 12h',
    description_longue: 'Rouge à lèvres matte haute qualité avec formule longue tenue. Ne sèche pas les lèvres et résiste aux repas. Disponible en 12 teintes tendance.',
    categorie: 'Maquillage',
    sous_categorie: 'Lèvres',
    tags: ['matte', 'longue-tenue', 'rouge-levres', 'maquillage'],
    prix_initial: 25000,
    prix_promo: null,
    stock_quantite: 50,
    stock_seuil_alerte: 10,
    image_principale: 'https://res.cloudinary.com/ddsocampb/image/upload/v1700000003/boutiques/produits/rouge-levres.jpg',
    images_secondaires: [],
    poids_kg: 0.05,
    actif: true,
    nouveau: false,
    coup_de_coeur: false
  },
  {
    nom: 'Parfum Femme Élégance',
    description_courte: 'Parfum floral et élégant pour femme',
    description_longue: 'Parfum féminin aux notes florales et fruitées. Une fragrance élégante et raffinée qui dure toute la journée. Flacon de 50ml.',
    categorie: 'Parfums',
    sous_categorie: 'Femme',
    tags: ['parfum', 'femme', 'floral', 'elegant'],
    prix_initial: 85000,
    prix_promo: 72000,
    pourcentage_reduction: 15,
    stock_quantite: 15,
    stock_seuil_alerte: 3,
    image_principale: 'https://res.cloudinary.com/ddsocampb/image/upload/v1700000004/boutiques/produits/parfum-femme.jpg',
    images_secondaires: [],
    poids_kg: 0.3,
    actif: true,
    nouveau: true,
    coup_de_coeur: false
  },
  {
    nom: 'Shampooing Réparateur Cheveux Abîmés',
    description_courte: 'Shampooing réparateur pour cheveux abîmés et colorés',
    description_longue: 'Shampooing enrichi en kératine et huiles essentielles pour réparer et nourrir les cheveux abîmés. Idéal pour cheveux colorés et traités.',
    categorie: 'Soins cheveux',
    sous_categorie: 'Réparation',
    tags: ['shampooing', 'reparateur', 'cheveux', 'keratine'],
    prix_initial: 18000,
    prix_promo: null,
    stock_quantite: 40,
    stock_seuil_alerte: 8,
    image_principale: 'https://res.cloudinary.com/ddsocampb/image/upload/v1700000005/boutiques/produits/shampooing.jpg',
    images_secondaires: [],
    poids_kg: 0.4,
    actif: true,
    nouveau: false,
    coup_de_coeur: false
  },
  {
    nom: 'Masque Visage Purifiant Argile',
    description_courte: 'Masque purifiant à l\'argile verte pour peaux mixtes à grasses',
    description_longue: 'Masque purifiant à l\'argile verte qui nettoie en profondeur et resserre les pores. Idéal pour les peaux mixtes à grasses. Application 1 à 2 fois par semaine.',
    categorie: 'Soins visage',
    sous_categorie: 'Masques',
    tags: ['masque', 'argile', 'purifiant', 'peau-grasse'],
    prix_initial: 22000,
    prix_promo: 19000,
    pourcentage_reduction: 13,
    stock_quantite: 30,
    stock_seuil_alerte: 6,
    image_principale: 'https://res.cloudinary.com/ddsocampb/image/upload/v1700000006/boutiques/produits/masque-argile.jpg',
    images_secondaires: [],
    poids_kg: 0.2,
    actif: true,
    nouveau: true,
    coup_de_coeur: true
  },
  {
    nom: 'Mascara Volume Intense',
    description_courte: 'Mascara volume intense et waterproof',
    description_longue: 'Mascara qui apporte volume et longueur aux cils. Formule waterproof qui résiste à l\'eau et à la transpiration. Brosses courbées pour un effet recourbé naturel.',
    categorie: 'Maquillage',
    sous_categorie: 'Yeux',
    tags: ['mascara', 'volume', 'waterproof', 'yeux'],
    prix_initial: 28000,
    prix_promo: null,
    stock_quantite: 35,
    stock_seuil_alerte: 7,
    image_principale: 'https://res.cloudinary.com/ddsocampb/image/upload/v1700000007/boutiques/produits/mascara.jpg',
    images_secondaires: [],
    poids_kg: 0.08,
    actif: true,
    nouveau: false,
    coup_de_coeur: false
  },
  {
    nom: 'Huile de Soin Corps Nourrissante',
    description_courte: 'Huile de soin corps bio à l\'argan et coco',
    description_longue: 'Huile de soin corps enrichie en huile d\'argan et de coco. Nourrit et hydrate la peau en profondeur. Texture légère qui pénètre rapidement sans laisser de film gras.',
    categorie: 'Soins corps',
    sous_categorie: 'Hydratation',
    tags: ['huile', 'corps', 'bio', 'argan', 'coco'],
    prix_initial: 32000,
    prix_promo: 27000,
    pourcentage_reduction: 15,
    stock_quantite: 20,
    stock_seuil_alerte: 4,
    image_principale: 'https://res.cloudinary.com/ddsocampb/image/upload/v1700000008/boutiques/produits/huile-corps.jpg',
    images_secondaires: [],
    poids_kg: 0.25,
    actif: true,
    nouveau: true,
    coup_de_coeur: false
  },
  {
    nom: 'Palette Fard à Paupières Nude',
    description_courte: 'Palette de 12 fards à paupières tons nus et naturels',
    description_longue: 'Palette complète de 12 fards à paupières dans des tons nus et naturels. Pigmentation intense et texture soyeuse. Parfaite pour créer des looks du quotidien ou plus sophistiqués.',
    categorie: 'Maquillage',
    sous_categorie: 'Yeux',
    tags: ['palette', 'fard-paupieres', 'nude', 'yeux'],
    prix_initial: 55000,
    prix_promo: 45000,
    pourcentage_reduction: 18,
    stock_quantite: 12,
    stock_seuil_alerte: 3,
    image_principale: 'https://res.cloudinary.com/ddsocampb/image/upload/v1700000009/boutiques/produits/palette-fard.jpg',
    images_secondaires: [],
    poids_kg: 0.15,
    actif: true,
    nouveau: false,
    coup_de_coeur: true
  }
];

async function insertTestData() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier que la boutique existe
    const boutique = await Boutique.findById(BOUTIQUE_ID);
    if (!boutique) {
      console.error('❌ Boutique non trouvée avec l\'ID:', BOUTIQUE_ID);
      await mongoose.connection.close();
      return;
    }
    console.log(`✅ Boutique trouvée: ${boutique.nom}`);

    // Créer ou récupérer un client de test
    let client = await User.findOne({ email: 'client.test@example.com' });
    if (!client) {
      client = new User({
        email: 'client.test@example.com',
        mot_de_passe_hash: '$2b$10$dummyhash', // Hash factice pour les tests
        role: 'client',
        nom: 'Test',
        prenom: 'Client',
        telephone: '+261340000001'
      });
      await client.save();
      console.log('✅ Client de test créé');
    } else {
      console.log('✅ Client de test existant trouvé');
    }

    // Supprimer les anciens produits et commandes de test (optionnel)
    const deleteOld = process.argv.includes('--clean');
    if (deleteOld) {
      console.log('🧹 Nettoyage des anciennes données de test...');
      await Produit.deleteMany({ boutique_id: BOUTIQUE_ID });
      await Commande.deleteMany({ client_id: client._id });
      console.log('✅ Anciennes données supprimées');
    }

    // Insérer les produits
    console.log('\n📦 Insertion des produits...');
    const produitsInsérés = [];
    for (const produitData of produitsData) {
      const slug = generateSlug(produitData.nom);
      const referenceSku = `BM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Vérifier si le slug existe déjà
      let finalSlug = slug;
      let counter = 1;
      while (await Produit.findOne({ slug: finalSlug, boutique_id: BOUTIQUE_ID })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      const produit = new Produit({
        boutique_id: BOUTIQUE_ID,
        nom: produitData.nom,
        slug: finalSlug,
        reference_sku: referenceSku,
        description_courte: produitData.description_courte,
        description_longue: produitData.description_longue,
        categorie: produitData.categorie,
        sous_categorie: produitData.sous_categorie,
        tags: produitData.tags,
        prix_initial: produitData.prix_initial,
        prix_promo: produitData.prix_promo,
        pourcentage_reduction: produitData.pourcentage_reduction,
        stock_quantite: produitData.stock_quantite,
        stock_seuil_alerte: produitData.stock_seuil_alerte,
        image_principale: produitData.image_principale,
        images_secondaires: produitData.images_secondaires,
        poids_kg: produitData.poids_kg,
        actif: produitData.actif,
        nouveau: produitData.nouveau,
        coup_de_coeur: produitData.coup_de_coeur,
        note_moyenne: (Math.random() * 1.5 + 3.5).toFixed(1), // Note entre 3.5 et 5.0
        nombre_avis: Math.floor(Math.random() * 30) + 5,
        nombre_vues: Math.floor(Math.random() * 200) + 50,
        nombre_ventes: Math.floor(Math.random() * 20),
        nombre_favoris: Math.floor(Math.random() * 10)
      });

      await produit.save();
      produitsInsérés.push(produit);
      console.log(`   ✅ ${produit.nom} (${produit.slug})`);
    }
    console.log(`✅ ${produitsInsérés.length} produits insérés\n`);

    // Créer des commandes de test
    console.log('🛒 Création des commandes de test...');
    const statuts = ['en_attente', 'confirmee', 'en_preparation', 'prete', 'en_livraison', 'livree'];
    const methodesPaiement = ['carte_credit', 'paypal', 'wallet', 'especes'];
    
    const commandes = [];
    for (let i = 0; i < 15; i++) {
      // Sélectionner 1 à 4 produits aléatoires
      const nbProduits = Math.floor(Math.random() * 4) + 1;
      const produitsSelectionnes = [];
      for (let j = 0; j < nbProduits; j++) {
        const produit = produitsInsérés[Math.floor(Math.random() * produitsInsérés.length)];
        if (!produitsSelectionnes.find(p => p._id.toString() === produit._id.toString())) {
          produitsSelectionnes.push(produit);
        }
      }

      // Calculer les totaux
      let sousTotal = 0;
      const lignes = [];
      for (const produit of produitsSelectionnes) {
        const quantite = Math.floor(Math.random() * 3) + 1;
        const prixUnitaire = produit.prix_promo || produit.prix_initial;
        const prixTotal = prixUnitaire * quantite;
        sousTotal += prixTotal;

        lignes.push({
          produit,
          quantite,
          prixUnitaire,
          prixTotal
        });
      }

      const fraisLivraison = sousTotal > 100000 ? 0 : 5000;
      const montantTotal = sousTotal + fraisLivraison;
      const statut = statuts[Math.floor(Math.random() * statuts.length)];
      const methodePaiement = methodesPaiement[Math.floor(Math.random() * methodesPaiement.length)];
      const statutPaiement = statut === 'livree' ? 'paye' : (statut === 'en_attente' ? 'en_attente' : 'paye');

      // Date de création aléatoire dans les 30 derniers jours
      const joursAgo = Math.floor(Math.random() * 30);
      const dateCreation = new Date();
      dateCreation.setDate(dateCreation.getDate() - joursAgo);

      const commande = new Commande({
        numero_commande: generateNumeroCommande(),
        client_id: client._id,
        client_nom: `${client.prenom} ${client.nom}`,
        client_email: client.email,
        client_telephone: client.telephone,
        adresse_livraison: {
          rue: `${Math.floor(Math.random() * 100) + 1} Rue de l'Indépendance`,
          code_postal: '101',
          ville: 'Antananarivo',
          pays: 'Madagascar'
        },
        adresse_facturation: {
          rue: `${Math.floor(Math.random() * 100) + 1} Rue de l'Indépendance`,
          code_postal: '101',
          ville: 'Antananarivo',
          pays: 'Madagascar'
        },
        sous_total: sousTotal,
        frais_livraison: fraisLivraison,
        taxes: 0,
        montant_total: montantTotal,
        methode_paiement: methodePaiement,
        statut_paiement: statutPaiement,
        mode_livraison: 'livraison_domicile',
        statut: statut,
        date_creation: dateCreation,
        date_modification: dateCreation
      });

      if (statutPaiement === 'paye') {
        commande.date_paiement = new Date(dateCreation.getTime() + Math.random() * 3600000); // Dans l'heure suivant la commande
      }

      if (statut === 'confirmee' || statut === 'en_preparation' || statut === 'prete' || statut === 'en_livraison' || statut === 'livree') {
        commande.date_confirmation = new Date(dateCreation.getTime() + Math.random() * 7200000); // Dans les 2h suivant la commande
      }

      if (statut === 'en_preparation' || statut === 'prete' || statut === 'en_livraison' || statut === 'livree') {
        commande.date_preparation = new Date(dateCreation.getTime() + Math.random() * 14400000); // Dans les 4h suivant la commande
      }

      if (statut === 'prete' || statut === 'en_livraison' || statut === 'livree') {
        commande.date_prete = new Date(dateCreation.getTime() + Math.random() * 21600000); // Dans les 6h suivant la commande
      }

      if (statut === 'en_livraison' || statut === 'livree') {
        commande.date_livraison = new Date(dateCreation.getTime() + Math.random() * 28800000); // Dans les 8h suivant la commande
      }

      await commande.save();
      commandes.push(commande);

      // Créer les lignes de commande
      for (const ligne of lignes) {
        const ligneCommande = new LigneCommande({
          commande_id: commande._id,
          boutique_id: BOUTIQUE_ID,
          produit_id: ligne.produit._id,
          nom_produit: ligne.produit.nom,
          reference_sku: ligne.produit.reference_sku,
          image_produit: ligne.produit.image_principale,
          prix_unitaire: ligne.prixUnitaire,
          quantite: ligne.quantite,
          prix_total: ligne.prixTotal,
          statut: statut === 'livree' ? 'livree' : (statut === 'en_attente' ? 'en_attente' : 'confirmee')
        });
        await ligneCommande.save();
      }

      console.log(`   ✅ Commande ${commande.numero_commande} - ${statut} - ${montantTotal.toLocaleString()} Ar`);
    }

    console.log(`\n✅ ${commandes.length} commandes créées avec leurs lignes`);
    console.log('\n📊 Résumé:');
    console.log(`   - Produits: ${produitsInsérés.length}`);
    console.log(`   - Commandes: ${commandes.length}`);
    console.log(`   - Lignes de commande: ${commandes.reduce((sum, c) => sum + (c.statut === 'livree' ? 1 : 0), 0)} livrées`);
    
    // Statistiques par statut
    const statsParStatut = {};
    commandes.forEach(c => {
      statsParStatut[c.statut] = (statsParStatut[c.statut] || 0) + 1;
    });
    console.log('\n📈 Commandes par statut:');
    Object.entries(statsParStatut).forEach(([statut, count]) => {
      console.log(`   - ${statut}: ${count}`);
    });

    console.log('\n✅ Données de test insérées avec succès!');
    await mongoose.connection.close();
    console.log('✅ Déconnexion de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Exécuter le script
insertTestData();

