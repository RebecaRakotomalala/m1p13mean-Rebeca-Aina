const Commande = require('../models/Commande');
const LigneCommande = require('../models/LigneCommande');
const Panier = require('../models/Panier');
const LignePanier = require('../models/LignePanier');
const Produit = require('../models/Produit');
const Boutique = require('../models/Boutique');

function generateNumeroCommande() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return 'CMD-' + y + m + d + '-' + rand;
}

// Creer une commande a partir du panier
exports.createCommande = async (req, res) => {
  try {
    const { adresse_livraison, methode_paiement, mode_livraison, note_client } = req.body;
    
    const panier = await Panier.findOne({ client_id: req.user._id, statut: 'actif' });
    if (!panier) return res.status(400).json({ success: false, message: 'Panier vide ou non trouve' });

    const lignesPanier = await LignePanier.find({ panier_id: panier._id }).populate('produit_id');
    if (lignesPanier.length === 0) return res.status(400).json({ success: false, message: 'Panier vide' });

    let sous_total = 0;
    const lignesData = [];
    for (const lp of lignesPanier) {
      const produit = lp.produit_id;
      if (!produit || !produit.actif) continue;
      const prix = produit.prix_promo || produit.prix_initial;
      const prixTotal = prix * lp.quantite;
      sous_total += prixTotal;
      lignesData.push({
        boutique_id: produit.boutique_id,
        produit_id: produit._id,
        nom_produit: produit.nom,
        reference_sku: produit.reference_sku,
        image_produit: produit.image_principale,
        prix_unitaire: prix,
        quantite: lp.quantite,
        prix_total: prixTotal,
        variation_selectionnee: lp.variation_selectionnee
      });
    }

    if (lignesData.length === 0) return res.status(400).json({ success: false, message: 'Aucun produit valide dans le panier' });

    const frais_livraison = mode_livraison === 'livraison_domicile' ? 5000 : 0;
    const montant_total = sous_total + frais_livraison;

    const commande = new Commande({
      numero_commande: generateNumeroCommande(),
      client_id: req.user._id,
      client_nom: req.user.nom + (req.user.prenom ? ' ' + req.user.prenom : ''),
      client_email: req.user.email,
      client_telephone: req.user.telephone,
      adresse_livraison: adresse_livraison || {},
      sous_total, frais_livraison, montant_total,
      methode_paiement: methode_paiement || 'especes',
      mode_livraison: mode_livraison || 'retrait_boutique',
      note_client, statut: 'en_attente', statut_paiement: 'en_attente'
    });
    await commande.save();

    // Creer les lignes de commande
    for (const ld of lignesData) {
      const lc = new LigneCommande({ commande_id: commande._id, ...ld });
      await lc.save();
      // Mettre a jour le stock
      await Produit.findByIdAndUpdate(ld.produit_id, { $inc: { stock_quantite: -ld.quantite, nombre_ventes: ld.quantite } });
    }

    // Marquer le panier comme converti
    panier.statut = 'converti';
    panier.date_conversion = new Date();
    await panier.save();
    await LignePanier.deleteMany({ panier_id: panier._id });

    const lignesCommande = await LigneCommande.find({ commande_id: commande._id }).populate('boutique_id', 'nom slug').populate('produit_id', 'nom image_principale');
    res.status(201).json({ success: true, message: 'Commande creee avec succes', commande, lignes: lignesCommande });
  } catch (error) {
    console.error('Erreur creation commande:', error);
    res.status(500).json({ success: false, message: 'Erreur creation commande', error: error.message });
  }
};

// Mes commandes (client)
exports.getMyCommandes = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const query = { client_id: req.user._id };

    const [total, commandes] = await Promise.all([
      Commande.countDocuments(query),
      Commande.find(query).sort({ date_creation: -1 }).skip(skip).limit(limit).lean()
    ]);

    const commandeIds = commandes.map((c) => c._id);
    const lignes = commandeIds.length
      ? await LigneCommande.find({ commande_id: { $in: commandeIds } })
        .populate('boutique_id', 'nom slug logo_url')
        .lean()
      : [];

    const lignesMap = new Map();
    for (const l of lignes) {
      const key = String(l.commande_id);
      if (!lignesMap.has(key)) lignesMap.set(key, []);
      lignesMap.get(key).push(l);
    }

    const result = commandes.map((cmd) => ({
      ...cmd,
      lignes: lignesMap.get(String(cmd._id)) || []
    }));

    res.json({
      success: true,
      count: result.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      commandes: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation commandes', error: error.message });
  }
};

// Commandes pour une boutique
exports.getCommandesBoutique = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const boutiques = await Boutique.find({ utilisateur_id: req.user._id }).select('_id').lean();
    const boutiqueIds = boutiques.map(b => b._id);
    if (!boutiqueIds.length) {
      return res.json({ success: true, count: 0, total: 0, page, pages: 0, commandes: [] });
    }

    // Paginer d'abord les IDs de commandes uniques pour eviter de charger toutes les lignes.
    const aggregateIds = await LigneCommande.aggregate([
      { $match: { boutique_id: { $in: boutiqueIds } } },
      {
        $group: {
          _id: '$commande_id',
          date_creation: { $max: '$date_creation' }
        }
      },
      { $sort: { date_creation: -1 } },
      { $facet: {
        meta: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }]
      }}
    ]);

    const total = aggregateIds?.[0]?.meta?.[0]?.total || 0;
    const commandeIds = (aggregateIds?.[0]?.data || []).map((d) => d._id);

    if (!commandeIds.length) {
      return res.json({ success: true, count: 0, total, page, pages: Math.ceil(total / limit), commandes: [] });
    }

    const [commandesRaw, lignes] = await Promise.all([
      Commande.find({ _id: { $in: commandeIds } }).lean(),
      LigneCommande.find({ commande_id: { $in: commandeIds }, boutique_id: { $in: boutiqueIds } })
        .populate('produit_id', 'nom image_principale')
        .lean()
    ]);

    const commandesMap = new Map();
    for (const cmd of commandesRaw) {
      commandesMap.set(String(cmd._id), { ...cmd, lignes: [] });
    }
    for (const l of lignes) {
      const key = String(l.commande_id);
      if (commandesMap.has(key)) commandesMap.get(key).lignes.push(l);
    }

    // Conserver l'ordre paginé calculé par agrégation.
    const commandes = commandeIds
      .map((id) => commandesMap.get(String(id)))
      .filter(Boolean);

    res.json({ success: true, count: commandes.length, total, page, pages: Math.ceil(total / limit), commandes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation commandes boutique', error: error.message });
  }
};

// Toutes les commandes (admin)
exports.getAllCommandes = async (req, res) => {
  try {
    const {
      statut,
      statut_paiement: statutPaiement,
      mode_livraison: modeLivraison,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    if (statut) query.statut = statut;
    if (statutPaiement) query.statut_paiement = statutPaiement;
    if (modeLivraison) query.mode_livraison = modeLivraison;
    if (search) {
      query.$or = [
        { numero_commande: { $regex: search, $options: 'i' } },
        { client_nom: { $regex: search, $options: 'i' } },
        { client_email: { $regex: search, $options: 'i' } }
      ];
    }

    if (dateFrom || dateTo) {
      query.date_creation = {};
      if (dateFrom) {
        const fromDate = new Date(String(dateFrom));
        if (!Number.isNaN(fromDate.getTime())) query.date_creation.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(String(dateTo));
        if (!Number.isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          query.date_creation.$lte = toDate;
        }
      }
      if (Object.keys(query.date_creation).length === 0) delete query.date_creation;
    }

    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, commandes] = await Promise.all([
      Commande.countDocuments(query),
      Commande.find(query)
        .populate('client_id', 'nom prenom email')
        .sort({ date_creation: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean()
    ]);

    const commandeIds = commandes.map((c) => c._id);
    const lignes = commandeIds.length > 0
      ? await LigneCommande.find({ commande_id: { $in: commandeIds } })
        .populate('boutique_id', 'nom slug')
        .lean()
      : [];

    const lignesByCommande = new Map();
    for (const ligne of lignes) {
      const key = String(ligne.commande_id);
      if (!lignesByCommande.has(key)) lignesByCommande.set(key, []);
      lignesByCommande.get(key).push(ligne);
    }

    const result = commandes.map((cmd) => ({
      ...cmd,
      lignes: lignesByCommande.get(String(cmd._id)) || []
    }));

    res.json({
      success: true,
      count: result.length,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
      commandes: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation commandes', error: error.message });
  }
};

// Detail d'une commande
exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate('client_id', 'nom prenom email telephone');
    if (!commande) return res.status(404).json({ success: false, message: 'Commande non trouvee' });
    const lignes = await LigneCommande.find({ commande_id: commande._id }).populate('boutique_id', 'nom slug logo_url').populate('produit_id', 'nom image_principale');
    res.json({ success: true, commande: { ...commande.toObject(), lignes } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation commande', error: error.message });
  }
};

// Mettre a jour le statut d'une commande
exports.updateStatutCommande = async (req, res) => {
  try {
    const { statut } = req.body;
    const validStatuts = ['en_attente', 'confirmee', 'en_preparation', 'prete', 'en_livraison', 'livree', 'annulee'];
    if (!validStatuts.includes(statut)) return res.status(400).json({ success: false, message: 'Statut invalide' });

    const commande = await Commande.findById(req.params.id);
    if (!commande) return res.status(404).json({ success: false, message: 'Commande non trouvee' });

    commande.statut = statut;
    if (statut === 'confirmee') { commande.date_confirmation = new Date(); commande.statut_paiement = 'paye'; }
    if (statut === 'en_preparation') commande.date_preparation = new Date();
    if (statut === 'prete') commande.date_prete = new Date();
    if (statut === 'livree') commande.date_livraison = new Date();
    if (statut === 'annulee') { commande.date_annulation = new Date(); commande.raison_annulation = req.body.raison || ''; }
    await commande.save();

    // Mettre a jour les lignes de commande
    await LigneCommande.updateMany({ commande_id: commande._id }, { statut });

    res.json({ success: true, message: 'Statut commande mis a jour', commande });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise a jour statut', error: error.message });
  }
};
