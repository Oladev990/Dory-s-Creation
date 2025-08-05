#!/bin/bash

# Script de configuration Firebase pour Friendly App
# Usage: ./setup-firebase.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Configuration Firebase${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

# Vérifier si le fichier google-services.json existe
if [ ! -f "app/google-services.json" ]; then
    print_error "Fichier google-services.json non trouvé dans app/"
    print_message "Veuillez télécharger le fichier depuis Firebase Console"
    print_message "et le placer dans le dossier app/"
    exit 1
fi

# Vérifier si c'est le vrai fichier (pas le template)
if grep -q "friendly-app-xxxxx" "app/google-services.json"; then
    print_warning "Le fichier google-services.json semble être le template"
    print_message "Veuillez le remplacer par le vrai fichier de Firebase Console"
    exit 1
fi

print_message "Fichier google-services.json détecté ✓"

# Vérifier la structure du projet
print_message "Vérification de la structure du projet..."

if [ ! -f "build.gradle" ]; then
    print_error "Fichier build.gradle racine non trouvé"
    exit 1
fi

if [ ! -f "app/build.gradle" ]; then
    print_error "Fichier app/build.gradle non trouvé"
    exit 1
fi

print_message "Structure du projet OK ✓"

# Vérifier les dépendances Firebase
print_message "Vérification des dépendances Firebase..."

if ! grep -q "com.google.gms.google-services" "app/build.gradle"; then
    print_error "Plugin Firebase non trouvé dans app/build.gradle"
    exit 1
fi

print_message "Dépendances Firebase OK ✓"

# Instructions pour Firebase Console
echo
print_message "Instructions pour Firebase Console :"
echo
echo "1. Allez sur https://console.firebase.google.com/"
echo "2. Sélectionnez votre projet"
echo "3. Activez les services suivants :"
echo "   - Authentication (Email/Password)"
echo "   - Firestore Database"
echo "   - Realtime Database"
echo "   - Storage"
echo "   - Cloud Messaging"
echo
echo "4. Configurez les règles de sécurité (voir README.md)"
echo

print_message "Configuration Firebase terminée !"
print_message "Vous pouvez maintenant compiler l'APK avec :"
echo "  ./build-apk.sh debug"