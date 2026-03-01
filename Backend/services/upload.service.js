/**
 * Service d'upload d'images vers Cloudinary
 * Contient toute la logique métier pour l'upload d'images
 */

const axios = require('axios');
const FormData = require('form-data');
const http = require('http');
const https = require('https');

// Forcer IPv4 afin d'éviter que Node tente une connexion IPv6 qui finit par
// ETIMEDOUT sur certaines configurations réseau locales. curl bascule rapidement
// vers IPv4, d'où l'apparente contradiction entre le curl qui fonctionne et
// axios qui time-out.
const axiosInstance = axios.create({
  httpAgent: new http.Agent({ family: 4 }),
  httpsAgent: new https.Agent({ family: 4 }),
  timeout: 30000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

// Configuration Cloudinary
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/ddsocampb/image/upload';
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'boutique-upload';

/**
 * Valide le format d'une image base64
 * @param {string} file - Fichier en base64
 * @returns {Object} - { valid: boolean, imageType?: string, imageData?: string }
 */
function validateBase64Image(file) {
  if (!file || typeof file !== 'string' || !file.startsWith('data:image/')) {
    return { valid: false };
  }

  // Extraire les données base64
  const matches = file.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches || matches.length < 3) {
    return { valid: false };
  }

  return {
    valid: true,
    imageType: matches[1],
    imageData: matches[2]
  };
}

/**
 * Upload une image vers Cloudinary
 * @param {string} file - Fichier en base64 (data URI)
 * @param {string} folder - Dossier dans Cloudinary (optionnel)
 * @returns {Promise<Object>} - URL et métadonnées de l'image uploadée
 */
async function uploadImage(file, folder = null) {
  // Validation
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  // Vérifier que c'est bien une string
  if (typeof file !== 'string') {
    throw new Error(`Format de fichier invalide. Type reçu: ${typeof file}, attendu: string (base64)`);
  }

  const validation = validateBase64Image(file);
  if (!validation.valid) {
    console.error('❌ Validation base64 échouée. Début du fichier:', file.substring(0, 100));
    throw new Error('Format de fichier invalide. Attendu: base64 image (data:image/...)');
  }

  // Vérifier que l'upload preset est défini
  if (!UPLOAD_PRESET || UPLOAD_PRESET === 'boutique-upload') {
    console.warn('⚠️  CLOUDINARY_UPLOAD_PRESET non défini, utilisation de la valeur par défaut');
  }

  console.log('📝 Préparation FormData pour Cloudinary...');
  console.log('   Type:', validation.imageType);
  console.log('   Taille données:', validation.imageData.length, 'caractères');
  console.log('   Upload preset:', UPLOAD_PRESET);
  console.log('   Folder:', folder || 'non spécifié');

  // Créer FormData pour Cloudinary
  const formData = new FormData();
  
  // Cloudinary accepte directement les données base64 avec le format data URI
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  if (folder) {
    formData.append('folder', folder);
  }

  console.log('🚀 Envoi vers Cloudinary...');
  const headers = formData.getHeaders();
  console.log('   Content-Type:', headers['content-type']);
  
  // Upload vers Cloudinary avec gestion d'erreur améliorée et répétition automatique
  let response;
  const maxAttempts = 3;
  let attempt = 0;

  // helper de pause
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  while (true) {
    try {
      attempt++;
      response = await axiosInstance.post(CLOUDINARY_URL, formData, {
        headers: headers
      });
      break; // succès, sortir de la boucle
    } catch (axiosError) {
      // si on a une réponse, c'est une erreur de Cloudinary, on ne retry pas
      if (axiosError.response) {
        console.error('❌ Erreur axios:', axiosError.message);
        console.error('   Code:', axiosError.code);
        console.error('   Status:', axiosError.response.status);
        console.error('   Status Text:', axiosError.response.statusText);
        console.error('   Data:', JSON.stringify(axiosError.response.data, null, 2));

        // Erreur spécifique Cloudinary
        if (axiosError.response.data?.error) {
          const cloudinaryError = axiosError.response.data.error;
          const errorMsg = cloudinaryError.message || JSON.stringify(cloudinaryError);
          throw new Error(`Cloudinary Error: ${errorMsg}`);
        }

        // Erreur de validation Cloudinary
        if (axiosError.response.status === 400) {
          throw new Error(`Erreur de validation Cloudinary: ${JSON.stringify(axiosError.response.data)}`);
        }

        // si nous arrivons ici, on renvoie l'erreur originale
        throw axiosError;
      }

      // pas de réponse (probablement un problème réseau)
      console.warn(`⚠️ Tentative ${attempt} échouée : aucune réponse de Cloudinary`);
      console.warn('   axiosError.code:', axiosError.code, 'message:', axiosError.message);
      if (axiosError.config) {
        console.warn('   url:', axiosError.config.url);
      }
      if (attempt >= maxAttempts) {
        console.error('❌ Toutes les tentatives ont échoué, échec de la connexion à Cloudinary');
        if (axiosError.request) {
          throw new Error('Impossible de se connecter à Cloudinary. Vérifiez votre connexion internet et réessayez.');
        }
        throw axiosError;
      }
      // attendre un peu avant de réessayer (backoff exponentiel)
      const delay = 1000 * attempt;
      console.log(`   Attente de ${delay}ms avant la prochaine tentative...`);
      await wait(delay);
      continue; // retenter
    }
  }

  console.log('✅ Upload réussi vers Cloudinary');
  console.log('   URL:', response.data.secure_url || response.data.url);

  return {
    url: response.data.secure_url || response.data.url,
    public_id: response.data.public_id,
    width: response.data.width,
    height: response.data.height
  };
}

/**
 * Upload multiple images vers Cloudinary
 * @param {Array<string>} files - Tableau de fichiers en base64
 * @param {string} folder - Dossier dans Cloudinary (optionnel)
 * @returns {Promise<Array<string>>} - URLs des images uploadées
 */
async function uploadMultipleImages(files, folder = null) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error('Aucun fichier fourni');
  }

  const results = [];
  const uploadFolder = folder || 'boutiques/galerie';

  // Upload chaque fichier
  for (const file of files) {
    try {
      // Vérifier que c'est une image base64
      const validation = validateBase64Image(file);
      if (!validation.valid) {
        results.push(null);
        continue;
      }

      // Créer FormData pour Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', uploadFolder);

      // Upload vers Cloudinary avec répétition en cas de problème réseau
      let response;
      const maxAttemptsMulti = 3;
      let attemptMulti = 0;
      const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

      while (true) {
        try {
          attemptMulti++;
          response = await axiosInstance.post(CLOUDINARY_URL, formData, {
            headers: formData.getHeaders()
          });
          break;
        } catch (err) {
          if (err.response) {
            // délégué à la boucle extérieure pour le logging
            throw err;
          }
          console.warn(`⚠️ Tentative ${attemptMulti} pour upload multiple échouée (sans réponse)`);
          if (attemptMulti >= maxAttemptsMulti) {
            console.error('❌ Échec de toutes les tentatives pour ce fichier');
            throw new Error('Impossible de se connecter à Cloudinary. Vérifiez votre connexion internet.');
          }
          const delay = 1000 * attemptMulti;
          console.log(`   Attente de ${delay}ms avant prochaine tentative de ce fichier...`);
          await wait(delay);
          continue;
        }
      }

      results.push(response.data.secure_url || response.data.url);
    } catch (error) {
      console.error('Erreur upload image:', error);
      results.push(null);
    }
  }

  const successfulUploads = results.filter(url => url !== null);
  
  if (successfulUploads.length === 0) {
    throw new Error('Aucune image n\'a pu être uploadée');
  }

  return successfulUploads;
}

module.exports = {
  uploadImage,
  uploadMultipleImages,
  validateBase64Image
};

