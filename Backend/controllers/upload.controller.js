/**
 * Contrôleur pour les uploads d'images vers Cloudinary
 * Utilise Express pour gérer les requêtes/réponses
 * Accepte les fichiers en base64 depuis le frontend
 */

const axios = require('axios');
const FormData = require('form-data');

// Configuration Cloudinary
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/ddsocampb/image/upload';
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'boutique-upload';

// Upload une image vers Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    console.log('📤 Upload image - Début');
    console.log('Body reçu:', { file: req.body.file ? 'présent' : 'absent', folder: req.body.folder });
    
    const { file, folder } = req.body;

    if (!file) {
      console.error('❌ Aucun fichier fourni');
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    // Vérifier que c'est une image base64
    if (typeof file !== 'string' || !file.startsWith('data:image/')) {
      console.error('❌ Format de fichier invalide:', typeof file, file.substring(0, 50));
      return res.status(400).json({
        success: false,
        message: 'Format de fichier invalide. Attendu: base64 image'
      });
    }

    // Extraire les données base64
    const matches = file.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      console.error('❌ Format base64 invalide');
      return res.status(400).json({
        success: false,
        message: 'Format base64 invalide'
      });
    }

    const imageType = matches[1];
    const imageData = matches[2];

    console.log('📝 Préparation FormData pour Cloudinary...');
    console.log('   Type:', imageType);
    console.log('   Taille données:', imageData.length, 'caractères');
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
    
    // Upload vers Cloudinary avec gestion d'erreur améliorée
    let response;
    try {
      response = await axios.post(CLOUDINARY_URL, formData, {
        headers: headers,
        timeout: 30000, // 30 secondes timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
    } catch (axiosError) {
      console.error('❌ Erreur axios:', axiosError.message);
      if (axiosError.response) {
        console.error('   Status:', axiosError.response.status);
        console.error('   Data:', JSON.stringify(axiosError.response.data, null, 2));
        
        // Erreur spécifique Cloudinary
        if (axiosError.response.data?.error) {
          throw new Error(`Cloudinary Error: ${axiosError.response.data.error.message || axiosError.response.data.error}`);
        }
      }
      throw axiosError;
    }

    console.log('✅ Upload réussi vers Cloudinary');
    console.log('   URL:', response.data.secure_url || response.data.url);

    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      url: response.data.secure_url || response.data.url,
      public_id: response.data.public_id,
      width: response.data.width,
      height: response.data.height
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }

    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        'Erreur inconnue lors de l\'upload';

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de l\'image',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (req, res) => {
  try {
    const { files, folder } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const results = [];
    const uploadFolder = folder || 'boutiques/galerie';

    // Upload chaque fichier
    for (const file of files) {
      try {
        // Vérifier que c'est une image base64
        if (!file.startsWith('data:image/')) {
          results.push(null);
          continue;
        }

        // Extraire les données base64
        const matches = file.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          results.push(null);
          continue;
        }

        const imageType = matches[1];
        const imageData = matches[2];

        // Créer FormData pour Cloudinary
        const formData = new FormData();
        formData.append('file', `data:image/${imageType};base64,${imageData}`);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', uploadFolder);

        // Upload vers Cloudinary
        const response = await axios.post(CLOUDINARY_URL, formData, {
          headers: formData.getHeaders()
        });

        results.push(response.data.secure_url || response.data.url);
      } catch (error) {
        console.error('Erreur upload image:', error);
        results.push(null);
      }
    }

    const successfulUploads = results.filter(url => url !== null);

    res.json({
      success: true,
      message: `${successfulUploads.length} image(s) uploadée(s) avec succès`,
      urls: successfulUploads
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload des images',
      error: error.message
    });
  }
};

