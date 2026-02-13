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
    const commandes = await Commande.find({ client_id: req.user._id }).sort({ date_creation: -1 });
    const result = [];
    for (const cmd of commandes) {
      const lignes = await LigneCommande.find({ commande_id: cmd._id }).populate('boutique_id', 'nom slug logo_url');
      result.push({ ...cmd.toObject(), lignes });
    }
    res.json({ success: true, count: result.length, commandes: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation commandes', error: error.message });
  }
};

// Commandes pour une boutique
exports.getCommandesBoutique = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ utilisateur_id: req.user._id });
    const boutiqueIds = boutiques.map(b => b._id);
    const lignes = await LigneCommande.find({ boutique_id: { $in: boutiqueIds } })
      .populate('commande_id')
      .populate('produit_id', 'nom image_principale')
      .sort({ date_creation: -1 });
    
    // Grouper par commande
    const commandesMap = {};
    for (const l of lignes) {
      if (!l.commande_id) continue;
      const cmdId = l.commande_id._id.toString();
      if (!commandesMap[cmdId]) {
        commandesMap[cmdId] = { ...l.commande_id.toObject(), lignes: [] };
      }
      commandesMap[cmdId].lignes.push(l);
    }
    const commandes = Object.values(commandesMap).sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
    res.json({ success: true, count: commandes.length, commandes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation commandes boutique', error: error.message });
  }
};

// Toutes les commandes (admin)
exports.getAllCommandes = async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    let query = {};
    if (statut) query.statut = statut;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Commande.countDocuments(query);
    const commandes = await Commande.find(query).populate('client_id', 'nom prenom email').sort({ date_creation: -1 }).skip(skip).limit(Number(limit));
    
    const result = [];
    for (const cmd of commandes) {
      const lignes = await LigneCommande.find({ commande_id: cmd._id }).populate('boutique_id', 'nom slug');
      result.push({ ...cmd.toObject(), lignes });
    }
    res.json({ success: true, count: result.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), commandes: result });
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
