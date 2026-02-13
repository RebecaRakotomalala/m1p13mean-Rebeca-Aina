const Avis = require('../models/Avis');
const Produit = require('../models/Produit');
const Boutique = require('../models/Boutique');

// Creer un avis
exports.createAvis = async (req, res) => {
  try {
    const { type, produit_id, boutique_id, note, titre, commentaire, photos } = req.body;
    if (!type || !note) return res.status(400).json({ success: false, message: 'type et note sont requis' });
    if (type === 'produit' && !produit_id) return res.status(400).json({ success: false, message: 'produit_id requis pour avis produit' });
    if (type === 'boutique' && !boutique_id) return res.status(400).json({ success: false, message: 'boutique_id requis pour avis boutique' });

    const avis = new Avis({
      client_id: req.user._id, type, produit_id, boutique_id, note, titre, commentaire, photos: photos || []
    });
    await avis.save();

    // Mettre a jour la note moyenne
    if (type === 'produit' && produit_id) {
      const stats = await Avis.aggregate([
        { $match: { produit_id: avis.produit_id, type: 'produit', approuve: true } },
        { $group: { _id: null, avgNote: { $avg: '$note' }, count: { $sum: 1 } } }
      ]);
      if (stats.length > 0) {
        await Produit.findByIdAndUpdate(produit_id, { note_moyenne: Math.round(stats[0].avgNote * 100) / 100, nombre_avis: stats[0].count });
      }
    }
    if (type === 'boutique' && boutique_id) {
      const stats = await Avis.aggregate([
        { $match: { boutique_id: avis.boutique_id, type: 'boutique', approuve: true } },
        { $group: { _id: null, avgNote: { $avg: '$note' }, count: { $sum: 1 } } }
      ]);
      if (stats.length > 0) {
        await Boutique.findByIdAndUpdate(boutique_id, { note_moyenne: Math.round(stats[0].avgNote * 100) / 100, nombre_avis: stats[0].count });
      }
    }

    res.status(201).json({ success: true, message: 'Avis cree', avis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur creation avis', error: error.message });
  }
};

// Obtenir les avis d'un produit
exports.getAvisByProduit = async (req, res) => {
  try {
    const avis = await Avis.find({ produit_id: req.params.produitId, approuve: true })
      .populate('client_id', 'nom prenom avatar_url')
      .sort({ date_creation: -1 });
    res.json({ success: true, count: avis.length, avis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation avis', error: error.message });
  }
};

// Obtenir les avis d'une boutique
exports.getAvisByBoutique = async (req, res) => {
  try {
    const avis = await Avis.find({ boutique_id: req.params.boutiqueId, approuve: true })
      .populate('client_id', 'nom prenom avatar_url')
      .sort({ date_creation: -1 });
    res.json({ success: true, count: avis.length, avis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation avis', error: error.message });
  }
};

// Repondre a un avis (boutique)
exports.repondreAvis = async (req, res) => {
  try {
    const { reponse_boutique } = req.body;
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ success: false, message: 'Avis non trouve' });
    avis.reponse_boutique = reponse_boutique;
    avis.date_reponse = new Date();
    await avis.save();
    res.json({ success: true, message: 'Reponse ajoutee', avis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur reponse avis', error: error.message });
  }
};

// Mes avis (client)
exports.getMyAvis = async (req, res) => {
  try {
    const avis = await Avis.find({ client_id: req.user._id })
      .populate('produit_id', 'nom image_principale')
      .populate('boutique_id', 'nom logo_url')
      .sort({ date_creation: -1 });
    res.json({ success: true, count: avis.length, avis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation avis', error: error.message });
  }
};
