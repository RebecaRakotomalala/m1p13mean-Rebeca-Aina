/**
 * Contrôleur pour les boutiques
 * Utilise Express pour gérer les requêtes/réponses
 */

const Boutique = require('../models/Boutique');
const User = require('../models/User');

// Fonction helper pour générer un slug
function generateSlug(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les espaces par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
}

// Créer une nouvelle boutique
exports.createBoutique = async (req, res) => {
  try {
    const boutiqueData = req.body;

    // Validation des champs requis
    if (!boutiqueData.utilisateur_id || !boutiqueData.nom || !boutiqueData.categorie_principale) {
      return res.status(400).json({
        success: false,
        message: 'Les champs requis sont: utilisateur_id, nom, categorie_principale'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(boutiqueData.utilisateur_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Générer un slug automatiquement si non fourni
    if (!boutiqueData.slug) {
      let baseSlug = generateSlug(boutiqueData.nom);
      let slug = baseSlug;
      let counter = 1;

      // Vérifier l'unicité du slug
      while (await Boutique.findOne({ slug: slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      boutiqueData.slug = slug;
    } else {
      // Vérifier si le slug existe déjà
      const existingBoutique = await Boutique.findOne({ slug: boutiqueData.slug });
      if (existingBoutique) {
        return res.status(400).json({
          success: false,
          message: 'Ce slug est déjà utilisé'
        });
      }
    }

    // Créer la boutique
    const boutique = new Boutique(boutiqueData);
    await boutique.save();

    // Populate pour obtenir les détails de l'utilisateur
    await boutique.populate('utilisateur_id', 'email nom prenom role');

    res.status(201).json({
      success: true,
      message: 'Boutique créée avec succès!',
      boutique: boutique
    });
  } catch (error) {
    console.error('Erreur lors de la création de la boutique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la boutique',
      error: error.message
    });
  }
};

// Obtenir toutes les boutiques
exports.getAllBoutiques = async (req, res) => {
  try {
    const { statut, categorie, search } = req.query;
    let query = {};

    // Filtres optionnels
    if (statut) {
      query.statut = statut;
    }
    if (categorie) {
      query.categorie_principale = categorie;
    }
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description_courte: { $regex: search, $options: 'i' } }
      ];
    }

    const boutiques = await Boutique.find(query)
      .populate('utilisateur_id', 'email nom prenom role')
      .sort({ date_creation: -1 });

    res.json({
      success: true,
      count: boutiques.length,
      boutiques: boutiques
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des boutiques',
      error: error.message
    });
  }
};

// Obtenir une boutique par ID
exports.getBoutiqueById = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('utilisateur_id', 'email nom prenom role');
    
    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    res.json({
      success: true,
      boutique: boutique
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la boutique',
      error: error.message
    });
  }
};

// Obtenir les boutiques d'un utilisateur spécifique
exports.getBoutiquesByUserId = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ utilisateur_id: req.params.userId })
      .populate('utilisateur_id', 'email nom prenom role')
      .sort({ date_creation: -1 });

    res.json({
      success: true,
      count: boutiques.length,
      boutiques: boutiques
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des boutiques de l\'utilisateur',
      error: error.message
    });
  }
};

// Mettre à jour une boutique
exports.updateBoutique = async (req, res) => {
  try {
    const updatedBoutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('utilisateur_id', 'email nom prenom role');

    if (!updatedBoutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Boutique mise à jour avec succès!',
      boutique: updatedBoutique
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la boutique:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la boutique',
      error: error.message
    });
  }
};

// Supprimer une boutique
exports.deleteBoutique = async (req, res) => {
  try {
    const deletedBoutique = await Boutique.findByIdAndDelete(req.params.id);
    
    if (!deletedBoutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Boutique supprimée avec succès!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la boutique',
      error: error.message
    });
  }
};

