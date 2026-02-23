# Structure Express.js du Projet

## 📁 Architecture Express

Ce projet utilise **Express.js** avec une architecture organisée qui montre clairement l'utilisation d'Express (et pas seulement Node.js pur).

### Structure des dossiers

```
Backend/
├── server.js              # Point d'entrée Express
├── routes/                 # Routes Express (Express Router)
│   ├── auth.routes.js
│   ├── boutique.routes.js
│   └── test.routes.js
├── controllers/            # Contrôleurs Express (logique métier)
│   ├── auth.controller.js
│   └── boutique.controller.js
├── middlewares/            # Middlewares Express personnalisés
│   └── mongodb.middleware.js
├── models/                 # Modèles Mongoose
│   ├── User.js
│   ├── Boutique.js
│   └── ...
└── scripts/                # Scripts utilitaires
```

## 🎯 Utilisation d'Express

### 1. Application Express (`server.js`)

```javascript
const express = require('express');
const app = express();

// Middlewares Express
app.use(cors());
app.use(bodyParser.json());

// Routes Express
app.use('/api/auth', authRoutes);
app.use('/api/boutiques', boutiqueRoutes);

// Démarrage du serveur Express
app.listen(PORT, () => {
  console.log('Serveur Express démarré');
});
```

### 2. Express Router (`routes/`)

Les routes utilisent **Express Router** pour organiser les endpoints :

```javascript
const express = require('express');
const router = express.Router();

router.post('/register', authController.register);
router.get('/users', authController.getAllUsers);

module.exports = router;
```

### 3. Contrôleurs Express (`controllers/`)

Les contrôleurs gèrent les requêtes/réponses Express :

```javascript
exports.register = async (req, res) => {
  // req et res sont les objets Express Request/Response
  const { email, password } = req.body;
  // ...
  res.status(201).json({ success: true, user });
};
```

### 4. Middlewares Express (`middlewares/`)

Middlewares personnalisés utilisant le pattern Express :

```javascript
exports.checkMongoConnection = (req, res, next) => {
  // Middleware Express standard
  if (dbStatus !== 1) {
    return res.status(503).json({ error: 'MongoDB non connecté' });
  }
  next(); // Passe au middleware suivant
};
```

## ✅ Caractéristiques Express utilisées

- ✅ **Express Application** (`express()`)
- ✅ **Express Router** (`express.Router()`)
- ✅ **Middleware Pattern** (`app.use()`, `router.use()`)
- ✅ **Route Handlers** (`req`, `res`, `next`)
- ✅ **HTTP Methods** (`GET`, `POST`, `PUT`, `DELETE`)
- ✅ **Request/Response Objects** (`req.body`, `req.params`, `res.json()`)
- ✅ **Error Handling Middleware** (`app.use((err, req, res, next) => {})`)

## 🚀 Avantages de cette structure

1. **Séparation des responsabilités** : Routes, contrôleurs et middlewares séparés
2. **Maintenabilité** : Code organisé et facile à maintenir
3. **Scalabilité** : Facile d'ajouter de nouvelles routes
4. **Testabilité** : Chaque partie peut être testée indépendamment
5. **Clarté** : Montre clairement l'utilisation d'Express

## 📝 Différence avec Node.js pur

### Node.js pur (sans Express)
```javascript
const http = require('http');
const server = http.createServer((req, res) => {
  // Gestion manuelle des routes, headers, etc.
});
```

### Avec Express.js
```javascript
const express = require('express');
const app = express();
app.get('/api/users', (req, res) => {
  // Express gère automatiquement les routes, headers, etc.
});
```

## 🎓 Conclusion

Cette structure démontre clairement l'utilisation d'**Express.js** et non pas seulement de Node.js pur. Tous les patterns Express standards sont utilisés :
- Application Express
- Router Express
- Middlewares Express
- Gestion des erreurs Express

