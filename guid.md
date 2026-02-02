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

