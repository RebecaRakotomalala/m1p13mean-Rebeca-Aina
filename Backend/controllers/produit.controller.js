const Produit = require('../models/Produit');
const Boutique = require('../models/Boutique');

function generateSlug(nom) {
  return nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Creer un produit (boutique owner)
exports.createProduit = async (req, res) => {
  try {
    const produitData = req.body;
    // Verifier que la boutique appartient a l'utilisateur
    const boutique = await Boutique.findOne({ _id: produitData.boutique_id, utilisateur_id: req.user._id });
    if (!boutique && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Vous ne pouvez ajouter des produits que dans votre boutique' });
    }
    if (!produitData.nom || !produitData.categorie || produitData.prix_initial === undefined) {
      return res.status(400).json({ success: false, message: 'Champs requis: nom, categorie, prix_initial' });
    }
    // Generer slug
    if (!produitData.slug) {
      let baseSlug = generateSlug(produitData.nom);
      let slug = baseSlug;
      let counter = 1;
      while (await Produit.findOne({ slug })) { slug = baseSlug + '-' + counter; counter++; }
      produitData.slug = slug;
    }
    const produit = new Produit(produitData);
    await produit.save();
    await produit.populate('boutique_id', 'nom slug logo_url');
    res.status(201).json({ success: true, message: 'Produit cree avec succes', produit });
  } catch (error) {
    console.error('Erreur creation produit:', error);
    res.status(500).json({ success: false, message: 'Erreur creation produit', error: error.message });
  }
};

// Obtenir tous les produits (avec filtres)
exports.getAllProduits = async (req, res) => {
  try {
    const { categorie, boutique_id, search, min_prix, max_prix, sort_by, page = 1, limit = 20, nouveau, coup_de_coeur } = req.query;
    let query = { actif: true };
    if (categorie) query.categorie = categorie;
    if (boutique_id) query.boutique_id = boutique_id;
    if (nouveau === 'true') query.nouveau = true;
    if (coup_de_coeur === 'true') query.coup_de_coeur = true;
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description_courte: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    if (min_prix || max_prix) {
      query.prix_initial = {};
      if (min_prix) query.prix_initial.$gte = Number(min_prix);
      if (max_prix) query.prix_initial.$lte = Number(max_prix);
    }
    let sortOption = { date_creation: -1 };
    if (sort_by === 'prix_asc') sortOption = { prix_initial: 1 };
    if (sort_by === 'prix_desc') sortOption = { prix_initial: -1 };
    if (sort_by === 'nom') sortOption = { nom: 1 };
    if (sort_by === 'populaire') sortOption = { nombre_ventes: -1 };
    if (sort_by === 'note') sortOption = { note_moyenne: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Produit.countDocuments(query);
    const produits = await Produit.find(query)
      .populate('boutique_id', 'nom slug logo_url')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: produits.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), produits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation produits', error: error.message });
  }
};

// Obtenir un produit par ID
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id).populate('boutique_id', 'nom slug logo_url email_contact telephone_contact');
    if (!produit) return res.status(404).json({ success: false, message: 'Produit non trouve' });
    // Incrementer vues
    produit.nombre_vues += 1;
    await produit.save();
    res.json({ success: true, produit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation produit', error: error.message });
  }
};

// Obtenir les produits d'une boutique
exports.getProduitsByBoutique = async (req, res) => {
  try {
    const produits = await Produit.find({ boutique_id: req.params.boutiqueId, actif: true })
      .populate('boutique_id', 'nom slug logo_url')
      .sort({ date_creation: -1 });
    res.json({ success: true, count: produits.length, produits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation produits boutique', error: error.message });
  }
};

// Mettre a jour un produit
exports.updateProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ success: false, message: 'Produit non trouve' });
    // Verifier proprietaire
    if (req.user.role !== 'admin') {
      const boutique = await Boutique.findOne({ _id: produit.boutique_id, utilisateur_id: req.user._id });
      if (!boutique) return res.status(403).json({ success: false, message: 'Non autorise' });
    }
    const updated = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('boutique_id', 'nom slug logo_url');
    res.json({ success: true, message: 'Produit mis a jour', produit: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise a jour produit', error: error.message });
  }
};

// Supprimer un produit
exports.deleteProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ success: false, message: 'Produit non trouve' });
    if (req.user.role !== 'admin') {
      const boutique = await Boutique.findOne({ _id: produit.boutique_id, utilisateur_id: req.user._id });
      if (!boutique) return res.status(403).json({ success: false, message: 'Non autorise' });
    }
    await Produit.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Produit supprime' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression produit', error: error.message });
  }
};

// Mes produits (boutique owner)
exports.getMyProduits = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ utilisateur_id: req.user._id });
    const boutiqueIds = boutiques.map(b => b._id);
    const produits = await Produit.find({ boutique_id: { $in: boutiqueIds } })
      .populate('boutique_id', 'nom slug logo_url')
      .sort({ date_creation: -1 });
    res.json({ success: true, count: produits.length, produits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation mes produits', error: error.message });
  }
};
