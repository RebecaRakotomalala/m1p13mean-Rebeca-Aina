const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');
const LigneCommande = require('../models/LigneCommande');
const Avis = require('../models/Avis');

// Dashboard stats admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalBoutiques = await Boutique.countDocuments();
    const boutiquesActives = await Boutique.countDocuments({ statut: 'active' });
    const boutiquesEnAttente = await Boutique.countDocuments({ statut: 'en_attente' });
    const totalProduits = await Produit.countDocuments({ actif: true });
    const totalCommandes = await Commande.countDocuments();
    const commandesEnAttente = await Commande.countDocuments({ statut: 'en_attente' });
    const commandesLivrees = await Commande.countDocuments({ statut: 'livree' });

    const caResult = await Commande.aggregate([
      { $match: { statut: { $nin: ['annulee', 'remboursee'] } } },
      { $group: { _id: null, total: { $sum: '$montant_total' } } }
    ]);
    const chiffreAffaires = caResult.length > 0 ? caResult[0].total : 0;

    const commandesRecentes = await Commande.find()
      .populate('client_id', 'nom prenom email')
      .sort({ date_creation: -1 }).limit(10);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const ventesParMois = await Commande.aggregate([
      { $match: { date_creation: { $gte: sixMonthsAgo }, statut: { $nin: ['annulee', 'remboursee'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date_creation' } }, total: { $sum: '$montant_total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalClients, totalBoutiques, boutiquesActives, boutiquesEnAttente,
        totalProduits, totalCommandes, commandesEnAttente, commandesLivrees, chiffreAffaires,
        ventesParMois, commandesRecentes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation stats', error: error.message });
  }
};

// Valider une boutique
exports.validerBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ success: false, message: 'Boutique non trouvee' });
    boutique.statut = 'active';
    boutique.date_validation = new Date();
    boutique.validee_par = req.user._id;
    await boutique.save();
    res.json({ success: true, message: 'Boutique validee', boutique });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur validation boutique', error: error.message });
  }
};

// Suspendre une boutique
exports.suspendreBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ success: false, message: 'Boutique non trouvee' });
    boutique.statut = 'suspendue';
    await boutique.save();
    res.json({ success: true, message: 'Boutique suspendue', boutique });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suspension boutique', error: error.message });
  }
};

// Stats stock pour le proprietaire de boutique
exports.getStockStats = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ utilisateur_id: req.user._id });
    if (boutiques.length === 0) return res.json({ success: true, stats: null, message: 'Aucune boutique' });
    const boutiqueIds = boutiques.map(b => b._id);

    // Tous les produits de la boutique
    const produits = await Produit.find({ boutique_id: { $in: boutiqueIds } })
      .select('nom categorie stock_quantite stock_seuil_alerte stock_illimite prix_initial prix_promo image_principale actif nombre_ventes date_creation date_modification')
      .sort({ stock_quantite: 1 });

    // Stats rapides
    const totalProduits = produits.filter(p => !p.stock_illimite).length;
    const totalStock = produits.reduce((sum, p) => sum + (p.stock_illimite ? 0 : p.stock_quantite), 0);
    const produitsStockFaible = produits.filter(p => !p.stock_illimite && p.stock_quantite > 0 && p.stock_quantite <= (p.stock_seuil_alerte || 5));
    const produitsRupture = produits.filter(p => !p.stock_illimite && p.stock_quantite === 0);
    const valeurStock = produits.reduce((sum, p) => {
      if (p.stock_illimite) return sum;
      const prix = p.prix_promo || p.prix_initial;
      return sum + (prix * p.stock_quantite);
    }, 0);

    // Historique des mouvements de stock (basé sur les lignes de commandes)
    const { dateDebut, dateFin } = req.query;
    const matchDate = {};
    if (dateDebut) matchDate.$gte = new Date(dateDebut);
    if (dateFin) matchDate.$lte = new Date(dateFin);

    const mouvementsMatch = { boutique_id: { $in: boutiqueIds } };
    if (Object.keys(matchDate).length > 0) mouvementsMatch.date_creation = matchDate;

    const mouvements = await LigneCommande.find(mouvementsMatch)
      .populate('commande_id', 'numero_commande statut client_nom')
      .populate('produit_id', 'nom image_principale')
      .sort({ date_creation: -1 })
      .limit(100);

    // Evolution du stock par mois (6 derniers mois) - quantités vendues
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const evolutionStock = await LigneCommande.aggregate([
      { $match: { boutique_id: { $in: boutiqueIds }, date_creation: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date_creation' } },
        quantiteVendue: { $sum: '$quantite' },
        nbCommandes: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Top produits vendus
    const topProduits = await LigneCommande.aggregate([
      { $match: { boutique_id: { $in: boutiqueIds } } },
      { $group: {
        _id: '$produit_id',
        totalVendu: { $sum: '$quantite' },
        totalRevenu: { $sum: '$prix_total' }
      }},
      { $sort: { totalVendu: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'produits', localField: '_id', foreignField: '_id', as: 'produit' } },
      { $unwind: '$produit' },
      { $project: {
        nom: '$produit.nom',
        image: '$produit.image_principale',
        stock_actuel: '$produit.stock_quantite',
        totalVendu: 1,
        totalRevenu: 1
      }}
    ]);

    res.json({
      success: true,
      stats: {
        totalProduits,
        totalStock,
        stockFaible: produitsStockFaible.length,
        rupture: produitsRupture.length,
        valeurStock,
        topProduits
      },
      produits,
      mouvements,
      evolutionStock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation stats stock', error: error.message });
  }
};

// Import CSV des prix d'achat
exports.importCsvPrixAchat = async (req, res) => {
  try {
    const { data } = req.body; // Array of { nom, reference_sku, prix_achat }
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: 'Données CSV vides ou invalides' });
    }

    const boutiques = await Boutique.find({ utilisateur_id: req.user._id });
    if (boutiques.length === 0) return res.json({ success: false, message: 'Aucune boutique' });
    const boutiqueIds = boutiques.map(b => b._id);

    let updated = 0;
    let notFound = [];

    for (const row of data) {
      const prixAchat = parseFloat(row.prix_achat);
      if (isNaN(prixAchat) || prixAchat < 0) continue;

      let query = { boutique_id: { $in: boutiqueIds } };

      // Chercher par reference_sku d'abord, puis par nom
      if (row.reference_sku && row.reference_sku.trim()) {
        query.reference_sku = row.reference_sku.trim();
      } else if (row.nom && row.nom.trim()) {
        query.nom = { $regex: new RegExp('^' + row.nom.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') };
      } else {
        continue;
      }

      const result = await Produit.findOneAndUpdate(query, { prix_achat: prixAchat }, { new: true });
      if (result) {
        updated++;
      } else {
        notFound.push(row.nom || row.reference_sku || 'inconnu');
      }
    }

    res.json({
      success: true,
      message: `${updated} produit(s) mis à jour`,
      updated,
      notFound,
      total: data.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur import CSV', error: error.message });
  }
};

// Stats bénéfice pour le propriétaire de boutique
exports.getBeneficeStats = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ utilisateur_id: req.user._id });
    if (boutiques.length === 0) return res.json({ success: true, stats: null, message: 'Aucune boutique' });
    const boutiqueIds = boutiques.map(b => b._id);

    // Tous les produits avec prix_achat
    const produits = await Produit.find({ boutique_id: { $in: boutiqueIds } })
      .select('nom categorie prix_initial prix_promo prix_achat stock_quantite image_principale nombre_ventes actif reference_sku');

    // Lignes de commandes (ventes) pour calculer le bénéfice réel
    const lignesCommandes = await LigneCommande.find({ boutique_id: { $in: boutiqueIds } })
      .populate('commande_id', 'statut date_creation');

    // Calculer bénéfice par produit
    const beneficeParProduit = {};
    for (const produit of produits) {
      beneficeParProduit[produit._id.toString()] = {
        _id: produit._id,
        nom: produit.nom,
        categorie: produit.categorie,
        image: produit.image_principale,
        prix_vente: produit.prix_promo || produit.prix_initial,
        prix_achat: produit.prix_achat || 0,
        stock_quantite: produit.stock_quantite,
        nombre_ventes: produit.nombre_ventes || 0,
        total_vendu: 0,
        chiffre_affaires: 0,
        cout_total: 0,
        benefice: 0,
        marge_pct: 0
      };
    }

    let totalCA = 0;
    let totalCout = 0;

    for (const lc of lignesCommandes) {
      if (lc.commande_id && !['annulee', 'remboursee'].includes(lc.commande_id.statut)) {
        const pid = lc.produit_id?.toString();
        if (pid && beneficeParProduit[pid]) {
          const bp = beneficeParProduit[pid];
          bp.total_vendu += lc.quantite;
          bp.chiffre_affaires += lc.prix_total;
          bp.cout_total += (bp.prix_achat * lc.quantite);
          totalCA += lc.prix_total;
          totalCout += (bp.prix_achat * lc.quantite);
        }
      }
    }

    // Calculer bénéfice et marge pour chaque produit
    const produitsAvecBenefice = Object.values(beneficeParProduit).map(p => {
      p.benefice = p.chiffre_affaires - p.cout_total;
      p.marge_pct = p.chiffre_affaires > 0 ? ((p.benefice / p.chiffre_affaires) * 100) : 0;
      return p;
    });

    // Trier par bénéfice décroissant
    produitsAvecBenefice.sort((a, b) => b.benefice - a.benefice);

    // Bénéfice par catégorie
    const parCategorie = {};
    produitsAvecBenefice.forEach(p => {
      if (!parCategorie[p.categorie]) {
        parCategorie[p.categorie] = { categorie: p.categorie, chiffre_affaires: 0, cout_total: 0, benefice: 0 };
      }
      parCategorie[p.categorie].chiffre_affaires += p.chiffre_affaires;
      parCategorie[p.categorie].cout_total += p.cout_total;
      parCategorie[p.categorie].benefice += p.benefice;
    });

    // Bénéfice par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const beneficeParMois = {};

    for (const lc of lignesCommandes) {
      if (lc.commande_id && !['annulee', 'remboursee'].includes(lc.commande_id.statut)) {
        const date = new Date(lc.commande_id.date_creation || lc.date_creation);
        if (date >= sixMonthsAgo) {
          const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!beneficeParMois[moisKey]) {
            beneficeParMois[moisKey] = { ca: 0, cout: 0, benefice: 0 };
          }
          const pid = lc.produit_id?.toString();
          const prixAchat = pid && beneficeParProduit[pid] ? beneficeParProduit[pid].prix_achat : 0;
          beneficeParMois[moisKey].ca += lc.prix_total;
          beneficeParMois[moisKey].cout += (prixAchat * lc.quantite);
          beneficeParMois[moisKey].benefice += (lc.prix_total - (prixAchat * lc.quantite));
        }
      }
    }

    // Valeur stock (au prix d'achat)
    const valeurStockAchat = produits.reduce((sum, p) => {
      if (p.stock_illimite) return sum;
      return sum + ((p.prix_achat || 0) * p.stock_quantite);
    }, 0);

    const valeurStockVente = produits.reduce((sum, p) => {
      if (p.stock_illimite) return sum;
      return sum + ((p.prix_promo || p.prix_initial) * p.stock_quantite);
    }, 0);

    const totalBenefice = totalCA - totalCout;
    const margeMoyenne = totalCA > 0 ? ((totalBenefice / totalCA) * 100) : 0;
    const nbProduitsAvecPrixAchat = produits.filter(p => p.prix_achat > 0).length;

    res.json({
      success: true,
      stats: {
        totalCA,
        totalCout,
        totalBenefice,
        margeMoyenne: Math.round(margeMoyenne * 100) / 100,
        valeurStockAchat,
        valeurStockVente,
        beneficePotentielStock: valeurStockVente - valeurStockAchat,
        nbProduits: produits.length,
        nbProduitsAvecPrixAchat
      },
      produits: produitsAvecBenefice,
      parCategorie: Object.values(parCategorie),
      beneficeParMois
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur calcul bénéfice', error: error.message });
  }
};

// Stats pour le proprietaire de boutique
exports.getBoutiqueStats = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ utilisateur_id: req.user._id });
    if (boutiques.length === 0) return res.json({ success: true, stats: null, message: 'Aucune boutique' });
    const boutiqueIds = boutiques.map(b => b._id);
    const totalProduits = await Produit.countDocuments({ boutique_id: { $in: boutiqueIds }, actif: true });
    const lignesCommandes = await LigneCommande.find({ boutique_id: { $in: boutiqueIds } }).populate('commande_id');
    let totalVentes = 0;
    const commandeIds = new Set();
    for (const lc of lignesCommandes) {
      if (lc.commande_id && !['annulee', 'remboursee'].includes(lc.commande_id.statut)) {
        totalVentes += lc.prix_total;
        commandeIds.add(lc.commande_id._id.toString());
      }
    }
    const commandesCount = commandeIds.size;
    const totalAvis = await Avis.countDocuments({ boutique_id: { $in: boutiqueIds } });
    
    // Compter les commandes (pas les lignes) avec statut 'en_attente'
    const commandesEnAttenteResult = await LigneCommande.aggregate([
      { $match: { boutique_id: { $in: boutiqueIds } } },
      { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
      { $unwind: '$commande' },
      { $match: { 'commande.statut': 'en_attente' } },
      { $group: { _id: '$commande_id' } },
      { $count: 'total' }
    ]);
    const commandesEnAttente = commandesEnAttenteResult.length > 0 ? commandesEnAttenteResult[0].total : 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const ventesParMois = await LigneCommande.aggregate([
      { $match: { boutique_id: { $in: boutiqueIds }, date_creation: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date_creation' } }, total: { $sum: '$prix_total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Calculer les commandes par statut
    const commandesParStatut = await LigneCommande.aggregate([
      { $match: { boutique_id: { $in: boutiqueIds } } },
      { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
      { $unwind: '$commande' },
      { $group: { _id: '$commande.statut', count: { $sum: 1 } } },
      { $project: { statut: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      stats: { boutiques, totalProduits, totalVentes, commandesCount, commandesEnAttente, totalAvis, ventesParMois, commandesParStatut }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation stats boutique', error: error.message });
  }
};

// Import stock en masse : créer ou mettre à jour des produits (nom, catégorie, coût, quantité)
exports.importStock = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: 'Données vides ou invalides' });
    }

    const boutiques = await Boutique.find({ utilisateur_id: req.user._id });
    if (boutiques.length === 0) return res.json({ success: false, message: 'Aucune boutique trouvée' });
    const boutique_id = boutiques[0]._id;

    let created = 0;
    let updated = 0;
    const errors = [];

    for (const row of data) {
      try {
        const nom = (row.nom || '').trim();
        const categorie = (row.categorie || '').trim();
        const prix_achat = parseFloat(row.prix_achat);
        const quantite = parseInt(row.quantite, 10);
        const reference_sku = (row.reference_sku || '').trim();

        // Validations
        if (!nom) { errors.push(`Ligne ignorée : nom vide`); continue; }
        if (!categorie) { errors.push(`"${nom}" : catégorie vide`); continue; }
        if (isNaN(prix_achat) || prix_achat < 0) { errors.push(`"${nom}" : prix invalide`); continue; }
        if (isNaN(quantite) || quantite < 0) { errors.push(`"${nom}" : quantité invalide`); continue; }

        // Chercher un produit existant par nom (insensible à la casse) ou reference_sku
        let query = { boutique_id };
        if (reference_sku) {
          query.reference_sku = reference_sku;
        } else {
          query.nom = { $regex: new RegExp('^' + nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') };
        }

        const existingProduit = await Produit.findOne(query);

        if (existingProduit) {
          // Mettre à jour le produit existant
          existingProduit.prix_achat = prix_achat;
          existingProduit.stock_quantite = quantite;
          if (categorie) existingProduit.categorie = categorie;
          if (reference_sku) existingProduit.reference_sku = reference_sku;
          existingProduit.date_modification = new Date();
          await existingProduit.save();
          updated++;
        } else {
          // Créer un nouveau produit
          const slug = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);

          await Produit.create({
            boutique_id,
            nom,
            slug,
            categorie,
            prix_initial: prix_achat, // prix de vente = prix d'achat par défaut (à modifier ensuite)
            prix_achat,
            stock_quantite: quantite,
            stock_seuil_alerte: 5,
            reference_sku: reference_sku || undefined,
            actif: true,
            date_creation: new Date(),
            date_modification: new Date()
          });
          created++;
        }
      } catch (rowError) {
        errors.push(`"${row.nom || 'inconnu'}" : ${rowError.message}`);
      }
    }

    res.json({
      success: true,
      message: `${created} créé(s), ${updated} mis à jour`,
      created,
      updated,
      errors,
      total: data.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur import stock', error: error.message });
  }
};
