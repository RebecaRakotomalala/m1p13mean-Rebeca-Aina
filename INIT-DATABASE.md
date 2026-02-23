# 🗄️ Initialisation de la Base de Données

Ce guide explique comment initialiser votre base de données MongoDB avec tous les modèles.

## ✅ Modèles Créés

Tous les modèles Mongoose ont été créés dans le dossier `Backend/models/` :

1. ✅ **User.js** - Collection `utilisateurs`
2. ✅ **Boutique.js** - Collection `boutiques`
3. ✅ **Produit.js** - Collection `produits`
4. ✅ **Commande.js** - Collection `commandes`
5. ✅ **LigneCommande.js** - Collection `lignes_commandes`
6. ✅ **Avis.js** - Collection `avis`
7. ✅ **Favori.js** - Collection `favoris`
8. ✅ **Panier.js** - Collection `paniers`
9. ✅ **LignePanier.js** - Collection `lignes_paniers`

## 🚀 Démarrage

### 1. Démarrer MongoDB

```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### 2. Démarrer le Backend

```bash
cd Backend
npm run dev
```

Les collections seront créées automatiquement lors de la première utilisation des modèles.

## 📝 Création Manuelle des Collections (Optionnel)

Si vous voulez créer les collections manuellement dans MongoDB :

```bash
mongosh
use mall
```

Les collections seront créées automatiquement lors de la première insertion de données.

## 🧪 Tester les Modèles

### Créer un utilisateur via l'API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User",
    "role": "client"
  }'
```

### Vérifier dans MongoDB

```bash
mongosh
use mall
db.utilisateurs.find().pretty()
```

## 📊 Structure des Collections

### Collection: `utilisateurs`
- Email, mot de passe, rôle (admin/boutique/client)
- Informations personnelles (nom, prénom, téléphone)
- Authentification (2FA, OAuth, tokens)

### Collection: `boutiques`
- Informations de la boutique
- Localisation dans le centre
- Horaires, services, galerie
- Statut et validation

### Collection: `produits`
- Informations produit
- Prix, stock, variations
- Images, caractéristiques
- Statistiques (ventes, vues, favoris)

### Collection: `commandes`
- Numéro de commande unique
- Informations client et adresses
- Montants et paiement
- Statut et suivi

### Collection: `lignes_commandes`
- Détails des produits dans chaque commande
- Quantités et prix
- Variations sélectionnées

### Collection: `avis`
- Notes et commentaires
- Photos jointes
- Modération et signalements

### Collection: `favoris`
- Produits et boutiques en favoris
- Notes personnelles

### Collection: `paniers`
- Paniers d'achat actifs
- Support utilisateurs connectés et sessions

### Collection: `lignes_paniers`
- Items dans le panier
- Quantités et variations

## 🔍 Vérification

### Lister toutes les collections

```bash
mongosh
use mall
show collections
```

Vous devriez voir :
- utilisateurs
- boutiques
- produits
- commandes
- lignes_commandes
- avis
- favoris
- paniers
- lignes_paniers

### Compter les documents

```bash
db.utilisateurs.countDocuments()
db.boutiques.countDocuments()
db.produits.countDocuments()
```

## ⚠️ Notes Importantes

1. **Noms de collections**: Les collections utilisent les noms français du schéma SQL

2. **Champs mis à jour**: 
   - `password` → `mot_de_passe_hash`
   - `name` → `nom`
   - `createdAt` → `date_creation`

3. **Index**: Tous les index sont créés automatiquement par Mongoose

4. **Relations**: Les références entre collections utilisent `ObjectId`

5. **Timestamps**: Les champs `date_creation` et `date_modification` sont gérés automatiquement

## 🎯 Prochaines Étapes

1. Créer des routes API pour chaque modèle
2. Ajouter la validation des données
3. Implémenter les relations entre modèles
4. Ajouter la pagination et le tri
5. Créer des scripts de migration si nécessaire

---

**Tous les modèles sont prêts à être utilisés! 🚀**

