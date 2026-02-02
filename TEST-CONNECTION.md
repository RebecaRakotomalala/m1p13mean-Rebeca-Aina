# 🧪 Guide de Test des Connexions

Ce guide vous explique comment tester que les connexions entre le Frontend, le Backend et MongoDB fonctionnent correctement.

## 📋 Prérequis

1. **Node.js** installé (version 14 ou supérieure)
2. **MongoDB** installé et démarré (local ou MongoDB Atlas)
3. **npm** ou **yarn** installé

## 🔧 Configuration Initiale

### 1. Configuration du Backend

#### a) Créer le fichier `.env` dans le dossier `Backend`

Créez un fichier `.env` à la racine du dossier `Backend` avec le contenu suivant:

```env
# Port du serveur backend
PORT=3000

# URI de connexion MongoDB
# Pour MongoDB local:
MONGODB_URI=mongodb://localhost:27017/test

# Pour MongoDB Atlas (remplacez par vos identifiants):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nom-de-votre-base?retryWrites=true&w=majority
```

#### b) Installer les dépendances du Backend

```bash
cd Backend
npm install
```

### 2. Configuration du Frontend

#### a) Vérifier l'URL de l'API

Le fichier `Frontend/src/environments/environment.ts` doit contenir:

```typescript
export const environment = {
  appVersion: packageInfo.version,
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

#### b) Installer les dépendances du Frontend

```bash
cd Frontend
npm install
```

## 🚀 Démarrage des Services

### Étape 1: Démarrer MongoDB

#### Option A: MongoDB Local

Si vous utilisez MongoDB en local, assurez-vous qu'il est démarré:

```bash
# Sur Linux/Mac
sudo systemctl start mongod
# ou
mongod

# Sur Windows
net start MongoDB
```

#### Option B: MongoDB Atlas

Si vous utilisez MongoDB Atlas, assurez-vous que:
- Votre cluster est actif
- Votre IP est autorisée dans les Network Access
- Vous avez la bonne URI de connexion dans le fichier `.env`

### Étape 2: Démarrer le Backend

Ouvrez un terminal et exécutez:

```bash
cd Backend
npm run dev
```

Vous devriez voir:
```
✅ Connexion à MongoDB réussie!
📊 Base de données: test
🚀 Serveur backend démarré sur le port 3000
📍 URL: http://localhost:3000
🔗 Test MongoDB: http://localhost:3000/api/test/mongodb
🔗 Test Connection: http://localhost:3000/api/test/connection
```

### Étape 3: Démarrer le Frontend

Ouvrez un **nouveau terminal** et exécutez:

```bash
cd Frontend
npm start
```

Le frontend devrait démarrer sur `http://localhost:4200`

## ✅ Tests à Effectuer

### Test 1: Vérifier le Backend (Terminal)

Dans votre navigateur ou avec `curl`, testez:

```bash
# Test de base
curl http://localhost:3000/

# Test de connexion
curl http://localhost:3000/api/test/connection

# Test MongoDB
curl http://localhost:3000/api/test/mongodb
```

**Résultat attendu:**
- Toutes les requêtes doivent retourner du JSON avec `status: "OK"` ou `status: "✅ Connecté"`

### Test 2: Vérifier via l'Interface Web

1. Ouvrez votre navigateur à l'adresse: `http://localhost:4200`
2. Naviguez vers: `http://localhost:4200/test-connection`
3. Vous verrez une page avec 3 cartes de test:
   - **Test Frontend ↔ Backend**: Vérifie que le frontend peut communiquer avec le backend
   - **Test Backend ↔ MongoDB**: Vérifie que le backend est connecté à MongoDB
   - **Test Envoi de Données (POST)**: Vérifie que les requêtes POST fonctionnent

4. Cliquez sur **"🔄 Tester Tout"** pour lancer tous les tests

### Test 3: Vérifier dans la Console du Navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Les tests devraient afficher des messages de succès ou d'erreur

### Test 4: Vérifier dans la Console du Backend

Dans le terminal où le backend tourne, vous devriez voir:
- Les requêtes entrantes
- Les messages de connexion MongoDB
- Les erreurs éventuelles

## 🔍 Résolution des Problèmes

### Problème 1: Le backend ne démarre pas

**Erreur:** `Error: Cannot find module 'express'`

**Solution:**
```bash
cd Backend
npm install
```

### Problème 2: Erreur de connexion MongoDB

**Erreur:** `MongoServerError: connection refused` ou `MongooseServerSelectionError`

**Solutions:**
1. Vérifiez que MongoDB est démarré:
   ```bash
   # Vérifier le statut
   sudo systemctl status mongod
   ```

2. Vérifiez l'URI dans le fichier `.env`:
   - Pour MongoDB local: `mongodb://localhost:27017/test`
   - Pour MongoDB Atlas: Vérifiez que l'URI est correcte

3. Vérifiez que le port 27017 n'est pas bloqué par un firewall

### Problème 3: Le frontend ne peut pas se connecter au backend

**Erreur:** `Failed to fetch` ou `CORS error`

**Solutions:**
1. Vérifiez que le backend est démarré sur le port 3000
2. Vérifiez l'URL dans `environment.ts`: `http://localhost:3000/api`
3. Vérifiez que CORS est activé dans `server.js` (déjà configuré)

### Problème 4: Erreur 404 sur `/test-connection`

**Solution:**
1. Vérifiez que vous avez bien redémarré le serveur Angular après les modifications
2. Vérifiez que la route est bien ajoutée dans `app-routing.module.ts`

## 📊 Checklist de Vérification

- [ ] MongoDB est démarré et accessible
- [ ] Le fichier `.env` est créé dans `Backend/` avec la bonne URI MongoDB
- [ ] Le backend démarre sans erreur sur le port 3000
- [ ] Le frontend démarre sans erreur sur le port 4200
- [ ] La page `/test-connection` s'affiche correctement
- [ ] Le test "Frontend ↔ Backend" retourne ✅
- [ ] Le test "Backend ↔ MongoDB" retourne ✅
- [ ] Le test "Envoi de Données (POST)" retourne ✅

## 🎯 Tests Manuels via cURL

Si vous préférez tester via la ligne de commande:

```bash
# Test 1: Backend de base
curl http://localhost:3000/

# Test 2: Connexion Frontend-Backend
curl http://localhost:3000/api/test/connection

# Test 3: Connexion MongoDB
curl http://localhost:3000/api/test/mongodb

# Test 4: POST avec données
curl -X POST http://localhost:3000/api/test/data \
  -H "Content-Type: application/json" \
  -d '{"message":"Test depuis curl","timestamp":"2024-01-01T00:00:00.000Z"}'
```

## 📝 Notes Importantes

1. **Ports utilisés:**
   - Backend: `3000`
   - Frontend: `4200`
   - MongoDB: `27017` (local)

2. **Fichiers de configuration:**
   - Backend: `Backend/.env` (à créer)
   - Frontend: `Frontend/src/environments/environment.ts`

3. **En production:**
   - Modifiez `environment.prod.ts` avec l'URL de votre backend en production
   - Utilisez une URI MongoDB sécurisée (MongoDB Atlas recommandé)

## 🆘 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs dans les consoles (backend et navigateur)
2. Vérifiez que tous les services sont démarrés
3. Vérifiez les fichiers de configuration
4. Consultez la section "Résolution des Problèmes" ci-dessus

---

**Bon test! 🚀**

