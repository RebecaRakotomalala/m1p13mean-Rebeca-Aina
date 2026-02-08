# API Backend - Documentation

## 📡 Endpoints disponibles

### 🔐 Authentification (`/api/auth`)

- `POST /api/auth/register` - Inscription d'un utilisateur
- `POST /api/auth/login` - Connexion d'un utilisateur
- `GET /api/auth/users` - Liste tous les utilisateurs
- `GET /api/auth/users/role/:role` - Liste les utilisateurs par rôle

### 🏪 Boutiques (`/api/boutiques`)

- `POST /api/boutiques` - Créer une boutique
- `GET /api/boutiques` - Liste toutes les boutiques
- `GET /api/boutiques/:id` - Obtenir une boutique par ID
- `GET /api/boutiques/user/:userId` - Obtenir les boutiques d'un utilisateur
- `PUT /api/boutiques/:id` - Mettre à jour une boutique
- `DELETE /api/boutiques/:id` - Supprimer une boutique

### 📤 Upload d'images (`/api/upload`)

- `POST /api/upload/image` - Upload une image vers Cloudinary
  - Body: `{ file: "data:image/jpeg;base64,...", folder: "boutiques/logos" }`
  - Response: `{ success: true, url: "https://...", ... }`

- `POST /api/upload/images` - Upload plusieurs images vers Cloudinary
  - Body: `{ files: ["data:image/jpeg;base64,...", ...], folder: "boutiques/galerie" }`
  - Response: `{ success: true, urls: ["https://...", ...] }`

### 🧪 Test (`/api/test`)

- `GET /api/test` - Test du serveur
- `GET /api/test/mongodb` - Test de connexion MongoDB
- `GET /api/test/connection` - Test de connexion Frontend-Backend
- `POST /api/test/data` - Test d'envoi de données

## 🔧 Configuration

### Variables d'environnement (`.env`)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mall
CLOUDINARY_UPLOAD_PRESET=boutique-upload
CLOUDINARY_CLOUD_NAME=ddsocampb
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## 📝 Notes importantes

- Toute la logique backend est dans le Backend
- Le Frontend fait uniquement des appels API HTTP
- Les uploads d'images passent par le Backend (pas d'appel direct à Cloudinary depuis le Frontend)

