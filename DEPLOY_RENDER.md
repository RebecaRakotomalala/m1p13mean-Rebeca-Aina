# Deploy sur Render (1 seul Web Service + Atlas)

Ce projet est pret pour un deploy via `render.yaml` avec un seul service `mallconnect-app`.

## 1) MongoDB Atlas

- Cree un cluster Atlas.
- Cree un utilisateur DB (ex: `ranjarakoto0_db_user`) avec mot de passe.
- Dans **Network Access**, autorise Render (le plus simple: `0.0.0.0/0`).
- Recupere ta chaine de connexion, format:

`mongodb+srv://ranjarakoto0_db_user:<db_password>@cluster0.ki2oyns.mongodb.net/mallconnect?retryWrites=true&w=majority&appName=Cluster0`

Remplace `<db_password>` par ton vrai mot de passe (URL-encode si besoin).

## 2) Deploy sur Render (backend + frontend ensemble)

Le fichier `render.yaml` cree un seul service web:
- Build Angular dans `Frontend/`
- Demarrage Express dans `Backend/`
- Frontend servi par Express sur le meme domaine
- API exposee sous `/api`
- Le build frontend utilise `--legacy-peer-deps --include=dev` pour eviter les conflits peer npm et installer `ng` sur Render

Variables Render a renseigner:
- `MONGODB_URI` -> ta chaine Atlas
- `JWT_SECRET` -> auto-genere
- `NODE_ENV` -> `production`

## 3) Creation du service

- Push le projet sur GitHub/GitLab.
- Dans Render: **New +** -> **Blueprint**.
- Selectionne le repo et valide.
- Render lit `render.yaml` et cree le service unique.

## 4) Verifications apres deploy

- App: ouvre `https://<ton-service>.onrender.com/`.
- Healthcheck API: `https://<ton-service>.onrender.com/api/health`.
- Teste login, catalogue, panier.

## Note utile Atlas

Si la connexion echoue:
- verifier `MONGODB_URI` (mot de passe correct et encode),
- verifier whitelist reseau Atlas,
- verifier que l'utilisateur DB a les droits sur la base cible.

