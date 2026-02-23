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
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalBoutiques = await Boutique.countDocuments();
    const boutiquesActives = await Boutique.countDocuments({ statut: 'active' });
    const boutiquesEnAttente = await Boutique.countDocuments({ statut: 'en_attente' });
    const totalProduits = await Produit.countDocuments({ actif: true });
    const totalCommandes = await Commande.countDocuments();
    const commandesEnAttente = await Commande.countDocuments({ statut: 'en_attente' });
    const commandesLivrees = await Commande.countDocuments({ statut: 'livree' });
    const commandesAnnulees = await Commande.countDocuments({ statut: 'annulee' });

    // Chiffre d'affaires global
    const caResult = await Commande.aggregate([
      { $match: { statut: { $nin: ['annulee', 'remboursee'] } } },
      { $group: { _id: null, total: { $sum: '$montant_total' }, count: { $sum: 1 } } }
    ]);
    const chiffreAffaires = caResult.length > 0 ? caResult[0].total : 0;
    const commandesValides = caResult.length > 0 ? caResult[0].count : 0;

    // Panier moyen
    const panierMoyen = commandesValides > 0 ? Math.round(chiffreAffaires / commandesValides) : 0;

    // Taux de conversion (commandes livrees / total commandes)
    const tauxConversion = totalCommandes > 0 ? Math.round((commandesLivrees / totalCommandes) * 100) : 0;

    // CA du mois en cours
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    const caMoisResult = await Commande.aggregate([
      { $match: { date_creation: { $gte: debutMois }, statut: { $nin: ['annulee', 'remboursee'] } } },
      { $group: { _id: null, total: { $sum: '$montant_total' }, count: { $sum: 1 } } }
    ]);
    const caMois = caMoisResult.length > 0 ? caMoisResult[0].total : 0;

    // Commandes recentes
    const commandesRecentes = await Commande.find()
      .populate('client_id', 'nom prenom email')
      .sort({ date_creation: -1 }).limit(10);

    // Ventes par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const ventesParMois = await Commande.aggregate([
      { $match: { date_creation: { $gte: sixMonthsAgo }, statut: { $nin: ['annulee', 'remboursee'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date_creation' } }, total: { $sum: '$montant_total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Top 5 boutiques par CA
    const topBoutiques = await LigneCommande.aggregate([
      { $lookup: { from: 'commandes', localField: 'commande_id', foreignField: '_id', as: 'commande' } },
      { $unwind: '$commande' },
      { $match: { 'commande.statut': { $nin: ['annulee', 'remboursee'] } } },
      { $group: { _id: '$boutique_id', totalCA: { $sum: '$prix_total' }, totalCommandes: { $sum: 1 } } },
      { $sort: { totalCA: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'boutiques', localField: '_id', foreignField: '_id', as: 'boutique' } },
      { $unwind: '$boutique' },
      { $project: { nom: '$boutique.nom', totalCA: 1, totalCommandes: 1 } }
    ]);

    // Repartition par categorie de boutique
    const parCategorie = await Boutique.aggregate([
      { $match: { statut: 'active' } },
      { $group: { _id: '$categorie_principale', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Nouveaux utilisateurs ce mois
    const nouveauxUsers = await User.countDocuments({ date_creation: { $gte: debutMois } });

    // Avis signales
    const avisSignales = await Avis.countDocuments({ signale: true, approuve: true });

    // Commandes par statut
    const commandesParStatut = await Commande.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

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
    const commandesEnAttente = await LigneCommande.countDocuments({ boutique_id: { $in: boutiqueIds }, statut: 'en_attente' });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const ventesParMois = await LigneCommande.aggregate([
      { $match: { boutique_id: { $in: boutiqueIds }, date_creation: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date_creation' } }, total: { $sum: '$prix_total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: { boutiques, totalProduits, totalVentes, commandesCount, commandesEnAttente, totalAvis, ventesParMois }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation stats boutique', error: error.message });
  }
};
