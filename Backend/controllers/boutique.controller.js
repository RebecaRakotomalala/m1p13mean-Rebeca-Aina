/**
 * Contrôleur pour les boutiques
 * Utilise Express pour gérer les requêtes/réponses
 * Délègue toute la logique métier au service boutique.service.js
 */

const boutiqueService = require('../services/boutique.service');

// Créer une nouvelle boutique
exports.createBoutique = async (req, res) => {
  try {
    const boutiqueData = req.body;
    const boutique = await boutiqueService.createBoutique(boutiqueData);

    res.status(201).json({
      success: true,
      message: 'Boutique créée avec succès!',
      boutique: boutique
    });
  } catch (error) {
    console.error('Erreur lors de la création de la boutique:', error);
    const statusCode = error.message.includes('requis') || error.message.includes('non trouvé') || error.message.includes('déjà utilisé') ? 
      (error.message.includes('non trouvé') ? 404 : 400) : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la boutique',
      error: error.message
    });
  }
};

// Obtenir toutes les boutiques
exports.getAllBoutiques = async (req, res) => {
  try {
    const { statut, categorie, search } = req.query;
    const boutiques = await boutiqueService.getAllBoutiques({ statut, categorie, search });

    res.json({
      success: true,
      count: boutiques.length,
      boutiques: boutiques
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des boutiques',
      error: error.message
    });
  }
};

// Obtenir une boutique par ID
exports.getBoutiqueById = async (req, res) => {
  try {
    const boutique = await boutiqueService.getBoutiqueById(req.params.id);
    res.json({
      success: true,
      boutique: boutique
    });
  } catch (error) {
    const statusCode = error.message.includes('non trouvée') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la boutique',
      error: error.message
    });
  }
};

// Obtenir les boutiques d'un utilisateur spécifique
exports.getBoutiquesByUserId = async (req, res) => {
  try {
    const boutiques = await boutiqueService.getBoutiquesByUserId(req.params.userId);
    res.json({
      success: true,
      count: boutiques.length,
      boutiques: boutiques
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des boutiques de l\'utilisateur',
      error: error.message
    });
  }
};

// Mettre à jour une boutique
exports.updateBoutique = async (req, res) => {
  try {
    const updatedBoutique = await boutiqueService.updateBoutique(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Boutique mise à jour avec succès!',
      boutique: updatedBoutique
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la boutique:', error);
    const statusCode = error.message.includes('non trouvée') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de la boutique',
      error: error.message
    });
  }
};

// Supprimer une boutique
exports.deleteBoutique = async (req, res) => {
  try {
    await boutiqueService.deleteBoutique(req.params.id);
    res.json({
      success: true,
      message: 'Boutique supprimée avec succès!'
    });
  } catch (error) {
    const statusCode = error.message.includes('non trouvée') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de la boutique',
      error: error.message
    });
  }
};
