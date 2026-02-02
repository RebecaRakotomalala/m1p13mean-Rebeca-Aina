#!/bin/bash

echo "🔧 Installation complète de MongoDB sur Ubuntu 22.04"
echo "===================================================="
echo ""

# Vérifier si MongoDB est déjà installé
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB est déjà installé!"
    mongod --version
    echo ""
    echo "Vérification du service..."
    sudo systemctl status mongod --no-pager | head -5
    exit 0
fi

echo "📥 Étape 1/6: Import de la clé publique MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'import de la clé"
    echo "💡 Essayez de réexécuter cette commande manuellement:"
    echo "   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor"
    exit 1
fi
echo "✅ Clé publique importée"

echo ""
echo "📦 Étape 2/6: Ajout du repository MongoDB..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'ajout du repository"
    exit 1
fi
echo "✅ Repository ajouté"

echo ""
echo "🔄 Étape 3/6: Mise à jour des packages..."
sudo apt-get update

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la mise à jour"
    exit 1
fi
echo "✅ Packages mis à jour"

echo ""
echo "📥 Étape 4/6: Installation de MongoDB (cela peut prendre quelques minutes)..."
sudo apt-get install -y mongodb-org

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation"
    echo ""
    echo "💡 Vérifiez que:"
    echo "   1. Le repository a été ajouté: cat /etc/apt/sources.list.d/mongodb-org-7.0.list"
    echo "   2. La clé a été importée: ls -la /usr/share/keyrings/mongodb-server-7.0.gpg"
    exit 1
fi
echo "✅ MongoDB installé"

echo ""
echo "🚀 Étape 5/6: Démarrage de MongoDB..."
sudo systemctl start mongod

if [ $? -ne 0 ]; then
    echo "⚠️  Erreur lors du démarrage, vérifiez les logs:"
    echo "   sudo journalctl -u mongod -n 20"
    exit 1
fi
echo "✅ MongoDB démarré"

echo ""
echo "⚙️  Étape 6/6: Activation au démarrage..."
sudo systemctl enable mongod
echo "✅ MongoDB activé au démarrage"

echo ""
echo "🔍 Vérification finale..."
sleep 2

if sudo systemctl is-active --quiet mongod; then
    echo "✅ MongoDB est en cours d'exécution!"
    echo ""
    echo "📊 Informations:"
    mongod --version | head -1
    echo ""
    echo "📍 MongoDB est accessible sur: mongodb://localhost:27017"
    echo ""
    echo "💡 Test rapide:"
    echo "   mongosh --eval 'db.version()'"
else
    echo "⚠️  MongoDB installé mais n'est pas actif"
    echo "   Essayez: sudo systemctl start mongod"
    echo "   Puis vérifiez: sudo systemctl status mongod"
fi

echo ""
echo "✅ Installation terminée!"

