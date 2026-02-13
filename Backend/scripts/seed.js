/**
 * Script de seed pour initialiser la base de donnees avec des donnees de test
 * Usage: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mall';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connecte a MongoDB');

    // Nettoyer
    await User.deleteMany({});
    await Boutique.deleteMany({});
    await Produit.deleteMany({});
    console.log('Collections nettoyees');

    const salt = await bcrypt.genSalt(10);

    // ============================
    // UTILISATEURS
    // ============================

    // Admin
    const admin = await User.create({
      email: 'admin@mallconnect.mg',
      mot_de_passe_hash: await bcrypt.hash('admin123', salt),
      nom: 'Rajoelina',
      prenom: 'Hery',
      role: 'admin',
      telephone: '+261340000001',
      actif: true
    });
    console.log('Admin cree:', admin.email);

    // Proprietaire boutique cosmetiques
    const userCosmetique = await User.create({
      email: 'cosmetique@boutique.mg',
      mot_de_passe_hash: await bcrypt.hash('boutique123', salt),
      nom: 'Razafindrakoto',
      prenom: 'Voahirana',
      role: 'boutique',
      telephone: '+261340000002',
      actif: true
    });

    // Proprietaire boutique mode
    const userMode = await User.create({
      email: 'mode@boutique.mg',
      mot_de_passe_hash: await bcrypt.hash('boutique123', salt),
      nom: 'Randrianarisoa',
      prenom: 'Fanja',
      role: 'boutique',
      telephone: '+261340000003',
      actif: true
    });

    // Proprietaire supermarche
    const userSupermarche = await User.create({
      email: 'supermarche@boutique.mg',
      mot_de_passe_hash: await bcrypt.hash('boutique123', salt),
      nom: 'Rabemananjara',
      prenom: 'Tiana',
      role: 'boutique',
      telephone: '+261340000004',
      actif: true
    });

    // Clients
    const client1 = await User.create({
      email: 'client@test.mg',
      mot_de_passe_hash: await bcrypt.hash('client123', salt),
      nom: 'Andriantsitohaina',
      prenom: 'Miora',
      role: 'client',
      telephone: '+261340000010',
      actif: true
    });

    const client2 = await User.create({
      email: 'client2@test.mg',
      mot_de_passe_hash: await bcrypt.hash('client123', salt),
      nom: 'Rakotomalala',
      prenom: 'Ny Aina',
      role: 'client',
      telephone: '+261340000011',
      actif: true
    });
    console.log('Utilisateurs crees');

    // ============================
    // BOUTIQUES
    // ============================

    // 1. Boutique Cosmetiques
    const boutiqueCosmetique = await Boutique.create({
      utilisateur_id: userCosmetique._id,
      nom: 'Beauty Mada',
      slug: 'beauty-mada',
      description_courte: 'Produits cosmetiques naturels et de marque pour sublimer votre beaute au quotidien',
      categorie_principale: 'Cosmetiques',
      categories_secondaires: ['Soins visage', 'Maquillage', 'Parfums', 'Soins corps', 'Soins cheveux'],
      email_contact: 'contact@beautymada.mg',
      telephone_contact: '+261340100001',
      services: ['livraison', 'click_and_collect', 'echantillons_gratuits'],
      statut: 'active',
      note_moyenne: 4.6,
      nombre_avis: 42,
      nombre_vues: 1250
    });

    // 2. Boutique Mode
    const boutiqueMode = await Boutique.create({
      utilisateur_id: userMode._id,
      nom: 'Style Avenue',
      slug: 'style-avenue',
      description_courte: 'La mode tendance pour homme, femme et enfant. Vetements, chaussures et accessoires',
      categorie_principale: 'Mode',
      categories_secondaires: ['Vetements Femme', 'Vetements Homme', 'Chaussures', 'Accessoires', 'Enfants'],
      email_contact: 'contact@styleavenue.mg',
      telephone_contact: '+261340100002',
      services: ['livraison', 'essayage', 'retour_gratuit'],
      statut: 'active',
      note_moyenne: 4.3,
      nombre_avis: 67,
      nombre_vues: 2100
    });

    // 3. Supermarche
    const boutiqueSupermarche = await Boutique.create({
      utilisateur_id: userSupermarche._id,
      nom: 'MegaStore Express',
      slug: 'megastore-express',
      description_courte: 'Votre supermarche en ligne : alimentation, boissons, produits menagers et bien plus',
      categorie_principale: 'Supermarche',
      categories_secondaires: ['Alimentation', 'Boissons', 'Produits menagers', 'Hygiene', 'Epicerie'],
      email_contact: 'contact@megastore.mg',
      telephone_contact: '+261340100003',
      services: ['livraison', 'click_and_collect', 'livraison_express'],
      statut: 'active',
      note_moyenne: 4.1,
      nombre_avis: 89,
      nombre_vues: 3400
    });

    console.log('Boutiques creees');

    // ============================
    // PRODUITS - Beauty Mada (Cosmetiques)
    // ============================
    const produitsCosmetique = [
      {
        nom: 'Creme Hydratante Aloe Vera',
        categorie: 'Soins visage',
        prix_initial: 45000,
        prix_promo: 38000,
        stock_quantite: 50,
        description_courte: 'Creme hydratante naturelle a base d\'aloe vera pour une peau douce et eclatante',
        description_longue: 'Cette creme hydratante est formulee avec de l\'aloe vera bio de Madagascar. Elle nourrit la peau en profondeur, reduit les rougeurs et laisse un fini soyeux. Convient a tous les types de peau. Application matin et soir sur peau propre.',
        image_principale: 'https://picsum.photos/seed/creme-aloe/400/400'
      },
      {
        nom: 'Serum Vitamine C Eclat',
        categorie: 'Soins visage',
        prix_initial: 72000,
        stock_quantite: 35,
        description_courte: 'Serum concentre en vitamine C pour un teint lumineux et uniforme',
        description_longue: 'Ce serum puissant contient 15% de vitamine C stabilisee. Il aide a reduire les taches brunes, uniformiser le teint et proteger la peau contre les radicaux libres. Flacon compte-gouttes de 30ml.',
        image_principale: 'https://picsum.photos/seed/serum-vitc/400/400'
      },
      {
        nom: 'Rouge a Levres Mat Longue Tenue',
        categorie: 'Maquillage',
        prix_initial: 35000,
        prix_promo: 28000,
        stock_quantite: 80,
        description_courte: 'Rouge a levres mat qui tient toute la journee, couleur Rouge Passion',
        description_longue: 'Formule longue tenue jusqu\'a 12h. Texture cremeuse qui ne desseche pas les levres. Pigments intenses pour une couleur vibrante des la premiere application. Disponible en 8 teintes.',
        image_principale: 'https://picsum.photos/seed/rouge-levres/400/400'
      },
      {
        nom: 'Palette Fards a Paupieres Tropicale',
        categorie: 'Maquillage',
        prix_initial: 85000,
        prix_promo: 69000,
        stock_quantite: 25,
        description_courte: 'Palette de 12 teintes chaudes inspirees des tropiques malgaches',
        description_longue: 'Palette de 12 fards a paupieres aux couleurs chaudes : ors, cuivres, terracotta et bordeaux. Textures mattes et shimmer. Hautement pigmentee et facile a estomper. Miroir integre.',
        image_principale: 'https://picsum.photos/seed/palette-ombre/400/400'
      },
      {
        nom: 'Parfum Ylang-Ylang de Madagascar',
        categorie: 'Parfums',
        prix_initial: 120000,
        stock_quantite: 20,
        description_courte: 'Eau de parfum aux notes d\'ylang-ylang et vanille de Madagascar',
        description_longue: 'Un parfum envoûtant aux notes de tete d\'ylang-ylang frais, coeur de jasmin et fond de vanille bourbon de Madagascar. Flacon elegant de 50ml. Tenue 8h+.',
        image_principale: 'https://picsum.photos/seed/parfum-ylang/400/400'
      },
      {
        nom: 'Huile de Coco Vierge Bio',
        categorie: 'Soins corps',
        prix_initial: 28000,
        stock_quantite: 100,
        description_courte: 'Huile de coco vierge pressee a froid, multi-usage peau et cheveux',
        description_longue: 'Huile de coco 100% naturelle et bio de la cote est de Madagascar. Ideale pour hydrater le corps, nourrir les cheveux, demaquiller ou comme base de massage. Pot de 250ml.',
        image_principale: 'https://picsum.photos/seed/huile-coco/400/400'
      },
      {
        nom: 'Shampoing Keratine Reparateur',
        categorie: 'Soins cheveux',
        prix_initial: 38000,
        prix_promo: 32000,
        stock_quantite: 45,
        description_courte: 'Shampoing a la keratine pour cheveux abimes et fragilises',
        description_longue: 'Formule enrichie en keratine et huile d\'argan pour reparer les cheveux en profondeur. Redonne force, brillance et douceur. Sans sulfates ni parabenes. Flacon 300ml.',
        image_principale: 'https://picsum.photos/seed/shampoing-keratine/400/400'
      },
      {
        nom: 'Masque Argile Verte Purifiant',
        categorie: 'Soins visage',
        prix_initial: 32000,
        stock_quantite: 60,
        description_courte: 'Masque a l\'argile verte pour purifier et resserrer les pores',
        description_longue: 'Masque purifiant a base d\'argile verte et d\'extrait de the vert. Elimine les impuretes, resserre les pores et matifie la peau. Appliquer 1 a 2 fois par semaine. Pot de 100ml.',
        image_principale: 'https://picsum.photos/seed/masque-argile/400/400'
      },
      {
        nom: 'Fond de Teint Fluide Couvrant',
        categorie: 'Maquillage',
        prix_initial: 55000,
        stock_quantite: 40,
        description_courte: 'Fond de teint fluide haute couvrance, fini naturel, SPF 15',
        description_longue: 'Fond de teint fluide avec une couvrance modulable de moyenne a haute. Fini naturel et lumineux. Enrichi en SPF 15 pour proteger la peau. Disponible en 12 teintes adaptees aux peaux malgaches.',
        image_principale: 'https://picsum.photos/seed/fond-teint/400/400'
      },
      {
        nom: 'Beurre de Karite Pur',
        categorie: 'Soins corps',
        prix_initial: 22000,
        prix_promo: 18000,
        stock_quantite: 70,
        description_courte: 'Beurre de karite 100% pur et naturel pour peau et cheveux',
        description_longue: 'Beurre de karite brut non raffine. Hydrate intensement les peaux seches, nourrit les cheveux crepus, apaise les irritations. Pot de 200g.',
        image_principale: 'https://picsum.photos/seed/beurre-karite/400/400'
      }
    ];

    for (const p of produitsCosmetique) {
      await Produit.create({
        boutique_id: boutiqueCosmetique._id,
        slug: p.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ...p,
        nombre_vues: Math.floor(Math.random() * 500) + 50,
        nombre_ventes: Math.floor(Math.random() * 100) + 5
      });
    }
    console.log('Produits Beauty Mada crees (' + produitsCosmetique.length + ')');

    // ============================
    // PRODUITS - Style Avenue (Mode)
    // ============================
    const produitsMode = [
      {
        nom: 'Robe d\'Ete Fleurie',
        categorie: 'Vetements Femme',
        prix_initial: 125000,
        prix_promo: 89000,
        stock_quantite: 30,
        description_courte: 'Robe legere a motif floral, parfaite pour l\'ete malgache',
        description_longue: 'Robe midi en tissu leger et fluide avec imprime floral colore. Coupe evasee flatteuse, bretelles ajustables. Tissu respirant ideal pour le climat tropical. Tailles S a XXL.',
        image_principale: 'https://picsum.photos/seed/robe-fleurie/400/400'
      },
      {
        nom: 'Jean Slim Homme Bleu',
        categorie: 'Vetements Homme',
        prix_initial: 95000,
        stock_quantite: 50,
        description_courte: 'Jean slim stretch confortable, coupe moderne',
        description_longue: 'Jean coupe slim en denim stretch pour un confort optimal. Lavage bleu moyen classique. 5 poches, fermeture boutonnee. Composition : 98% coton, 2% elasthanne. Tailles 28 a 38.',
        image_principale: 'https://picsum.photos/seed/jean-slim/400/400'
      },
      {
        nom: 'Baskets Running Femme',
        categorie: 'Chaussures',
        prix_initial: 185000,
        prix_promo: 149000,
        stock_quantite: 25,
        description_courte: 'Chaussures de sport legeres et respirantes pour femme',
        description_longue: 'Baskets de running avec semelle amortissante en EVA. Tige en mesh respirant pour garder les pieds au frais. Semelle exterieure antiderapante. Poids : 220g. Pointures 36 a 42.',
        image_principale: 'https://picsum.photos/seed/baskets-running/400/400'
      },
      {
        nom: 'Sac a Main Cuir Artisanal',
        categorie: 'Accessoires',
        prix_initial: 280000,
        stock_quantite: 15,
        description_courte: 'Sac a main en cuir veritable fait main par des artisans malgaches',
        description_longue: 'Sac a main elegant en cuir de vachette tanne naturellement. Fabrication artisanale malgache. Compartiment principal zippé, poche interieure, bandouliere amovible. Dimensions : 30x25x12cm.',
        image_principale: 'https://picsum.photos/seed/sac-cuir/400/400'
      },
      {
        nom: 'Chemise Lin Homme',
        categorie: 'Vetements Homme',
        prix_initial: 88000,
        stock_quantite: 40,
        description_courte: 'Chemise en lin naturel, coupe decontractee, coloris blanc',
        description_longue: 'Chemise en pur lin naturel, tissu leger et respirant. Col classique, manches longues retroussables. Coupe regular fit. Parfaite pour les journees chaudes. Tailles S a XXL.',
        image_principale: 'https://picsum.photos/seed/chemise-lin/400/400'
      },
      {
        nom: 'Montre Bracelet Cuir Classique',
        categorie: 'Accessoires',
        prix_initial: 350000,
        prix_promo: 285000,
        stock_quantite: 10,
        description_courte: 'Montre elegante avec bracelet en cuir, mouvement quartz',
        description_longue: 'Montre classique avec boitier en acier inoxydable 40mm, cadran epure, verre mineral. Bracelet en cuir veritable marron. Mouvement quartz japonais. Etanche 30m.',
        image_principale: 'https://picsum.photos/seed/montre-cuir/400/400'
      },
      {
        nom: 'T-Shirt Femme Madagascar',
        categorie: 'Vetements Femme',
        prix_initial: 45000,
        prix_promo: 35000,
        stock_quantite: 80,
        description_courte: 'T-shirt en coton bio avec motif baobab de Madagascar',
        description_longue: 'T-shirt en coton biologique, imprime original representant les baobabs de l\'allee de Morondava. Coupe femme ajustee, col rond. Impression serigraphie durable. Tailles XS a XL.',
        image_principale: 'https://picsum.photos/seed/tshirt-mada/400/400'
      },
      {
        nom: 'Sandales Cuir Tresse Femme',
        categorie: 'Chaussures',
        prix_initial: 135000,
        stock_quantite: 20,
        description_courte: 'Sandales plates en cuir tresse, confort et elegance',
        description_longue: 'Sandales en cuir tresse a la main. Semelle interieure moelleuse pour un confort optimal. Semelle exterieure en caoutchouc naturel. Fabrication artisanale. Pointures 36 a 41.',
        image_principale: 'https://picsum.photos/seed/sandales-cuir/400/400'
      },
      {
        nom: 'Veste Bomber Homme',
        categorie: 'Vetements Homme',
        prix_initial: 195000,
        stock_quantite: 18,
        description_courte: 'Veste bomber legere, style streetwear, coloris kaki',
        description_longue: 'Veste bomber en nylon leger avec doublure en polyester. Col, poignets et ourlet en bord-cote. Deux poches laterales zippees, une poche interieure. Tailles S a XXL.',
        image_principale: 'https://picsum.photos/seed/veste-bomber/400/400'
      },
      {
        nom: 'Ensemble Lamba Enfant',
        categorie: 'Enfants',
        prix_initial: 65000,
        prix_promo: 52000,
        stock_quantite: 35,
        description_courte: 'Ensemble traditionnel lamba modernise pour enfant, tailles 2-8 ans',
        description_longue: 'Ensemble compose d\'un haut et pantalon en tissu lamba malgache modernise. Motifs traditionnels revisites dans des couleurs vives. Coton doux adapte aux enfants. Tailles 2 a 8 ans.',
        image_principale: 'https://picsum.photos/seed/lamba-enfant/400/400'
      },
      {
        nom: 'Lunettes de Soleil Aviateur',
        categorie: 'Accessoires',
        prix_initial: 78000,
        stock_quantite: 30,
        description_courte: 'Lunettes de soleil style aviateur, protection UV400',
        description_longue: 'Lunettes de soleil aviateur avec monture en metal dore. Verres polarises avec protection UV400. Livrees avec etui rigide et chiffon de nettoyage.',
        image_principale: 'https://picsum.photos/seed/lunettes-soleil/400/400'
      },
      {
        nom: 'Ceinture Cuir Homme',
        categorie: 'Accessoires',
        prix_initial: 55000,
        stock_quantite: 45,
        description_courte: 'Ceinture en cuir pleine fleur, boucle argent classique',
        description_longue: 'Ceinture en cuir de vachette pleine fleur, boucle en alliage argente. Largeur 3.5cm. Fabrication artisanale malgache. Taille ajustable.',
        image_principale: 'https://picsum.photos/seed/ceinture-cuir/400/400'
      }
    ];

    for (const p of produitsMode) {
      await Produit.create({
        boutique_id: boutiqueMode._id,
        slug: p.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ...p,
        nombre_vues: Math.floor(Math.random() * 600) + 30,
        nombre_ventes: Math.floor(Math.random() * 120) + 3
      });
    }
    console.log('Produits Style Avenue crees (' + produitsMode.length + ')');

    // ============================
    // PRODUITS - MegaStore Express (Supermarche)
    // ============================
    const produitsSupermarche = [
      {
        nom: 'Riz Makalioka 5kg',
        categorie: 'Alimentation',
        prix_initial: 25000,
        stock_quantite: 200,
        description_courte: 'Riz blanc makalioka de qualite superieure, sac de 5kg',
        description_longue: 'Riz blanc makalioka de la region Alaotra-Mangoro. Grains longs et parfumes. Ideal pour le vary amin\'anana et tous vos plats malgaches. Sac de 5kg.',
        image_principale: 'https://picsum.photos/seed/riz-makalioka/400/400'
      },
      {
        nom: 'Huile de Tournesol 1L',
        categorie: 'Alimentation',
        prix_initial: 12000,
        prix_promo: 10500,
        stock_quantite: 150,
        description_courte: 'Huile de tournesol raffinee, bouteille 1 litre',
        description_longue: 'Huile de tournesol 100% pure, raffinee et desodorisee. Riche en vitamine E et omega-6. Ideale pour la cuisson et les fritures. Bouteille PET de 1 litre.',
        image_principale: 'https://picsum.photos/seed/huile-tournesol/400/400'
      },
      {
        nom: 'Lait Concentre Sucre 397g',
        categorie: 'Alimentation',
        prix_initial: 8500,
        stock_quantite: 120,
        description_courte: 'Lait concentre sucre en boite, ideal pour patisserie et boissons',
        description_longue: 'Lait concentre sucre de qualite. Parfait pour le cafe, le the, les mofo gasy et toutes vos preparations sucrées. Boite de 397g.',
        image_principale: 'https://picsum.photos/seed/lait-concentre/400/400'
      },
      {
        nom: 'Coca-Cola Pack 6x33cl',
        categorie: 'Boissons',
        prix_initial: 18000,
        prix_promo: 15000,
        stock_quantite: 80,
        description_courte: 'Pack de 6 canettes Coca-Cola classique 33cl',
        description_longue: 'Le gout original de Coca-Cola en pack de 6 canettes de 33cl. Servir bien frais pour un maximum de plaisir. Conservation a temperature ambiante.',
        image_principale: 'https://picsum.photos/seed/coca-cola/400/400'
      },
      {
        nom: 'Eau Minerale Eau Vive 6x1.5L',
        categorie: 'Boissons',
        prix_initial: 12000,
        stock_quantite: 100,
        description_courte: 'Pack de 6 bouteilles d\'eau minerale naturelle Eau Vive 1.5L',
        description_longue: 'Eau minerale naturelle puisee a la source. Faible teneur en mineraux, ideale pour toute la famille. Pack de 6 bouteilles de 1.5 litre.',
        image_principale: 'https://picsum.photos/seed/eau-vive/400/400'
      },
      {
        nom: 'Jus de Litchi Frais 1L',
        categorie: 'Boissons',
        prix_initial: 8000,
        prix_promo: 6500,
        stock_quantite: 60,
        description_courte: 'Jus de litchi naturel de Madagascar, bouteille 1 litre',
        description_longue: 'Jus de litchi 100% naturel fabrique avec des litchis de Toamasina. Sans conservateurs ni colorants artificiels. A conserver au frais apres ouverture. Bouteille de 1 litre.',
        image_principale: 'https://picsum.photos/seed/jus-litchi/400/400'
      },
      {
        nom: 'Lessive en Poudre Omo 3kg',
        categorie: 'Produits menagers',
        prix_initial: 32000,
        prix_promo: 27000,
        stock_quantite: 70,
        description_courte: 'Lessive en poudre Omo Active, sac de 3kg',
        description_longue: 'Lessive en poudre haute performance. Elimine les taches tenaces des le premier lavage. Parfum fraicheur longue duree. Compatible lave-linge et lavage a la main. Sac de 3kg.',
        image_principale: 'https://picsum.photos/seed/lessive-omo/400/400'
      },
      {
        nom: 'Savon de Marseille 300g',
        categorie: 'Hygiene',
        prix_initial: 5500,
        stock_quantite: 200,
        description_courte: 'Savon de Marseille traditionnel, multi-usage, 300g',
        description_longue: 'Savon de Marseille veritable a 72% d\'huile vegetale. Multi-usage : toilette, linge, menage. Hypoallergenique et biodegradable. Pain de 300g.',
        image_principale: 'https://picsum.photos/seed/savon-marseille/400/400'
      },
      {
        nom: 'Sucre Blanc 1kg',
        categorie: 'Epicerie',
        prix_initial: 5000,
        stock_quantite: 250,
        description_courte: 'Sucre blanc cristallise en poudre, sachet de 1kg',
        description_longue: 'Sucre blanc cristallise de qualite superieure. Produit a Madagascar. Ideal pour la patisserie, les boissons et la cuisine. Sachet de 1kg.',
        image_principale: 'https://picsum.photos/seed/sucre-blanc/400/400'
      },
      {
        nom: 'Cafe Moulu Arabica 250g',
        categorie: 'Epicerie',
        prix_initial: 18000,
        prix_promo: 15000,
        stock_quantite: 55,
        description_courte: 'Cafe arabica de Madagascar, torrefie et moulu, sachet 250g',
        description_longue: 'Cafe 100% arabica cultive dans les hauts plateaux de Madagascar. Torrefaction artisanale a Antananarivo. Notes de chocolat et fruits rouges. Intensite 7/10. Sachet 250g.',
        image_principale: 'https://picsum.photos/seed/cafe-arabica/400/400'
      },
      {
        nom: 'Dentifrice Colgate 100ml',
        categorie: 'Hygiene',
        prix_initial: 7500,
        stock_quantite: 130,
        description_courte: 'Dentifrice Colgate Protection Caries, tube 100ml',
        description_longue: 'Dentifrice au fluor pour une protection efficace contre les caries. Formule fraicheur pour une haleine agreable toute la journee. Tube de 100ml.',
        image_principale: 'https://picsum.photos/seed/dentifrice/400/400'
      },
      {
        nom: 'Papier Toilette 12 Rouleaux',
        categorie: 'Hygiene',
        prix_initial: 15000,
        prix_promo: 12000,
        stock_quantite: 90,
        description_courte: 'Papier toilette double epaisseur, pack de 12 rouleaux',
        description_longue: 'Papier toilette doux et resistant, double epaisseur. 200 feuilles par rouleau. Pack economique de 12 rouleaux.',
        image_principale: 'https://picsum.photos/seed/papier-toilette/400/400'
      },
      {
        nom: 'Chocolat au Lait Madagascar 100g',
        categorie: 'Epicerie',
        prix_initial: 12000,
        stock_quantite: 45,
        description_courte: 'Tablette de chocolat au lait au cacao fin de Madagascar',
        description_longue: 'Chocolat au lait fabrique avec du cacao grand cru de la SAVA (nord-est de Madagascar). 40% de cacao. Notes de vanille et caramel. Tablette de 100g. Fabrication artisanale.',
        image_principale: 'https://picsum.photos/seed/chocolat-mada/400/400'
      },
      {
        nom: 'Liquide Vaisselle Citron 750ml',
        categorie: 'Produits menagers',
        prix_initial: 8000,
        stock_quantite: 110,
        description_courte: 'Liquide vaisselle parfum citron, flacon de 750ml',
        description_longue: 'Liquide vaisselle ultra-degraissant au citron. Mousse abondante, rincage facile. Doux pour les mains. Flacon pompe de 750ml.',
        image_principale: 'https://picsum.photos/seed/vaisselle-citron/400/400'
      },
      {
        nom: 'Vanille Bourbon Gousses 5pcs',
        categorie: 'Epicerie',
        prix_initial: 35000,
        stock_quantite: 30,
        description_courte: 'Gousses de vanille bourbon de Madagascar, lot de 5 pieces',
        description_longue: 'Gousses de vanille bourbon premium de la region SAVA. Gousses souples et charnues de 14-16cm. Arome intense et complexe. Conditionnees sous vide pour preserver la fraicheur. Lot de 5 gousses.',
        image_principale: 'https://picsum.photos/seed/vanille-bourbon/400/400'
      }
    ];

    for (const p of produitsSupermarche) {
      await Produit.create({
        boutique_id: boutiqueSupermarche._id,
        slug: p.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ...p,
        nombre_vues: Math.floor(Math.random() * 800) + 100,
        nombre_ventes: Math.floor(Math.random() * 200) + 10
      });
    }
    console.log('Produits MegaStore Express crees (' + produitsSupermarche.length + ')');

    // ============================
    // RESUME
    // ============================
    console.log('\n========================================');
    console.log('       SEED TERMINE AVEC SUCCES');
    console.log('========================================');
    console.log('\nComptes de test:');
    console.log('  Admin:       admin@mallconnect.mg / admin123');
    console.log('  Cosmetique:  cosmetique@boutique.mg / boutique123');
    console.log('  Mode:        mode@boutique.mg / boutique123');
    console.log('  Supermarche: supermarche@boutique.mg / boutique123');
    console.log('  Client:      client@test.mg / client123');
    console.log('  Client:      client2@test.mg / client123');
    console.log('\nBoutiques:');
    console.log('  Beauty Mada (Cosmetiques) - ' + produitsCosmetique.length + ' produits');
    console.log('  Style Avenue (Mode) - ' + produitsMode.length + ' produits');
    console.log('  MegaStore Express (Supermarche) - ' + produitsSupermarche.length + ' produits');
    console.log('  Total: ' + (produitsCosmetique.length + produitsMode.length + produitsSupermarche.length) + ' produits');
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erreur seed:', error);
    process.exit(1);
  }
}

seed();
