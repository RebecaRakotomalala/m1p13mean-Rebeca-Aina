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

    // Nettoyer les documents avec slug null (qui causent des problèmes avec l'index unique)
    const nullSlugCount = await Boutique.countDocuments({ slug: null });
    if (nullSlugCount > 0) {
      console.log(`⚠️  Trouvé ${nullSlugCount} document(s) avec slug null. Nettoyage...`);
      // Générer des slugs pour les documents sans slug
      const boutiquesSansSlug = await Boutique.find({ slug: null });
      for (const boutique of boutiquesSansSlug) {
        const baseSlug = generateSlug(boutique.nom || 'boutique');
        let newSlug = `${baseSlug}-${boutique._id.toString().slice(-6)}`;
        let counter = 1;
        while (await Boutique.findOne({ slug: newSlug, _id: { $ne: boutique._id } })) {
          newSlug = `${baseSlug}-${boutique._id.toString().slice(-6)}-${counter}`;
          counter++;
        }
        boutique.slug = newSlug;
        await boutique.save();
        console.log(`   ✅ Slug généré pour ${boutique.nom}: ${newSlug}`);
      }
    }

    // ID de l'utilisateur (à remplacer par votre ID réel)
    const utilisateurId = '6988ab53160b203a35206e34';

    // Vérifier si la boutique existe déjà
    const existingBoutique = await Boutique.findOne({ 
      nom: 'Tech Vision Store',
      utilisateur_id: utilisateurId 
    });

    if (existingBoutique) {
      console.log('⚠️  La boutique "Tech Vision Store" existe déjà!');
      console.log('   ID:', existingBoutique._id);
      console.log('   Slug:', existingBoutique.slug);
      
      // Demander si on veut la mettre à jour
      console.log('\n💡 Pour mettre à jour, supprimez-la d\'abord ou modifiez le script.');
      return;
    }

    // Générer un slug unique
    const baseSlug = generateSlug('Tech Vision Store');
    let slug = `${baseSlug}-${Date.now()}`;
    
    // Vérifier l'unicité du slug et générer un nouveau si nécessaire
    let counter = 1;
    while (await Boutique.findOne({ slug: slug })) {
      slug = `${baseSlug}-${Date.now()}-${counter}`;
      counter++;
      // Sécurité : éviter une boucle infinie
      if (counter > 1000) {
        throw new Error('Impossible de générer un slug unique après 1000 tentatives');
      }
    }

    console.log('✅ Slug unique généré:', slug);

    console.log('📝 Création de la boutique "Tech Vision Store"...');

    // Corriger les URLs de galerie_photos (il y avait une erreur de syntaxe)
    const galerie_photos = [
    ];

    // Créer la boutique
    const boutique = new Boutique({
        utilisateur_id: utilisateurId,
        nom: 'Tech Vision Store',
        slug: slug,
        categorie_principale: 'Technologie',
        categories_secondaires: ['Smartphones', 'Accessoires', 'Gadgets'],
        email_contact: 'contact@techvision.com',
        telephone_contact: '0342222222',
        services: ['livraison', 'retrait en magasin', 'service après-vente'],
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

