const Panier = require('../models/Panier');
const LignePanier = require('../models/LignePanier');
const Produit = require('../models/Produit');

// Obtenir le panier actif du client
exports.getMyPanier = async (req, res) => {
  try {
    let panier = await Panier.findOne({ client_id: req.user._id, statut: 'actif' });
    if (!panier) {
      panier = new Panier({ client_id: req.user._id, statut: 'actif' });
      await panier.save();
    }
    const lignes = await LignePanier.find({ panier_id: panier._id })
      .populate({ path: 'produit_id', select: 'nom slug image_principale prix_initial prix_promo stock_quantite boutique_id', populate: { path: 'boutique_id', select: 'nom slug' } });
    
    let total = 0;
    const items = lignes.map(l => {
      const prix = l.produit_id && l.produit_id.prix_promo ? l.produit_id.prix_promo : (l.produit_id ? l.produit_id.prix_initial : 0);
      const sousTotal = prix * l.quantite;
      total += sousTotal;
      return { _id: l._id, produit: l.produit_id, quantite: l.quantite, prix_unitaire: prix, sous_total: sousTotal, variation_selectionnee: l.variation_selectionnee };
    });

    res.json({ success: true, panier: { _id: panier._id, items, total, nombre_items: items.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation panier', error: error.message });
  }
};

// Ajouter un produit au panier
exports.addToPanier = async (req, res) => {
  try {
    const { produit_id, quantite = 1, variation_selectionnee } = req.body;
    if (!produit_id) return res.status(400).json({ success: false, message: 'produit_id est requis' });
    
    const produit = await Produit.findById(produit_id);
    if (!produit || !produit.actif) return res.status(404).json({ success: false, message: 'Produit non trouve ou inactif' });
    if (!produit.stock_illimite && produit.stock_quantite < quantite) {
      return res.status(400).json({ success: false, message: 'Stock insuffisant' });
    }

    let panier = await Panier.findOne({ client_id: req.user._id, statut: 'actif' });
    if (!panier) {
      panier = new Panier({ client_id: req.user._id, statut: 'actif' });
      await panier.save();
    }

    // Verifier si le produit est deja dans le panier
    let ligne = await LignePanier.findOne({ panier_id: panier._id, produit_id: produit_id });
    if (ligne) {
      ligne.quantite += Number(quantite);
      await ligne.save();
    } else {
      ligne = new LignePanier({ panier_id: panier._id, produit_id, quantite: Number(quantite), variation_selectionnee });
      await ligne.save();
    }

    res.json({ success: true, message: 'Produit ajoute au panier', ligne });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur ajout au panier', error: error.message });
  }
};

// Modifier la quantite d'un item
exports.updateQuantite = async (req, res) => {
  try {
    const { quantite } = req.body;
    if (!quantite || quantite < 1) return res.status(400).json({ success: false, message: 'Quantite invalide' });

    const ligne = await LignePanier.findById(req.params.ligneId);
    if (!ligne) return res.status(404).json({ success: false, message: 'Item non trouve' });

    const panier = await Panier.findOne({ _id: ligne.panier_id, client_id: req.user._id });
    if (!panier) return res.status(403).json({ success: false, message: 'Non autorise' });

    ligne.quantite = Number(quantite);
    await ligne.save();
    res.json({ success: true, message: 'Quantite mise a jour', ligne });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise a jour quantite', error: error.message });
  }
};

// Supprimer un item du panier
exports.removeFromPanier = async (req, res) => {
  try {
    const ligne = await LignePanier.findById(req.params.ligneId);
    if (!ligne) return res.status(404).json({ success: false, message: 'Item non trouve' });

    const panier = await Panier.findOne({ _id: ligne.panier_id, client_id: req.user._id });
    if (!panier) return res.status(403).json({ success: false, message: 'Non autorise' });

    await LignePanier.findByIdAndDelete(req.params.ligneId);
    res.json({ success: true, message: 'Item supprime du panier' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression item', error: error.message });
  }
};

// Vider le panier
exports.clearPanier = async (req, res) => {
  try {
    const panier = await Panier.findOne({ client_id: req.user._id, statut: 'actif' });
    if (!panier) return res.status(404).json({ success: false, message: 'Panier non trouve' });

    await LignePanier.deleteMany({ panier_id: panier._id });
    res.json({ success: true, message: 'Panier vide' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur vidage panier', error: error.message });
  }
};
