const Favori = require('../models/Favori');

// Ajouter/retirer un favori (toggle)
exports.toggleFavori = async (req, res) => {
  try {
    const { type, produit_id, boutique_id } = req.body;
    if (!type) return res.status(400).json({ success: false, message: 'type est requis (produit ou boutique)' });

    const query = { client_id: req.user._id, type };
    if (type === 'produit') query.produit_id = produit_id;
    if (type === 'boutique') query.boutique_id = boutique_id;

    const existing = await Favori.findOne(query);
    if (existing) {
      await Favori.findByIdAndDelete(existing._id);
      res.json({ success: true, message: 'Favori retire', isFavori: false });
    } else {
      const favori = new Favori(query);
      await favori.save();
      res.json({ success: true, message: 'Favori ajoute', isFavori: true, favori });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur toggle favori', error: error.message });
  }
};

// Mes favoris
exports.getMyFavoris = async (req, res) => {
  try {
    const { type } = req.query;
    let query = { client_id: req.user._id };
    if (type) query.type = type;

    const favoris = await Favori.find(query)
      .populate('produit_id', 'nom slug image_principale prix_initial prix_promo note_moyenne boutique_id')
      .populate('boutique_id', 'nom slug logo_url note_moyenne categorie_principale')
      .sort({ date_creation: -1 });
    res.json({ success: true, count: favoris.length, favoris });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation favoris', error: error.message });
  }
};

// Verifier si un item est en favori
exports.checkFavori = async (req, res) => {
  try {
    const { type, id } = req.params;
    let query = { client_id: req.user._id, type };
    if (type === 'produit') query.produit_id = id;
    if (type === 'boutique') query.boutique_id = id;
    const favori = await Favori.findOne(query);
    res.json({ success: true, isFavori: !!favori });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur verification favori', error: error.message });
  }
};
