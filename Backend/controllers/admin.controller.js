const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');
const LigneCommande = require('../models/LigneCommande');
const Avis = require('../models/Avis');

// =============================================
// DASHBOARD & ANALYTICS
// =============================================

// Dashboard stats admin (enrichi)
exports.getDashboardStats = async (req, res) => {
  try {
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalUsers,
      totalClients,
      totalBoutiques,
      boutiquesActives,
      boutiquesEnAttente,
      totalProduits,
      totalCommandes,
      commandesEnAttente,
      commandesLivrees,
      commandesAnnulees,
      caResult,
      caMoisResult,
      commandesRecentes,
      ventesParMois,
      topBoutiques,
      parCategorie,
      nouveauxUsers,
      avisSignales,
      commandesParStatut
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      Boutique.countDocuments(),
      Boutique.countDocuments({ statut: 'active' }),
      Boutique.countDocuments({ statut: 'en_attente' }),
      Produit.countDocuments({ actif: true }),
      Commande.countDocuments(),
      Commande.countDocuments({ statut: 'en_attente' }),
      Commande.countDocuments({ statut: 'livree' }),
      Commande.countDocuments({ statut: 'annulee' }),
      Commande.aggregate([
        { $match: { statut: { $nin: ['annulee', 'remboursee'] } } },
        { $group: { _id: null, total: { $sum: '$montant_total' }, count: { $sum: 1 } } }
      ]),
      Commande.aggregate([
        { $match: { date_creation: { $gte: debutMois }, statut: { $nin: ['annulee', 'remboursee'] } } },
        { $group: { _id: null, total: { $sum: '$montant_total' }, count: { $sum: 1 } } }
      ]),
      Commande.find().populate('client_id', 'nom prenom email').sort({ date_creation: -1 }).limit(10).lean(),
      Commande.aggregate([
        { $match: { date_creation: { $gte: sixMonthsAgo }, statut: { $nin: ['annulee', 'remboursee'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date_creation' } }, total: { $sum: '$montant_total' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      LigneCommande.aggregate([
        { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
        { $unwind: '$commande' },
        { $match: { 'commande.statut': { $nin: ['annulee', 'remboursee'] } } },
        { $group: { _id: '$boutique_id', totalCA: { $sum: '$prix_total' }, totalCommandes: { $sum: 1 } } },
        { $sort: { totalCA: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'boutiques', localField: '_id', foreignField: '_id', as: 'boutique' } },
        { $unwind: '$boutique' },
        { $project: { nom: '$boutique.nom', totalCA: 1, totalCommandes: 1 } }
      ]),
      Boutique.aggregate([
        { $match: { statut: 'active' } },
        { $group: { _id: '$categorie_principale', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.countDocuments({ date_creation: { $gte: debutMois } }),
      Avis.countDocuments({ signale: true, approuve: true }),
      Commande.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } }
      ])
    ]);

    const chiffreAffaires = caResult.length > 0 ? caResult[0].total : 0;
    const commandesValides = caResult.length > 0 ? caResult[0].count : 0;
    const panierMoyen = commandesValides > 0 ? Math.round(chiffreAffaires / commandesValides) : 0;
    const tauxConversion = totalCommandes > 0 ? Math.round((commandesLivrees / totalCommandes) * 100) : 0;
    const caMois = caMoisResult.length > 0 ? caMoisResult[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalUsers, totalClients, totalBoutiques, boutiquesActives, boutiquesEnAttente,
        totalProduits, totalCommandes, commandesEnAttente, commandesLivrees, commandesAnnulees,
        chiffreAffaires, panierMoyen, tauxConversion, caMois, nouveauxUsers, avisSignales,
        ventesParMois, commandesRecentes, topBoutiques, parCategorie, commandesParStatut
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation stats', error: error.message });
  }
};

// =============================================
// GESTION DES BOUTIQUES
// =============================================

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

// Rejeter une boutique
exports.rejeterBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ success: false, message: 'Boutique non trouvee' });
    boutique.statut = 'fermee';
    await boutique.save();
    res.json({ success: true, message: 'Boutique rejetee', boutique });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur rejet boutique', error: error.message });
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

// Detail complet d'une boutique (admin)
exports.getBoutiqueDetail = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id).populate('utilisateur_id', 'nom prenom email telephone');
    if (!boutique) return res.status(404).json({ success: false, message: 'Boutique non trouvee' });

    const totalProduits = await Produit.countDocuments({ boutique_id: boutique._id, actif: true });
    const totalAvis = await Avis.countDocuments({ boutique_id: boutique._id });

    // CA de la boutique
    const caResult = await LigneCommande.aggregate([
      { $match: { boutique_id: boutique._id } },
      { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
      { $unwind: '$commande' },
      { $match: { 'commande.statut': { $nin: ['annulee', 'remboursee'] } } },
      { $group: { _id: null, total: { $sum: '$prix_total' }, count: { $sum: 1 } } }
    ]);
    const chiffreAffaires = caResult.length > 0 ? caResult[0].total : 0;
    const totalCommandes = caResult.length > 0 ? caResult[0].count : 0;

    res.json({
      success: true,
      boutique,
      stats: { totalProduits, totalAvis, chiffreAffaires, totalCommandes }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur detail boutique', error: error.message });
  }
};

// Mettre a jour emplacement d'une boutique
exports.updateEmplacementBoutique = async (req, res) => {
  try {
    const { numero_emplacement, etage, zone, surface_m2 } = req.body;
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ success: false, message: 'Boutique non trouvee' });

    if (numero_emplacement !== undefined) boutique.numero_emplacement = numero_emplacement;
    if (etage !== undefined) boutique.etage = etage;
    if (zone !== undefined) boutique.zone = zone;
    if (surface_m2 !== undefined) boutique.surface_m2 = surface_m2;
    await boutique.save();

    res.json({ success: true, message: 'Emplacement mis a jour', boutique });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise a jour emplacement', error: error.message });
  }
};

// =============================================
// GESTION DES AVIS (MODERATION)
// =============================================

// Lister tous les avis (avec filtres)
exports.getAllAvis = async (req, res) => {
  try {
    const { signale, approuve, page = 1, limit = 20 } = req.query;
    let query = {};
    if (signale === 'true') query.signale = true;
    if (signale === 'false') query.signale = false;
    if (approuve === 'true') query.approuve = true;
    if (approuve === 'false') query.approuve = false;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Avis.countDocuments(query);
    const avis = await Avis.find(query)
      .populate('client_id', 'nom prenom email')
      .populate('produit_id', 'nom image_principale')
      .populate('boutique_id', 'nom logo_url')
      .sort({ date_creation: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: avis.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      avis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation avis', error: error.message });
  }
};

// Moderer un avis (approuver/rejeter)
exports.modererAvis = async (req, res) => {
  try {
    const { approuve, raison_moderation } = req.body;
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ success: false, message: 'Avis non trouve' });

    avis.approuve = approuve;
    avis.modere_par = req.user._id;
    if (raison_moderation) avis.raison_moderation = raison_moderation;
    if (!approuve) avis.signale = false; // Reset le signalement si rejeté
    await avis.save();

    // Recalculer la note moyenne si necessaire
    if (avis.type === 'produit' && avis.produit_id) {
      const stats = await Avis.aggregate([
        { $match: { produit_id: avis.produit_id, type: 'produit', approuve: true } },
        { $group: { _id: null, avgNote: { $avg: '$note' }, count: { $sum: 1 } } }
      ]);
      const avgNote = stats.length > 0 ? Math.round(stats[0].avgNote * 100) / 100 : 0;
      const count = stats.length > 0 ? stats[0].count : 0;
      await Produit.findByIdAndUpdate(avis.produit_id, { note_moyenne: avgNote, nombre_avis: count });
    }
    if (avis.type === 'boutique' && avis.boutique_id) {
      const stats = await Avis.aggregate([
        { $match: { boutique_id: avis.boutique_id, type: 'boutique', approuve: true } },
        { $group: { _id: null, avgNote: { $avg: '$note' }, count: { $sum: 1 } } }
      ]);
      const avgNote = stats.length > 0 ? Math.round(stats[0].avgNote * 100) / 100 : 0;
      const count = stats.length > 0 ? stats[0].count : 0;
      await Boutique.findByIdAndUpdate(avis.boutique_id, { note_moyenne: avgNote, nombre_avis: count });
    }

    res.json({ success: true, message: approuve ? 'Avis approuve' : 'Avis rejete', avis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur moderation avis', error: error.message });
  }
};

// Supprimer un avis
exports.supprimerAvis = async (req, res) => {
  try {
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ success: false, message: 'Avis non trouve' });
    await Avis.findByIdAndDelete(req.params.id);

    // Recalculer la note moyenne
    if (avis.type === 'produit' && avis.produit_id) {
      const stats = await Avis.aggregate([
        { $match: { produit_id: avis.produit_id, type: 'produit', approuve: true } },
        { $group: { _id: null, avgNote: { $avg: '$note' }, count: { $sum: 1 } } }
      ]);
      const avgNote = stats.length > 0 ? Math.round(stats[0].avgNote * 100) / 100 : 0;
      const count = stats.length > 0 ? stats[0].count : 0;
      await Produit.findByIdAndUpdate(avis.produit_id, { note_moyenne: avgNote, nombre_avis: count });
    }
    if (avis.type === 'boutique' && avis.boutique_id) {
      const stats = await Avis.aggregate([
        { $match: { boutique_id: avis.boutique_id, type: 'boutique', approuve: true } },
        { $group: { _id: null, avgNote: { $avg: '$note' }, count: { $sum: 1 } } }
      ]);
      const avgNote = stats.length > 0 ? Math.round(stats[0].avgNote * 100) / 100 : 0;
      const count = stats.length > 0 ? stats[0].count : 0;
      await Boutique.findByIdAndUpdate(avis.boutique_id, { note_moyenne: avgNote, nombre_avis: count });
    }

    res.json({ success: true, message: 'Avis supprime' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression avis', error: error.message });
  }
};

// =============================================
// STATS BOUTIQUE (proprietaire)
// =============================================

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
    const boutiques = await Boutique.find({ utilisateur_id: req.user._id }).select('_id').lean();
    if (boutiques.length === 0) return res.json({ success: true, stats: null, message: 'Aucune boutique' });
    const boutiqueIds = boutiques.map(b => b._id);

    const produits = await Produit.find({ boutique_id: { $in: boutiqueIds } })
      .select('nom categorie prix_initial prix_promo prix_achat stock_quantite stock_illimite image_principale nombre_ventes actif reference_sku')
      .lean();

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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [ventesParProduitAgg, ventesMoisProduitAgg] = await Promise.all([
      LigneCommande.aggregate([
        { $match: { boutique_id: { $in: boutiqueIds } } },
        { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
        { $unwind: '$commande' },
        { $match: { 'commande.statut': { $nin: ['annulee', 'remboursee'] } } },
        {
          $group: {
            _id: '$produit_id',
            total_vendu: { $sum: '$quantite' },
            chiffre_affaires: { $sum: '$prix_total' }
          }
        }
      ]),
      LigneCommande.aggregate([
        { $match: { boutique_id: { $in: boutiqueIds } } },
        { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
        { $unwind: '$commande' },
        { $match: { 'commande.statut': { $nin: ['annulee', 'remboursee'] }, 'commande.date_creation': { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              mois: { $dateToString: { format: '%Y-%m', date: '$commande.date_creation' } },
              produit_id: '$produit_id'
            },
            total_vendu: { $sum: '$quantite' },
            chiffre_affaires: { $sum: '$prix_total' }
          }
        }
      ])
    ]);

    let totalCA = 0;
    let totalCout = 0;
    for (const row of ventesParProduitAgg) {
      const pid = row._id?.toString();
      if (!pid || !beneficeParProduit[pid]) continue;
      const bp = beneficeParProduit[pid];
      bp.total_vendu = row.total_vendu || 0;
      bp.chiffre_affaires = row.chiffre_affaires || 0;
      bp.cout_total = bp.prix_achat * bp.total_vendu;
      totalCA += bp.chiffre_affaires;
      totalCout += bp.cout_total;
    }

    const produitsAvecBenefice = Object.values(beneficeParProduit).map(p => {
      p.benefice = p.chiffre_affaires - p.cout_total;
      p.marge_pct = p.chiffre_affaires > 0 ? ((p.benefice / p.chiffre_affaires) * 100) : 0;
      return p;
    });

    produitsAvecBenefice.sort((a, b) => b.benefice - a.benefice);

    const parCategorie = {};
    produitsAvecBenefice.forEach(p => {
      if (!parCategorie[p.categorie]) {
        parCategorie[p.categorie] = { categorie: p.categorie, chiffre_affaires: 0, cout_total: 0, benefice: 0 };
      }
      parCategorie[p.categorie].chiffre_affaires += p.chiffre_affaires;
      parCategorie[p.categorie].cout_total += p.cout_total;
      parCategorie[p.categorie].benefice += p.benefice;
    });

    const beneficeParMois = {};
    for (const row of ventesMoisProduitAgg) {
      const moisKey = row?._id?.mois;
      const pid = row?._id?.produit_id?.toString();
      if (!moisKey) continue;
      if (!beneficeParMois[moisKey]) beneficeParMois[moisKey] = { ca: 0, cout: 0, benefice: 0 };
      const prixAchat = pid && beneficeParProduit[pid] ? beneficeParProduit[pid].prix_achat : 0;
      const cout = prixAchat * (row.total_vendu || 0);
      const ca = row.chiffre_affaires || 0;
      beneficeParMois[moisKey].ca += ca;
      beneficeParMois[moisKey].cout += cout;
      beneficeParMois[moisKey].benefice += (ca - cout);
    }

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
    const nbProduitsAvecPrixAchat = produits.filter(p => (p.prix_achat || 0) > 0).length;

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
    const boutiques = await Boutique.find({ utilisateur_id: req.user._id }).lean();
    if (boutiques.length === 0) return res.json({ success: true, stats: null, message: 'Aucune boutique' });
    const boutiqueIds = boutiques.map(b => b._id);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalProduits,
      totalAvis,
      ventesAgg,
      commandesEnAttenteResult,
      ventesParMois,
      commandesParStatut,
      categories
    ] = await Promise.all([
      Produit.countDocuments({ boutique_id: { $in: boutiqueIds }, actif: true }),
      Avis.countDocuments({ boutique_id: { $in: boutiqueIds } }),
      LigneCommande.aggregate([
        { $match: { boutique_id: { $in: boutiqueIds } } },
        { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
        { $unwind: '$commande' },
        { $match: { 'commande.statut': { $nin: ['annulee', 'remboursee'] } } },
        {
          $group: {
            _id: null,
            totalVentes: { $sum: '$prix_total' },
            commandes: { $addToSet: '$commande_id' }
          }
        },
        {
          $project: {
            _id: 0,
            totalVentes: 1,
            commandesCount: { $size: '$commandes' }
          }
        }
      ]),
      LigneCommande.aggregate([
      { $match: { boutique_id: { $in: boutiqueIds } } },
      { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
      { $unwind: '$commande' },
      { $match: { 'commande.statut': 'en_attente' } },
      { $group: { _id: '$commande_id' } },
      { $count: 'total' }
      ]),
      LigneCommande.aggregate([
        { $match: { boutique_id: { $in: boutiqueIds } } },
        { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
        { $unwind: '$commande' },
        { $match: { 'commande.statut': { $nin: ['annulee', 'remboursee'] }, date_creation: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date_creation' } }, total: { $sum: '$prix_total' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      LigneCommande.aggregate([
        { $match: { boutique_id: { $in: boutiqueIds } } },
        { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
        { $unwind: '$commande' },
        { $group: { _id: { commande_id: '$commande_id', statut: '$commande.statut' } } },
        { $group: { _id: '$_id.statut', count: { $sum: 1 } } },
        { $project: { statut: '$_id', count: 1, _id: 0 } }
      ]),
      Produit.aggregate([
        { $match: { boutique_id: { $in: boutiqueIds }, actif: true } },
        { $group: { _id: '$categorie', count: { $sum: 1 } } },
        { $project: { _id: 0, nom: { $ifNull: ['$_id', 'Sans catégorie'] }, count: 1 } },
        { $sort: { count: -1, nom: 1 } }
      ])
    ]);

    const totalVentes = ventesAgg.length > 0 ? ventesAgg[0].totalVentes : 0;
    const commandesCount = ventesAgg.length > 0 ? ventesAgg[0].commandesCount : 0;
    const commandesEnAttente = commandesEnAttenteResult.length > 0 ? commandesEnAttenteResult[0].total : 0;

    res.json({
      success: true,
      stats: { boutiques, totalProduits, totalVentes, commandesCount, commandesEnAttente, totalAvis, ventesParMois, commandesParStatut, categories }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation stats boutique', error: error.message });
  }
};

// Import stock en masse : créer ou mettre à jour des produits (nom, catégorie, coût, vente, quantité)
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
        const hasPrixVente = row.prix_vente !== undefined && row.prix_vente !== null && `${row.prix_vente}`.trim() !== '';
        const prix_vente = hasPrixVente ? parseFloat(row.prix_vente) : prix_achat;
        const quantite = parseInt(row.quantite, 10);
        const reference_sku = (row.reference_sku || '').trim();

        // Validations
        if (!nom) { errors.push(`Ligne ignorée : nom vide`); continue; }
        if (!categorie) { errors.push(`"${nom}" : catégorie vide`); continue; }
        if (isNaN(prix_achat) || prix_achat < 0) { errors.push(`"${nom}" : prix d'achat invalide`); continue; }
        if (isNaN(prix_vente) || prix_vente < 0) { errors.push(`"${nom}" : prix de vente invalide`); continue; }
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
          existingProduit.prix_initial = prix_vente;
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
            prix_initial: prix_vente,
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
