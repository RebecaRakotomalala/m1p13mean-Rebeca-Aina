# Backend - Configuration et Démarrage

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

### Créer le fichier `.env`

Créez un fichier `.env` à la racine du dossier `Backend` avec le contenu suivant:

```env
# Port du serveur backend
PORT=3000

# URI de connexion MongoDB
# Pour MongoDB local:
MONGODB_URI=mongodb://localhost:27017/mall

# Pour MongoDB Atlas (remplacez par vos identifiants):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nom-de-votre-base?retryWrites=true&w=majority
```

## 🚀 Démarrage

### Mode développement (avec rechargement automatique)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

## 📡 Routes de Test

Une fois le serveur démarré, vous pouvez tester les routes suivantes:

- `GET /` - Test de base du serveur
- `GET /api/test/connection` - Test de connexion Frontend-Backend
- `GET /api/test/mongodb` - Test de connexion MongoDB
- `POST /api/test/data` - Test d'envoi de données

## 🔍 Vérification

Le serveur devrait afficher:
```
✅ Connexion à MongoDB réussie!
📊 Base de données: mall
🚀 Serveur backend démarré sur le port 3000
```

Si vous voyez une erreur MongoDB, vérifiez:
1. Que MongoDB est démarré
2. Que l'URI dans `.env` est correcte
3. Que le port 27017 n'est pas bloqué

