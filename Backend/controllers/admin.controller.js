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
