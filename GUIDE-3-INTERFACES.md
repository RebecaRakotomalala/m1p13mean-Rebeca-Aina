# 🎯 Guide des 3 Interfaces - Admin, Boutique, Acheteur

Ce guide explique comment les 3 interfaces frontend sont personnalisées et connectées au backend.

## 📁 Structure des Interfaces

Votre projet contient **3 interfaces frontend séparées** :

1. **`Frontend/Admin/`** - Interface pour les administrateurs
2. **`Frontend/Boutique/`** - Interface pour les boutiques du centre commercial
3. **`Frontend/Acheteur/`** - Interface pour les clients/acheteurs

## 🔐 Système d'Authentification par Rôle

### Rôles Disponibles

- **`admin`** - Administrateurs de la plateforme
- **`boutique`** - Propriétaires/gestionnaires de boutiques
- **`client`** - Clients/acheteurs

### Personnalisation Automatique

Chaque interface enregistre automatiquement les utilisateurs avec le bon rôle :

- **Interface Admin** → Crée des utilisateurs avec `role: 'admin'`
- **Interface Boutique** → Crée des utilisateurs avec `role: 'boutique'`
- **Interface Acheteur** → Crée des utilisateurs avec `role: 'client'`

## 🚀 Démarrage des Interfaces

### Option 1: Démarrer une interface à la fois

```bash
# Interface Admin
cd Frontend/Admin
npm start
# Ouvre sur http://localhost:4200

# Interface Boutique
cd Frontend/Boutique
npm start
# Ouvre sur http://localhost:4200

# Interface Acheteur
cd Frontend/Acheteur
npm start
# Ouvre sur http://localhost:4200
```

### Option 2: Démarrer les 3 interfaces en parallèle

Vous pouvez modifier les ports dans `angular.json` de chaque interface pour les faire tourner en parallèle :

**Admin** - Port 4200 (par défaut)
**Boutique** - Port 4201
**Acheteur** - Port 4202

Pour modifier le port, éditez `angular.json` :
```json
"serve": {
  "options": {
    "port": 4201  // Changez le port ici
  }
}
```

## 🧪 Tests par Interface

### Test Interface Admin

1. **Démarrer le backend** (si pas déjà fait)
   ```bash
   cd Backend
   npm run dev
   ```

2. **Démarrer l'interface Admin**
   ```bash
   cd Frontend/Admin
   npm start
   ```

3. **Tester l'inscription**
   - Aller sur `http://localhost:4200/register`
   - Créer un compte (sera automatiquement `role: 'admin'`)
   - Se connecter

4. **Vérifier dans MongoDB**
   ```bash
   mongosh
   use test
   db.users.findOne({ role: 'admin' })
   ```

### Test Interface Boutique

1. **Démarrer l'interface Boutique**
   ```bash
   cd Frontend/Boutique
   npm start
   ```

2. **Tester l'inscription**
   - Aller sur `http://localhost:4200/register`
   - Créer un compte (sera automatiquement `role: 'boutique'`)

3. **Vérifier dans MongoDB**
   ```bash
   db.users.findOne({ role: 'boutique' })
   ```

### Test Interface Acheteur

1. **Démarrer l'interface Acheteur**
   ```bash
   cd Frontend/Acheteur
   npm start
   ```

2. **Tester l'inscription**
   - Aller sur `http://localhost:4200/register`
   - Créer un compte (sera automatiquement `role: 'client'`)

3. **Vérifier dans MongoDB**
   ```bash
   db.users.findOne({ role: 'client' })
   ```

## 🔧 Configuration Backend

### Modèle User Mis à Jour

Le modèle User dans `Backend/models/User.js` inclut maintenant :

```javascript
{
  email: String,
  password: String,
  name: String,
  role: 'admin' | 'boutique' | 'client',
  telephone: String,
  avatar_url: String,
  actif: Boolean,
  boutique_id: ObjectId, // Pour les boutiques
  createdAt: Date,
  updatedAt: Date
}
```

### Routes API Disponibles

- `POST /api/auth/register` - Inscription (avec rôle automatique selon l'interface)
- `POST /api/auth/login` - Connexion
- `GET /api/auth/users` - Liste tous les utilisateurs
- `GET /api/auth/users/role/:role` - Liste les utilisateurs par rôle

### Exemple d'Utilisation API

```bash
# Inscription Admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"admin123","role":"admin"}'

# Inscription Boutique
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Boutique User","email":"boutique@example.com","password":"boutique123","role":"boutique"}'

# Inscription Client
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Client User","email":"client@example.com","password":"client123","role":"client"}'

# Lister les admins
curl http://localhost:3000/api/auth/users/role/admin

# Lister les boutiques
curl http://localhost:3000/api/auth/users/role/boutique

# Lister les clients
curl http://localhost:3000/api/auth/users/role/client
```

## 🎨 Personnalisation de Chaque Interface

### Interface Admin

- **Rôle:** `admin`
- **Fonctionnalités typiques:**
  - Gestion des utilisateurs
  - Gestion des boutiques
  - Statistiques globales
  - Modération du contenu
  - Configuration système

### Interface Boutique

- **Rôle:** `boutique`
- **Fonctionnalités typiques:**
  - Gestion de sa boutique
  - Produits/services
  - Commandes
  - Statistiques de vente
  - Profil boutique

### Interface Acheteur

- **Rôle:** `client`
- **Fonctionnalités typiques:**
  - Recherche de boutiques
  - Consultation de produits
  - Commandes
  - Favoris
  - Profil client

## 🔍 Vérification des Rôles

### Dans le Frontend

Chaque service `auth.service.ts` vérifie automatiquement le rôle lors de l'inscription :

**Admin:**
```typescript
register(data: RegisterData): Observable<AuthResponse> {
  const registerData = { ...data, role: 'admin' };
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
}
```

**Boutique:**
```typescript
register(data: RegisterData): Observable<AuthResponse> {
  const registerData = { ...data, role: 'boutique' };
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
}
```

**Acheteur:**
```typescript
register(data: RegisterData): Observable<AuthResponse> {
  const registerData = { ...data, role: 'client' };
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
}
```

### Dans le Backend

Le backend valide et stocke le rôle :

```javascript
const validRoles = ['admin', 'boutique', 'client'];
const userRole = role && validRoles.includes(role) ? role : 'client';
```

## 📊 Vérification dans MongoDB

```bash
# Se connecter à MongoDB
mongosh
use test

# Voir tous les utilisateurs avec leurs rôles
db.users.find({}, { email: 1, name: 1, role: 1 }).pretty()

# Compter par rôle
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])

# Voir uniquement les admins
db.users.find({ role: 'admin' }).pretty()

# Voir uniquement les boutiques
db.users.find({ role: 'boutique' }).pretty()

# Voir uniquement les clients
db.users.find({ role: 'client' }).pretty()
```

## 🛡️ Sécurité et Validation

### Validation des Rôles

- Le backend valide que le rôle est valide
- Par défaut, si aucun rôle n'est fourni, `'client'` est assigné
- Chaque interface force son propre rôle lors de l'inscription

### Vérification lors de la Connexion

Lors de la connexion, le backend retourne le rôle de l'utilisateur, permettant au frontend de :
- Rediriger vers la bonne interface
- Afficher les bonnes fonctionnalités
- Restreindre l'accès selon le rôle

## 🎯 Prochaines Étapes

Pour personnaliser davantage chaque interface :

1. **Créer des routes spécifiques** dans chaque `app-routing.module.ts`
2. **Créer des composants dédiés** pour chaque rôle
3. **Ajouter des guards** pour protéger les routes selon le rôle
4. **Personnaliser les dashboards** selon le rôle
5. **Ajouter des fonctionnalités spécifiques** à chaque interface

## 📝 Notes Importantes

- ✅ Chaque interface se connecte au **même backend** (`http://localhost:3000/api`)
- ✅ Chaque interface utilise la **même base MongoDB**
- ✅ Les rôles sont automatiquement assignés selon l'interface utilisée
- ✅ Un utilisateur peut se connecter depuis n'importe quelle interface s'il a le bon rôle
- ⚠️ En production, ajoutez des guards pour empêcher les utilisateurs de se connecter à la mauvaise interface

---

**Toutes les interfaces sont maintenant configurées et prêtes à être personnalisées! 🚀**

