#!/bin/bash

# Script pour générer l'APK de l'application Friendly
# Usage: ./build-apk.sh [debug|release]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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
    echo -e "${BLUE}  Build APK - Friendly App${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "build.gradle" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Déterminer le type de build
BUILD_TYPE=${1:-debug}

if [ "$BUILD_TYPE" != "debug" ] && [ "$BUILD_TYPE" != "release" ]; then
    print_error "Type de build invalide. Utilisez 'debug' ou 'release'"
    exit 1
fi

print_header
print_message "Début de la génération de l'APK ($BUILD_TYPE)"

# Nettoyer le projet
print_message "Nettoyage du projet..."
./gradlew clean

# Vérifier la configuration Firebase
if [ ! -f "app/google-services.json" ]; then
    print_warning "Fichier google-services.json non trouvé"
    print_warning "Assurez-vous d'avoir configuré Firebase correctement"
fi

# Synchroniser les dépendances
print_message "Synchronisation des dépendances..."
./gradlew build

# Générer l'APK
if [ "$BUILD_TYPE" = "release" ]; then
    print_message "Génération de l'APK release..."
    ./gradlew assembleRelease
    
    # Vérifier si l'APK a été généré
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        print_message "APK release généré avec succès !"
        print_message "Chemin: $APK_PATH"
        
        # Afficher la taille de l'APK
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        print_message "Taille: $APK_SIZE"
    else
        print_error "Échec de la génération de l'APK release"
        exit 1
    fi
else
    print_message "Génération de l'APK debug..."
    ./gradlew assembleDebug
    
    # Vérifier si l'APK a été généré
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        print_message "APK debug généré avec succès !"
        print_message "Chemin: $APK_PATH"
        
        # Afficher la taille de l'APK
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        print_message "Taille: $APK_SIZE"
    else
        print_error "Échec de la génération de l'APK debug"
        exit 1
    fi
fi

# Installer sur l'appareil connecté (optionnel)
if command -v adb &> /dev/null; then
    DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)
    if [ "$DEVICES" -gt 0 ]; then
        print_message "Appareil(s) Android détecté(s)"
        read -p "Voulez-vous installer l'APK sur l'appareil connecté ? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_message "Installation de l'APK..."
            adb install -r "$APK_PATH"
            print_message "APK installé avec succès !"
        fi
    else
        print_warning "Aucun appareil Android connecté"
    fi
else
    print_warning "ADB non trouvé. Impossible d'installer automatiquement."
fi

print_message "Build terminé avec succès !"
print_message "APK disponible: $APK_PATH"

# Informations supplémentaires
echo
print_message "Informations utiles:"
echo "  - Pour installer manuellement: adb install $APK_PATH"
echo "  - Pour signer l'APK release: voir la documentation"
echo "  - Pour publier sur Google Play: voir le README.md"

echo
print_message "🎉 Build terminé !"