#!/bin/bash

echo "🔧 Installation de MongoDB sur Ubuntu 22.04"
echo "=========================================="
echo ""

# Vérifier si MongoDB est déjà installé
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB est déjà installé!"
    mongod --version
    exit 0
fi

# 1. Importer la clé publique MongoDB
echo "📥 Étape 1/5: Import de la clé publique MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

if [ $? -eq 0 ]; then
    echo "✅ Clé publique importée avec succès"
else
    echo "❌ Erreur lors de l'import de la clé"
    exit 1
fi

# 2. Ajouter le repository MongoDB
echo ""
echo "📦 Étape 2/5: Ajout du repository MongoDB..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

if [ $? -eq 0 ]; then
    echo "✅ Repository ajouté avec succès"
else
    echo "❌ Erreur lors de l'ajout du repository"
    exit 1
fi

# 3. Mettre à jour les packages
echo ""
echo "🔄 Étape 3/5: Mise à jour des packages..."
sudo apt-get update

if [ $? -eq 0 ]; then
    echo "✅ Packages mis à jour"
else
    echo "❌ Erreur lors de la mise à jour"
    exit 1
fi

# 4. Installer MongoDB
echo ""
echo "📥 Étape 4/5: Installation de MongoDB (cela peut prendre quelques minutes)..."
sudo apt-get install -y mongodb-org

if [ $? -eq 0 ]; then
    echo "✅ MongoDB installé avec succès"
else
    echo "❌ Erreur lors de l'installation"
    exit 1
fi

# 5. Démarrer et activer MongoDB
echo ""
echo "🚀 Étape 5/5: Démarrage de MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

if [ $? -eq 0 ]; then
    echo "✅ MongoDB démarré et activé au démarrage"
else
    echo "❌ Erreur lors du démarrage"
    exit 1
fi

# Vérification
echo ""
echo "🔍 Vérification de l'installation..."
if sudo systemctl is-active --quiet mongod; then
    echo "✅ MongoDB est en cours d'exécution!"
    echo ""
    echo "📊 Version installée:"
    mongod --version | head -1
    echo ""
    echo "✅ Installation terminée avec succès!"
    echo ""
    echo "💡 Commandes utiles:"
    echo "   - Démarrer: sudo systemctl start mongod"
    echo "   - Arrêter: sudo systemctl stop mongod"
    echo "   - Statut: sudo systemctl status mongod"
    echo "   - Logs: sudo journalctl -u mongod -f"
    echo ""
    echo "🔗 MongoDB est maintenant accessible sur: mongodb://localhost:27017"
else
    echo "⚠️  MongoDB installé mais n'est pas en cours d'exécution"
    echo "   Essayez: sudo systemctl start mongod"
    exit 1
fi

