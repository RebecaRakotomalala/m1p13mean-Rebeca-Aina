/**
 * Script pour insérer la boutique "Fanelie Boutique" dans MongoDB
 * 
 * Usage: node scripts/insert-fanelie-boutique.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Boutique = require('../models/Boutique');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mall';

// Fonction pour générer un slug à partir du nom
function generateSlug(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les espaces et caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
}

async function insertFanelieBoutique() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // ID de l'utilisateur (à remplacer par votre ID réel)
    const utilisateurId = '69838220b0789e50b2703ce5';

    // Vérifier si la boutique existe déjà
    const existingBoutique = await Boutique.findOne({ 
      nom: 'Fanelie Boutique',
      utilisateur_id: utilisateurId 
    });

    if (existingBoutique) {
      console.log('⚠️  La boutique "Fanelie Boutique" existe déjà!');
      console.log('   ID:', existingBoutique._id);
      console.log('   Slug:', existingBoutique.slug);
      
      // Demander si on veut la mettre à jour
      console.log('\n💡 Pour mettre à jour, supprimez-la d\'abord ou modifiez le script.');
      return;
    }

    // Générer un slug unique
    const baseSlug = generateSlug('Fanelie Boutique');
    let slug = baseSlug;
    let counter = 1;
    
    // Vérifier l'unicité du slug
    while (await Boutique.findOne({ slug: slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log('📝 Création de la boutique "Fanelie Boutique"...');

    // Corriger les URLs de galerie_photos (il y avait une erreur de syntaxe)
    const galerie_photos = [
      'https://res.cloudinary.com/ddsocampb/image/upload/v1770485789/Aina3_mcpveo.jpg',
      'https://res.cloudinary.com/ddsocampb/image/upload/v1770485789/Aina2_etrnpc.jpg',
      'https://res.cloudinary.com/ddsocampb/image/upload/v1770485789/Aina1_lza4az.jpg',
      'https://res.cloudinary.com/ddsocampb/image/upload/v1770485789/Aina4_ivfxsj.jpg'
    ];

    // Créer la boutique
    const boutique = new Boutique({
      utilisateur_id: utilisateurId,
      nom: 'Fanelie Boutique',
      slug: slug,
      categorie_principale: 'Mode',
      categories_secondaires: ['Vêtements', 'Accessoires'],
      email_contact: 'contact@ainaboutique.com',
      telephone_contact: '0340000000',
      services: ['livraison'],
      galerie_photos: galerie_photos,
      statut: 'active',
      plan: 'premium',
      date_creation: new Date(),
      date_modification: new Date()
    });

    await boutique.save();

    console.log('✅ Boutique créée avec succès!');
    console.log('\n📊 Détails de la boutique:');
    console.log('   - ID:', boutique._id);
    console.log('   - Nom:', boutique.nom);
    console.log('   - Slug:', boutique.slug);
    console.log('   - Catégorie:', boutique.categorie_principale);
    console.log('   - Statut:', boutique.statut);
    console.log('   - Plan:', boutique.plan);
    console.log('   - Nombre de photos:', boutique.galerie_photos.length);
    console.log('\n🖼️  Photos Cloudinary:');
    boutique.galerie_photos.forEach((photo, index) => {
      console.log(`   ${index + 1}. ${photo}`);
    });

    console.log('\n✅ Insertion terminée avec succès!');
    console.log('\n💡 Pour vérifier dans MongoDB:');
    console.log('   mongosh');
    console.log('   use mall');
    console.log(`   db.boutiques.findOne({ _id: ObjectId("${boutique._id}") })`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion:', error);
    
    if (error.name === 'ValidationError') {
      console.error('\n📋 Erreurs de validation:');
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script
insertFanelieBoutique();

