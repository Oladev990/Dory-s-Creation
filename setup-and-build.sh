#!/bin/bash

# 🚀 Script Setup Complet + Génération APK ChatApp
# Ce script installe toutes les dépendances et génère l'APK

echo "📱 ==============================================="
echo "🚀 Setup Complet + Génération APK ChatApp"
echo "==============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet ChatApp"
    exit 1
fi

print_status "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Téléchargez-le depuis https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js 16+ requis. Version actuelle: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

print_success "npm $(npm -v) détecté"

# Vérifier Java
if ! command -v java &> /dev/null; then
    print_error "Java n'est pas installé. Installez Java 11+ depuis https://adoptium.net/"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 11 ]; then
    print_error "Java 11+ requis. Version actuelle: $JAVA_VERSION"
    exit 1
fi

print_success "Java $JAVA_VERSION détecté"

print_status "Installation des dépendances Node.js..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dépendances installées avec succès"
else
    print_error "Erreur lors de l'installation des dépendances"
    exit 1
fi

print_status "Nettoyage des builds précédents..."
npm run clean:android > /dev/null 2>&1

print_status "Génération de l'APK..."
# Appeler notre script de build
./build-apk.sh

if [ $? -eq 0 ]; then
    print_success "🎉 APK généré avec succès!"
    
    if [ -f "ChatApp-v1.0.0-debug.apk" ]; then
        APK_SIZE=$(du -h "ChatApp-v1.0.0-debug.apk" | cut -f1)
        
        echo ""
        echo "✅ ================================================"
        echo "🎉 CHATAPP APK PRÊT À INSTALLER!"
        echo "================================================"
        echo ""
        echo "📦 Fichier: ChatApp-v1.0.0-debug.apk"
        echo "📊 Taille: $APK_SIZE"
        echo "🆔 Package: com.chatapp"
        echo "📱 Minimum: Android 5.0 (API 21)"
        echo "🔧 Type: Debug (auto-signé)"
        echo ""
        echo "📲 INSTALLATION:"
        echo "  1. Activez 'Sources inconnues' sur votre appareil Android"
        echo "  2. Transférez ChatApp-v1.0.0-debug.apk sur votre téléphone"
        echo "  3. Ouvrez le fichier APK et installez"
        echo ""
        echo "💡 Pour installer via ADB (USB):"
        echo "   adb install ChatApp-v1.0.0-debug.apk"
        echo ""
        echo "🔧 Configuration Firebase (optionnelle):"
        echo "  - Remplacez android/app/google-services.json par le vôtre"
        echo "  - Modifiez src/services/firebase.ts avec vos clés"
        echo ""
        echo "📝 Plus d'infos: Consultez APK_GUIDE.md"
        echo ""
        echo "🎊 PROFITEZ DE VOTRE APPLICATION CHATAPP!"
        
    else
        print_error "APK non trouvé après génération"
        exit 1
    fi
else
    print_error "Échec de la génération de l'APK"
    exit 1
fi