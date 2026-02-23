const express = require('express');
const router = express.Router();
const favoriController = require('../controllers/favori.controller');
const { verifyToken, isClient } = require('../middlewares/auth.middleware');

router.post('/toggle', verifyToken, isClient, favoriController.toggleFavori);
router.get('/', verifyToken, isClient, favoriController.getMyFavoris);
router.get('/check/:type/:id', verifyToken, isClient, favoriController.checkFavori);

module.exports = router;
