# 🔐 Guide de Test - Système d'Authentification

Ce guide explique comment tester le système d'authentification complet (Frontend ↔ Backend ↔ MongoDB).

## 📋 Prérequis

1. ✅ MongoDB installé et démarré
2. ✅ Backend démarré sur le port 3000
3. ✅ Frontend démarré sur le port 4200

## 🚀 Démarrage Rapide

### 1. Démarrer MongoDB (si pas déjà fait)

```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### 2. Démarrer le Backend

```bash
cd Backend
npm run dev
```

Vous devriez voir:
```
✅ Connexion à MongoDB réussie!
📊 Base de données: test
🚀 Serveur backend démarré sur le port 3000
```

### 3. Démarrer le Frontend

```bash
cd Frontend
npm start
```

## 🧪 Tests à Effectuer

### Test 1: Inscription (Register)

1. **Ouvrir le navigateur:** `http://localhost:4200/register`

2. **Remplir le formulaire:**
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@example.com`
   - Password: `password123` (minimum 6 caractères)

3. **Cliquer sur "Create Account"**

4. **Résultat attendu:**
   - ✅ Message de succès: "Compte créé avec succès!"
   - Redirection automatique vers `/login` après 2 secondes

5. **Vérifier dans MongoDB:**
   ```bash
   mongosh
   use test
   db.users.find().pretty()
   ```
   Vous devriez voir votre utilisateur créé!

### Test 2: Connexion (Login)

1. **Aller sur:** `http://localhost:4200/login`

2. **Utiliser les identifiants créés:**
   - Email: `john.doe@example.com`
   - Password: `password123`

3. **Cliquer sur "Login"**

4. **Résultat attendu:**
   - ✅ Message de succès: "Connexion réussie!"
   - Redirection automatique vers `/dashboard/default`
   - L'utilisateur est stocké dans `localStorage`

### Test 3: Test d'Erreur - Email déjà utilisé

1. **Essayer de créer un compte avec le même email:**
   - Email: `john.doe@example.com`
   - Password: `autrepassword`

2. **Résultat attendu:**
   - ❌ Message d'erreur: "Cet email est déjà utilisé"

### Test 4: Test d'Erreur - Mauvais mot de passe

1. **Se connecter avec un mauvais mot de passe:**
   - Email: `john.doe@example.com`
   - Password: `mauvaispassword`

2. **Résultat attendu:**
   - ❌ Message d'erreur: "Email ou mot de passe incorrect"

### Test 5: Test d'Erreur - Champs vides

1. **Essayer de se connecter sans remplir les champs**

2. **Résultat attendu:**
   - ❌ Message d'erreur: "Veuillez remplir tous les champs"

## 🔍 Vérification Backend

### Vérifier les routes API

```bash
# Test de base
curl http://localhost:3000/

# Lister tous les utilisateurs
curl http://localhost:3000/api/auth/users

# Tester l'inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Tester la connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📊 Vérification MongoDB

### Voir tous les utilisateurs

```bash
mongosh
use test
db.users.find().pretty()
```

### Voir un utilisateur spécifique

```bash
db.users.findOne({ email: "john.doe@example.com" })
```

### Compter les utilisateurs

```bash
db.users.countDocuments()
```

### Supprimer un utilisateur (pour tester)

```bash
db.users.deleteOne({ email: "john.doe@example.com" })
```

## 🎯 Checklist de Test Complète

- [ ] MongoDB est démarré et connecté
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Page `/register` s'affiche correctement
- [ ] Inscription fonctionne (création d'utilisateur)
- [ ] Utilisateur visible dans MongoDB
- [ ] Page `/login` s'affiche correctement
- [ ] Connexion fonctionne avec les bons identifiants
- [ ] Redirection vers dashboard après connexion
- [ ] Erreur affichée si email déjà utilisé
- [ ] Erreur affichée si mauvais mot de passe
- [ ] Erreur affichée si champs vides
- [ ] Utilisateur stocké dans localStorage

## 🐛 Résolution des Problèmes

### Problème: "Erreur de connexion. Vérifiez que le backend est démarré"

**Solution:**
1. Vérifiez que le backend tourne sur le port 3000
2. Vérifiez l'URL dans `environment.ts`: `http://localhost:3000/api`
3. Vérifiez la console du navigateur (F12) pour les erreurs CORS

### Problème: "Cet email est déjà utilisé"

**C'est normal!** L'email existe déjà dans la base de données. Utilisez un autre email ou supprimez l'utilisateur dans MongoDB.

### Problème: MongoDB n'est pas connecté

**Solution:**
```bash
# Vérifier que MongoDB tourne
sudo systemctl status mongod

# Démarrer MongoDB
sudo systemctl start mongod

# Vérifier la connexion
mongosh --eval "db.version()"
```

### Problème: Erreur CORS

Le backend a déjà CORS configuré. Si vous avez des erreurs:
1. Vérifiez que le backend est démarré
2. Vérifiez que l'URL dans `environment.ts` est correcte
3. Redémarrez le frontend

## 📝 Notes Importantes

1. **Sécurité:** En production, utilisez `bcrypt` pour hasher les mots de passe
2. **Tokens:** En production, utilisez JWT pour l'authentification
3. **Validation:** La validation côté serveur est déjà en place
4. **Base de données:** Les utilisateurs sont stockés dans MongoDB dans la collection `users`

## 🎉 Félicitations!

Si tous les tests passent, votre système d'authentification fonctionne correctement avec:
- ✅ Frontend (Angular)
- ✅ Backend (Express.js)
- ✅ Base de données (MongoDB)

Toutes les connexions sont opérationnelles! 🚀

