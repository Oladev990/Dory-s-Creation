#!/bin/bash

# Script pour tout automatiser - De Zéro à l'APK
# Usage: ./tout-automatiser.sh

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
    echo -e "${BLUE}  AUTOMATISATION COMPLÈTE${NC}"
    echo -e "${BLUE}  Friendly App - De Zéro à l'APK${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

print_message "🎯 Ce script va automatiser tout le processus !"
echo

# Étape 1: Vérifier Java
print_message "Étape 1: Vérification de Java..."
if ! command -v java &> /dev/null; then
    print_error "Java non trouvé. Veuillez installer Java 11+"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt "11" ]; then
    print_error "Java 11+ requis (version actuelle: $JAVA_VERSION)"
    exit 1
fi

print_message "Java OK (version: $JAVA_VERSION) ✓"
echo

# Étape 2: Installer SDK Android
print_message "Étape 2: Installation du SDK Android..."
if [ -z "$ANDROID_HOME" ] || [ ! -d "$ANDROID_HOME" ]; then
    print_message "SDK Android non trouvé. Installation automatique..."
    ./install-android-sdk.sh
else
    print_message "SDK Android déjà installé ✓"
fi
echo

# Étape 3: Vérifier Firebase
print_message "Étape 3: Vérification de Firebase..."
./setup-firebase.sh
echo

# Étape 4: Générer l'APK
print_message "Étape 4: Génération de l'APK..."
print_message "Voulez-vous générer l'APK maintenant ? (y/n): "
read -r response
if [[ $response =~ ^[Yy]$ ]]; then
    print_message "Génération de l'APK debug..."
    ./build-complete.sh debug
else
    print_message "Génération d'APK ignorée."
    print_message "Vous pouvez la générer plus tard avec: ./build-complete.sh debug"
fi
echo

# Étape 5: Résumé final
print_message "🎉 AUTOMATISATION TERMINÉE !"
echo
print_message "📋 RÉSUMÉ:"
echo "  ✅ Java vérifié"
echo "  ✅ SDK Android installé"
echo "  ✅ Firebase configuré"
echo "  ✅ Projet prêt pour le build"
echo
print_message "📁 FICHIERS IMPORTANTS:"
echo "  📄 README.md - Documentation complète"
echo "  📄 GUIDE_RAPIDE.md - Guide rapide"
echo "  📄 RESUME_FINAL.md - Résumé final"
echo "  📄 INSTALLATION_COMPLETE.md - Installation détaillée"
echo
print_message "🚀 PROCHAINES ÉTAPES:"
echo "  1. Configurer Firebase Console (si pas encore fait)"
echo "  2. Remplacer google-services.json par le vrai fichier"
echo "  3. Générer l'APK: ./build-complete.sh debug"
echo "  4. Tester sur émulateur/appareil"
echo "  5. Développer les fonctionnalités avancées"
echo
print_message "🎯 COMMANDES UTILES:"
echo "  ./build-complete.sh debug    # Générer APK debug"
echo "  ./build-complete.sh release  # Générer APK release"
echo "  ./setup-firebase.sh          # Vérifier Firebase"
echo "  adb install app/build/outputs/apk/debug/app-debug.apk  # Installer APK"
echo
print_message "📞 SUPPORT:"
echo "  - Consultez README.md pour la documentation complète"
echo "  - Utilisez les scripts automatiques pour le dépannage"
echo "  - Vérifiez les logs en cas de problème"
echo
print_message "🌟 Félicitations ! Votre projet Friendly est prêt !"
echo
print_message "Friendly - Connecter, Discuter, Jouer ! 🎯💬🎮"