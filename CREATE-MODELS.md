# 📦 Modèles MongoDB Créés

Tous les modèles Mongoose ont été créés à partir du schéma SQL dans `table.sql`.

## ✅ Modèles Créés

### 1. **User** (`models/User.js`)
- Collection: `utilisateurs`
- Tous les utilisateurs (admin, boutique, client)
- Champs: email, mot_de_passe_hash, role, nom, prenom, etc.

### 2. **Boutique** (`models/Boutique.js`)
- Collection: `boutiques`
- Informations des boutiques du centre commercial
- Champs: nom, slug, description, catégories, horaires, etc.

### 3. **Produit** (`models/Produit.js`)
- Collection: `produits`
- Catalogue des produits de toutes les boutiques
- Champs: nom, prix, stock, variations, images, etc.

### 4. **Commande** (`models/Commande.js`)
- Collection: `commandes`
- Toutes les commandes passées
- Champs: numero_commande, client_id, montant_total, statut, etc.

### 5. **LigneCommande** (`models/LigneCommande.js`)
- Collection: `lignes_commandes`
- Détails des produits dans chaque commande
- Champs: commande_id, produit_id, quantite, prix_unitaire, etc.

### 6. **Avis** (`models/Avis.js`)
- Collection: `avis`
- Avis et notations des clients
- Champs: note, commentaire, photos, achat_verifie, etc.

### 7. **Favori** (`models/Favori.js`)
- Collection: `favoris`
- Produits et boutiques en favoris
- Champs: client_id, type, produit_id, boutique_id, etc.

### 8. **Panier** (`models/Panier.js`)
- Collection: `paniers`
- Paniers d'achat actifs
- Champs: client_id, session_id, statut, etc.

### 9. **LignePanier** (`models/LignePanier.js`)
- Collection: `lignes_paniers`
- Items dans le panier
- Champs: panier_id, produit_id, quantite, etc.

## 🚀 Utilisation

### Importer un modèle

```javascript
const User = require('./models/User');
const Boutique = require('./models/Boutique');
const Produit = require('./models/Produit');
```

### Exemple d'utilisation

```javascript
// Créer un utilisateur
const user = new User({
  email: 'test@example.com',
  mot_de_passe_hash: 'hashed_password',
  nom: 'Doe',
  prenom: 'John',
  role: 'client'
});
await user.save();

// Créer une boutique
const boutique = new Boutique({
  utilisateur_id: user._id,
  nom: 'Ma Boutique',
  slug: 'ma-boutique',
  categorie_principale: 'Mode',
  statut: 'active'
});
await boutique.save();

// Créer un produit
const produit = new Produit({
  boutique_id: boutique._id,
  nom: 'T-shirt',
  slug: 't-shirt',
  categorie: 'Vêtements',
  prix_initial: 29.99,
  stock_quantite: 50
});
await produit.save();
```

## 📝 Notes Importantes

1. **Noms de collections**: Les collections utilisent les noms français du schéma SQL (`utilisateurs`, `boutiques`, etc.)

2. **Champs mis à jour**: Le modèle User utilise maintenant `mot_de_passe_hash` et `nom` au lieu de `password` et `name`

3. **Index**: Tous les index du schéma SQL ont été créés dans les modèles Mongoose

4. **Relations**: Les références entre modèles utilisent `mongoose.Schema.Types.ObjectId` avec `ref`

5. **Timestamps**: Les modèles utilisent `timestamps` pour `date_creation` et `date_modification`

## 🔄 Migration depuis l'ancien modèle User

Si vous avez déjà des utilisateurs avec `password` et `name`, vous devrez les migrer vers `mot_de_passe_hash` et `nom`.

