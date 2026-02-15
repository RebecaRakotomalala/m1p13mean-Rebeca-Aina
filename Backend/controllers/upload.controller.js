/**
 * Contrôleur pour les uploads d'images vers Cloudinary
 * Utilise Express pour gérer les requêtes/réponses
 * Délègue toute la logique métier au service upload.service.js
 */

const uploadService = require('../services/upload.service');

// Upload une image vers Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    console.log('📤 Upload image - Début');
    console.log('Body reçu:', { file: req.body.file ? 'présent' : 'absent', folder: req.body.folder });
    
    const { file, folder } = req.body;

    const result = await uploadService.uploadImage(file, folder);

    console.log('✅ Upload réussi vers Cloudinary');
    console.log('   URL:', result.url);

    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
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

    const statusCode = error.message.includes('Aucun fichier') || error.message.includes('Format') ? 400 : 500;

    res.status(statusCode).json({
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

    const urls = await uploadService.uploadMultipleImages(files, folder);

    res.json({
      success: true,
      message: `${urls.length} image(s) uploadée(s) avec succès`,
      urls: urls
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    const statusCode = error.message.includes('Aucun fichier') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de l\'upload des images',
      error: error.message
    });
  }
};
