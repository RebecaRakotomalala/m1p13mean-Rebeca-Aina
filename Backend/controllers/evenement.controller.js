const Evenement = require('../models/Evenement');
const Boutique = require('../models/Boutique');
const BOUTIQUES_ACTIVES_CACHE_TTL_MS = 60000;
let boutiquesActivesCache = { ts: 0, data: null };

// Lister tous les evenements (avec filtres)
exports.getAllEvenements = async (req, res) => {
  try {
    const { statut, type, page = 1, limit = 20 } = req.query;
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (parsedPage - 1) * parsedLimit;
    const query = {};
    if (statut) query.statut = statut;
    if (type) query.type = type;

    const [total, evenements] = await Promise.all([
      Evenement.countDocuments(query),
      Evenement.find(query)
        .select('titre description type date_debut date_fin image_url boutiques_participantes capacite_max lieu statut cree_par date_creation')
        .populate('cree_par', 'nom prenom email')
        .populate('boutiques_participantes', 'nom categorie_principale')
        .sort({ date_debut: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean()
    ]);

    res.json({
      success: true,
      count: evenements.length,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
      evenements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation evenements', error: error.message });
  }
};

// Obtenir un evenement par ID
exports.getEvenementById = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id)
      .populate('cree_par', 'nom prenom email')
      .populate('boutiques_participantes', 'nom logo_url categorie_principale email_contact')
      .lean();
    if (!evenement) return res.status(404).json({ success: false, message: 'Evenement non trouve' });
    res.json({ success: true, evenement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation evenement', error: error.message });
  }
};

// Creer un evenement
exports.createEvenement = async (req, res) => {
  try {
    const { titre, description, type, date_debut, date_fin, image_url, boutiques_participantes, capacite_max, lieu, statut } = req.body;
    
    if (!titre || !date_debut || !date_fin) {
      return res.status(400).json({ success: false, message: 'titre, date_debut et date_fin sont requis' });
    }

    if (new Date(date_fin) <= new Date(date_debut)) {
      return res.status(400).json({ success: false, message: 'La date de fin doit etre apres la date de debut' });
    }

    const evenement = new Evenement({
      titre,
      description,
      type: type || 'promotion',
      date_debut: new Date(date_debut),
      date_fin: new Date(date_fin),
      image_url,
      boutiques_participantes: boutiques_participantes || [],
      capacite_max,
      lieu,
      statut: statut || 'brouillon',
      cree_par: req.user._id
    });
    await evenement.save();

    const populated = await Evenement.findById(evenement._id)
      .populate('cree_par', 'nom prenom email')
      .populate('boutiques_participantes', 'nom logo_url');

    res.status(201).json({ success: true, message: 'Evenement cree', evenement: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur creation evenement', error: error.message });
  }
};

// Mettre a jour un evenement
exports.updateEvenement = async (req, res) => {
  try {
    const { titre, description, type, date_debut, date_fin, image_url, boutiques_participantes, capacite_max, lieu, statut } = req.body;
    
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Evenement non trouve' });

    if (titre !== undefined) evenement.titre = titre;
    if (description !== undefined) evenement.description = description;
    if (type !== undefined) evenement.type = type;
    if (date_debut !== undefined) evenement.date_debut = new Date(date_debut);
    if (date_fin !== undefined) evenement.date_fin = new Date(date_fin);
    if (image_url !== undefined) evenement.image_url = image_url;
    if (boutiques_participantes !== undefined) evenement.boutiques_participantes = boutiques_participantes;
    if (capacite_max !== undefined) evenement.capacite_max = capacite_max;
    if (lieu !== undefined) evenement.lieu = lieu;
    if (statut !== undefined) evenement.statut = statut;

    await evenement.save();

    const populated = await Evenement.findById(evenement._id)
      .populate('cree_par', 'nom prenom email')
      .populate('boutiques_participantes', 'nom logo_url');

    res.json({ success: true, message: 'Evenement mis a jour', evenement: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise a jour evenement', error: error.message });
  }
};

// Supprimer un evenement
exports.deleteEvenement = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Evenement non trouve' });
    await Evenement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Evenement supprime' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression evenement', error: error.message });
  }
};

// Changer le statut d'un evenement
exports.updateStatutEvenement = async (req, res) => {
  try {
    const { statut } = req.body;
    const validStatuts = ['brouillon', 'publie', 'en_cours', 'termine', 'annule'];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Evenement non trouve' });

    evenement.statut = statut;
    await evenement.save();

    res.json({ success: true, message: 'Statut evenement mis a jour', evenement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur changement statut', error: error.message });
  }
};

// Obtenir les boutiques actives (pour le select des participants)
exports.getBoutiquesActives = async (req, res) => {
  try {
    if (boutiquesActivesCache.data && Date.now() - boutiquesActivesCache.ts < BOUTIQUES_ACTIVES_CACHE_TTL_MS) {
      return res.json({ success: true, boutiques: boutiquesActivesCache.data });
    }
    const boutiques = await Boutique.find({ statut: 'active' })
      .select('nom logo_url categorie_principale')
      .sort({ nom: 1 })
      .lean();
    boutiquesActivesCache = { ts: Date.now(), data: boutiques };
    res.json({ success: true, boutiques });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur recuperation boutiques', error: error.message });
  }
};
