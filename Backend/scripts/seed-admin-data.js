/**
 * Seed de donnees de test pour l'admin cible.
 * Usage:
 *   node scripts/seed-admin-data.js
 *   node scripts/seed-admin-data.js --clean
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');
const LigneCommande = require('../models/LigneCommande');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_ID = '69a07d512b32fffa626a6d43';
const ADMIN_EMAIL = 'admin@mallconnect.mg';

if (!MONGODB_URI) {
  console.error('MONGODB_URI non definie dans .env');
  process.exit(1);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function generateNumeroCommande() {
  return `CMD-ADM-${Date.now().toString().slice(-7)}-${rand(100, 999)}`;
}

async function ensureAdmin() {
  const emailOwner = await User.findOne({ email: ADMIN_EMAIL });
  if (emailOwner && emailOwner._id.toString() !== ADMIN_ID) {
    throw new Error(
      `L'email ${ADMIN_EMAIL} est deja utilise par un autre _id (${emailOwner._id}).`
    );
  }

  const hash = await bcrypt.hash('admin123', 10);
  const admin = await User.findOneAndUpdate(
    { _id: ADMIN_ID },
    {
      $set: {
        email: ADMIN_EMAIL,
        mot_de_passe_hash: hash,
        nom: 'Rajoelina',
        prenom: 'Hery',
        role: 'admin',
        telephone: '+261340000001',
        actif: true
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return admin;
}

async function upsertUserByEmail(data) {
  const hash = await bcrypt.hash(data.password, 10);
  return User.findOneAndUpdate(
    { email: data.email },
    {
      $set: {
        mot_de_passe_hash: hash,
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        telephone: data.telephone,
        actif: true
      },
      $setOnInsert: {
        email: data.email
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function run() {
  const shouldClean = process.argv.includes('--clean');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connecte a MongoDB');

    const admin = await ensureAdmin();
    console.log(`Admin pret: ${admin.email} (${admin._id})`);

    const ownerBeauty = await upsertUserByEmail({
      email: 'beauty.admin.test@mallconnect.mg',
      password: 'boutique123',
      nom: 'Razafindrakoto',
      prenom: 'Voahirana',
      role: 'boutique',
      telephone: '+261340000102'
    });
    const ownerMode = await upsertUserByEmail({
      email: 'mode.admin.test@mallconnect.mg',
      password: 'boutique123',
      nom: 'Randrianarisoa',
      prenom: 'Fanja',
      role: 'boutique',
      telephone: '+261340000103'
    });
    const ownerMarket = await upsertUserByEmail({
      email: 'market.admin.test@mallconnect.mg',
      password: 'boutique123',
      nom: 'Rabemananjara',
      prenom: 'Tiana',
      role: 'boutique',
      telephone: '+261340000104'
    });

    const client1 = await upsertUserByEmail({
      email: 'client.admin.test1@mallconnect.mg',
      password: 'client123',
      nom: 'Andriantsitohaina',
      prenom: 'Miora',
      role: 'client',
      telephone: '+261340000201'
    });
    const client2 = await upsertUserByEmail({
      email: 'client.admin.test2@mallconnect.mg',
      password: 'client123',
      nom: 'Rakotomalala',
      prenom: 'Ny Aina',
      role: 'client',
      telephone: '+261340000202'
    });

    const boutiquesSeed = [
      {
        ownerId: ownerBeauty._id,
        nom: 'Beauty Mada Admin Test',
        slug: 'beauty-mada-admin-test',
        categorie: 'Cosmetiques',
        email: 'contact+beauty-admin@mallconnect.mg',
        phone: '+261340100901',
        services: ['livraison', 'click_and_collect', 'echantillons_gratuits']
      },
      {
        ownerId: ownerMode._id,
        nom: 'Style Avenue Admin Test',
        slug: 'style-avenue-admin-test',
        categorie: 'Mode',
        email: 'contact+mode-admin@mallconnect.mg',
        phone: '+261340100902',
        services: ['livraison', 'retour_gratuit']
      },
      {
        ownerId: ownerMarket._id,
        nom: 'MegaStore Admin Test',
        slug: 'megastore-admin-test',
        categorie: 'Supermarche',
        email: 'contact+market-admin@mallconnect.mg',
        phone: '+261340100903',
        services: ['livraison', 'livraison_express']
      }
    ];

    const boutiques = [];
    for (const b of boutiquesSeed) {
      const boutique = await Boutique.findOneAndUpdate(
        { slug: b.slug },
        {
          $set: {
            utilisateur_id: b.ownerId,
            nom: b.nom,
            description_courte: `Boutique de test pour l'admin (${b.categorie})`,
            categorie_principale: b.categorie,
            email_contact: b.email,
            telephone_contact: b.phone,
            services: b.services,
            statut: 'active',
            validee_par: admin._id,
            date_validation: new Date(),
            note_moyenne: 4.2,
            nombre_avis: rand(10, 60),
            nombre_vues: rand(300, 3000)
          },
          $setOnInsert: { slug: b.slug }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      boutiques.push(boutique);
    }

    const boutiqueIds = boutiques.map((b) => b._id);

    if (shouldClean) {
      await LigneCommande.deleteMany({ boutique_id: { $in: boutiqueIds } });
      await Produit.deleteMany({ boutique_id: { $in: boutiqueIds } });
      await Commande.deleteMany({ client_id: { $in: [client1._id, client2._id] } });
      console.log('Nettoyage des anciennes donnees de test termine');
    }

    await Produit.deleteMany({ boutique_id: { $in: boutiqueIds } });

    const productsSeed = {
      'beauty-mada-admin-test': [
        ['Creme Hydratante Aloe Vera', 'Soins visage', 45000],
        ['Serum Vitamine C', 'Soins visage', 72000],
        ['Rouge a Levres Mat', 'Maquillage', 35000],
        ['Parfum Ylang Ylang', 'Parfums', 120000]
      ],
      'style-avenue-admin-test': [
        ['Robe Fleurie', 'Vetements Femme', 125000],
        ['Jean Slim Homme', 'Vetements Homme', 95000],
        ['Baskets Running', 'Chaussures', 185000],
        ['Sac Cuir Artisanal', 'Accessoires', 280000]
      ],
      'megastore-admin-test': [
        ['Riz Makalioka 5kg', 'Alimentation', 25000],
        ['Huile Tournesol 1L', 'Alimentation', 12000],
        ['Lessive Poudre 3kg', 'Produits menagers', 32000],
        ['Cafe Arabica 250g', 'Epicerie', 18000]
      ]
    };

    const allProduits = [];
    for (const boutique of boutiques) {
      const list = productsSeed[boutique.slug] || [];
      for (const row of list) {
        const [nom, categorie, prixInitial] = row;
        const prixPromo = Math.random() > 0.5 ? Math.round(prixInitial * 0.88) : null;
        const produit = await Produit.create({
          boutique_id: boutique._id,
          nom,
          slug: `${slugify(nom)}-${rand(10, 99)}`,
          reference_sku: `ADM-${slugify(nom).slice(0, 8).toUpperCase()}-${rand(100, 999)}`,
          categorie,
          prix_initial: prixInitial,
          prix_achat: Math.round(prixInitial * 0.62),
          prix_promo: prixPromo,
          stock_quantite: rand(20, 120),
          stock_seuil_alerte: 5,
          description_courte: `${nom} - donnee de test`,
          description_longue: `${nom} genere pour les tests admin.`,
          image_principale: `https://picsum.photos/seed/${slugify(nom)}/400/400`,
          actif: true,
          nombre_vues: rand(40, 500),
          nombre_ventes: 0
        });
        allProduits.push(produit);
      }
    }

    await Commande.deleteMany({ client_id: { $in: [client1._id, client2._id] } });
    await LigneCommande.deleteMany({ boutique_id: { $in: boutiqueIds } });

    const commandes = [];
    const orderStatuts = ['en_attente', 'confirmee', 'en_preparation', 'livree'];
    for (let i = 0; i < 18; i++) {
      const client = Math.random() > 0.5 ? client1 : client2;
      const selected = [...allProduits].sort(() => 0.5 - Math.random()).slice(0, rand(1, 3));

      let sousTotal = 0;
      const lines = [];
      for (const p of selected) {
        const qte = rand(1, 3);
        const pu = p.prix_promo || p.prix_initial;
        const pt = pu * qte;
        sousTotal += pt;
        lines.push({ produit: p, quantite: qte, prixUnitaire: pu, prixTotal: pt });
      }

      const frais = sousTotal >= 120000 ? 0 : 5000;
      const montantTotal = sousTotal + frais;
      const statut = randomPick(orderStatuts);
      const dateCreation = new Date(Date.now() - rand(1, 20) * 24 * 3600 * 1000);

      const commande = await Commande.create({
        numero_commande: generateNumeroCommande(),
        client_id: client._id,
        client_nom: `${client.prenom || ''} ${client.nom || ''}`.trim(),
        client_email: client.email,
        client_telephone: client.telephone,
        adresse_livraison: {
          rue: `${rand(1, 120)} Rue de test`,
          code_postal: '101',
          ville: 'Antananarivo',
          pays: 'Madagascar'
        },
        sous_total: sousTotal,
        frais_livraison: frais,
        taxes: 0,
        montant_total: montantTotal,
        methode_paiement: randomPick(['carte_credit', 'wallet', 'especes']),
        statut_paiement: statut === 'en_attente' ? 'en_attente' : 'paye',
        mode_livraison: 'livraison_domicile',
        statut,
        date_creation: dateCreation
      });

      for (const l of lines) {
        await LigneCommande.create({
          commande_id: commande._id,
          boutique_id: l.produit.boutique_id,
          produit_id: l.produit._id,
          nom_produit: l.produit.nom,
          reference_sku: l.produit.reference_sku,
          image_produit: l.produit.image_principale,
          prix_unitaire: l.prixUnitaire,
          quantite: l.quantite,
          prix_total: l.prixTotal,
          statut: statut === 'livree' ? 'livree' : 'confirmee'
        });
      }

      commandes.push(commande);
    }

    const soldByProduct = new Map();
    const lignes = await LigneCommande.find({ boutique_id: { $in: boutiqueIds } });
    for (const l of lignes) {
      const key = l.produit_id.toString();
      soldByProduct.set(key, (soldByProduct.get(key) || 0) + l.quantite);
    }
    for (const p of allProduits) {
      await Produit.updateOne(
        { _id: p._id },
        { $set: { nombre_ventes: soldByProduct.get(p._id.toString()) || 0 } }
      );
    }

    console.log('\n========================================');
    console.log('SEED ADMIN TERMINE AVEC SUCCES');
    console.log('========================================');
    console.log(`Admin: ${ADMIN_EMAIL} / admin123 (${ADMIN_ID})`);
    console.log(`Boutiques de test: ${boutiques.length}`);
    console.log(`Produits de test: ${allProduits.length}`);
    console.log(`Commandes de test: ${commandes.length}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erreur seed admin:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // noop
    }
    process.exit(1);
  }
}

run();

