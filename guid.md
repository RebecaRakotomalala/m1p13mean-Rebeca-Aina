cd Backend
npm init -y

npm install express mongoose cors dotenv body-parser
npm install --save-dev nodemon


render , mongodb atlas (deploiement)

# Commandes MongoDB - À exécuter dans l'ordre

## Étape 1: Importer la clé publique
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

## Étape 2: Ajouter le repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

## Étape 3: Mettre à jour les packages
sudo apt-get update

## Étape 4: Installer MongoDB
sudo apt-get install -y mongodb-org

## Étape 5: Démarrer MongoDB
sudo systemctl start mongod

## Étape 6: Activer au démarrage
sudo systemctl enable mongod

## Étape 7: Vérifier
sudo systemctl status mongod

## Test
mongosh --eval "db.version()"


Equivalent a select * db.boutique.find().pretty()
db.boutiques.findOne({ nom: "Fanelie Boutique" })

node scripts/insert-gael-boutique.js (insert directe base)

LANCEMENT:
    mongosh 
    show dbs (show database)

    cd Backend: npm run dev
    cd Frontend: cd Boutique: npm start http://localhost:4201/
                 cd Admin: npm start http://localhost:4200/
                 cd Acheteur: npm start http://localhost:4202/


cd Backend
node scripts/seed.js


admin@mallconnect.mg	admin123	Acommercial
cosmetique@boutique.mg	boutique123	(10 produits)
mode@boutique.mg	boutique123	G
supermarche@boutique.mg	boutique123	
client@test.mg	client123	
client2@test.mg	client123	