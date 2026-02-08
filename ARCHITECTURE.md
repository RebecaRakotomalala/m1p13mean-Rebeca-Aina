# Architecture du Projet - Frontend ↔ Backend

## 📐 Architecture actuelle

### ✅ Frontend (Angular) - Uniquement des appels API

Le Frontend **ne contient AUCUNE logique backend**. Il fait uniquement des appels HTTP vers le Backend Express.

#### Services Frontend (appels API uniquement)

**`boutique.service.ts`** ✅
- `getAllBoutiques()` → `GET /api/boutiques`
- `getBoutiqueById(id)` → `GET /api/boutiques/:id`
- `getBoutiquesByUserId(userId)` → `GET /api/boutiques/user/:userId`
- `createBoutique(boutique)` → `POST /api/boutiques`
- `updateBoutique(id, boutique)` → `PUT /api/boutiques/:id`
- `deleteBoutique(id)` → `DELETE /api/boutiques/:id`

**`auth.service.ts`** ✅
- `register(data)` → `POST /api/auth/register`
- `login(data)` → `POST /api/auth/login`
- `getCurrentUser()` → Lit depuis localStorage (pas d'appel API)
- `logout()` → Supprime localStorage (pas d'appel API)

**`cloudinary.service.ts`** ✅
- `uploadImage(file, folder)` → `POST /api/upload/image`
- `uploadMultipleImages(files, folder)` → `POST /api/upload/images`

**`api-test.service.ts`** ✅
- `testConnection()` → `GET /api/test/connection`
- `testMongoDB()` → `GET /api/test/mongodb`
- `testPostData(data)` → `POST /api/test/data`

### ✅ Backend (Express) - Toute la logique métier

Toute la logique backend est dans le Backend Express :

#### Routes Express (`routes/`)

- `auth.routes.js` → Routes `/api/auth/*`
- `boutique.routes.js` → Routes `/api/boutiques/*`
- `upload.routes.js` → Routes `/api/upload/*`
- `test.routes.js` → Routes `/api/test/*`

#### Contrôleurs Express (`controllers/`)

- `auth.controller.js` → Logique d'authentification
- `boutique.controller.js` → Logique des boutiques
- `upload.controller.js` → Logique d'upload Cloudinary

#### Modèles Mongoose (`models/`)

- `User.js` → Modèle utilisateur
- `Boutique.js` → Modèle boutique
- `Produit.js`, `Commande.js`, etc.

## 🔄 Flux de données

```
┌─────────────────┐
│  Frontend       │
│  (Angular)      │
│                 │
│  Services:      │
│  - boutique     │
│  - auth         │
│  - cloudinary   │
└────────┬────────┘
         │ HTTP Requests
         │ (GET, POST, PUT, DELETE)
         ↓
┌─────────────────┐
│  Backend        │
│  (Express)      │
│                 │
│  Routes:        │
│  - /api/auth    │
│  - /api/boutiques│
│  - /api/upload  │
│                 │
│  Controllers:   │
│  - auth.controller│
│  - boutique.controller│
│  - upload.controller│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MongoDB        │
│  Cloudinary     │
└─────────────────┘
```

## ✅ Vérification

### Frontend
- ✅ Aucune logique métier
- ✅ Aucun appel direct à MongoDB
- ✅ Aucun appel direct à Cloudinary (passe par le backend)
- ✅ Uniquement des appels HTTP vers `/api/*`

### Backend
- ✅ Toute la logique métier
- ✅ Connexion MongoDB
- ✅ Upload Cloudinary
- ✅ Validation des données
- ✅ Gestion des erreurs

## 📝 Exemple concret

### Upload d'une image

**Frontend** (`myspace.component.ts`):
```typescript
this.cloudinaryService.uploadImage(file, 'boutiques/logos')
  .subscribe(url => {
    // Utilise l'URL retournée
  });
```

**Service Frontend** (`cloudinary.service.ts`):
```typescript
uploadImage(file: File): Observable<string> {
  // Convertit en base64
  // Appelle l'API backend
  return this.http.post(`${this.apiUrl}/upload/image`, { file: base64 });
}
```

**Backend Route** (`upload.routes.js`):
```javascript
router.post('/image', uploadController.uploadImage);
```

**Backend Controller** (`upload.controller.js`):
```javascript
exports.uploadImage = async (req, res) => {
  // Upload vers Cloudinary
  // Retourne l'URL
};
```

## 🎯 Conclusion

**Le service `boutique.service.ts` est PARFAIT** - il fait exactement ce qu'il doit faire :
- ✅ Appelle uniquement les API Express
- ✅ Pas de logique métier
- ✅ Pas d'appel direct à MongoDB ou Cloudinary
- ✅ Architecture propre et séparée

**Tout est correctement configuré !** 🎉

