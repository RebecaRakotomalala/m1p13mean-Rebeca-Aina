/**
 * Routes pour les uploads d'images
 * Utilise Express Router pour organiser les routes
 */

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');

// Upload une image (accepte base64 dans le body)
router.post('/image', uploadController.uploadImage);

// Upload multiple images (accepte array de base64 dans le body)
router.post('/images', uploadController.uploadMultipleImages);

module.exports = router;

