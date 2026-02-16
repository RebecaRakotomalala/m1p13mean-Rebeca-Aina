/**
 * Service des boutiques
 * Contient toute la logique métier pour la gestion des boutiques
 */

const Boutique = require('../models/Boutique');
const User = require('../models/User');

/**
 * Génère un slug unique à partir d'un nom
 * @param {string} nom - Nom de la boutique
 * @returns {string} - Slug généré
 */
function generateSlug(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les espaces par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
}

/**
 * Génère un slug unique pour une boutique
 * @param {string} nom - Nom de la boutique
 * @param {string} existingSlug - Slug existant (optionnel)
 * @returns {Promise<string>} - Slug unique
 */
async function generateUniqueSlug(nom, existingSlug = null) {
  if (existingSlug) {
    // Vérifier si le slug existe déjà
    const existingBoutique = await Boutique.findOne({ slug: existingSlug });
    if (existingBoutique) {
      throw new Error('Ce slug est déjà utilisé');
    }
    return existingSlug;
  }

  // Générer un slug automatiquement
  let baseSlug = generateSlug(nom);
  let slug = baseSlug;
  let counter = 1;

  // Vérifier l'unicité du slug
  while (await Boutique.findOne({ slug: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Créer une nouvelle boutique
 * @param {Object} boutiqueData - Données de la boutique
 * @returns {Promise<Object>} - Boutique créée
 */
async function createBoutique(boutiqueData) {
  // Validation des champs requis
  if (!boutiqueData.utilisateur_id || !boutiqueData.nom || !boutiqueData.categorie_principale) {
    throw new Error('Les champs requis sont: utilisateur_id, nom, categorie_principale');
  }

  // Vérifier si l'utilisateur existe
  const user = await User.findById(boutiqueData.utilisateur_id);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Générer un slug automatiquement si non fourni
  boutiqueData.slug = await generateUniqueSlug(boutiqueData.nom, boutiqueData.slug);

  // Créer la boutique
  const boutique = new Boutique(boutiqueData);
  await boutique.save();

  // Populate pour obtenir les détails de l'utilisateur
  await boutique.populate('utilisateur_id', 'email nom prenom role');

  return boutique;
}

/**
 * Obtenir toutes les boutiques avec filtres optionnels
 * @param {Object} filters - Filtres (statut, categorie, search)
 * @returns {Promise<Array>} - Liste des boutiques
 */
async function getAllBoutiques(filters = {}) {
  const { statut, categorie, search } = filters;
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

  return boutiques;
}

/**
 * Obtenir une boutique par ID
 * @param {string} boutiqueId - ID de la boutique
 * @returns {Promise<Object>} - Boutique trouvée
 */
async function getBoutiqueById(boutiqueId) {
  const boutique = await Boutique.findById(boutiqueId)
    .populate('utilisateur_id', 'email nom prenom role');
  
  if (!boutique) {
    throw new Error('Boutique non trouvée');
  }

  return boutique;
}

/**
 * Obtenir les boutiques d'un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des boutiques de l'utilisateur
 */
async function getBoutiquesByUserId(userId) {
  const boutiques = await Boutique.find({ utilisateur_id: userId })
    .populate('utilisateur_id', 'email nom prenom role')
    .sort({ date_creation: -1 });

  return boutiques;
}

/**
 * Mettre à jour une boutique
 * @param {string} boutiqueId - ID de la boutique
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} - Boutique mise à jour
 */
async function updateBoutique(boutiqueId, updateData) {
  // Si le nom change, régénérer le slug si nécessaire
  if (updateData.nom) {
    // Ne pas régénérer le slug si un slug est déjà défini et n'a pas changé
    if (!updateData.slug) {
      updateData.slug = await generateUniqueSlug(updateData.nom);
    }
  }

  const updatedBoutique = await Boutique.findByIdAndUpdate(
    boutiqueId,
    updateData,
    { new: true, runValidators: true }
  ).populate('utilisateur_id', 'email nom prenom role');

  if (!updatedBoutique) {
    throw new Error('Boutique non trouvée');
  }

  return updatedBoutique;
}

/**
 * Supprimer une boutique
 * @param {string} boutiqueId - ID de la boutique
 * @returns {Promise<Object>} - Boutique supprimée
 */
async function deleteBoutique(boutiqueId) {
  const deletedBoutique = await Boutique.findByIdAndDelete(boutiqueId);
  
  if (!deletedBoutique) {
    throw new Error('Boutique non trouvée');
  }

  return deletedBoutique;
}

module.exports = {
  createBoutique,
  getAllBoutiques,
  getBoutiqueById,
  getBoutiquesByUserId,
  updateBoutique,
  deleteBoutique,
  generateSlug,
  generateUniqueSlug
};

