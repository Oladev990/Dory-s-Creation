#!/bin/bash

# Script complet pour construire l'APK Friendly
# Usage: ./build-complete.sh [debug|release]

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
    echo -e "${BLUE}  Build Complet - Friendly App${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

# Vérifier les arguments
BUILD_TYPE=${1:-debug}

if [ "$BUILD_TYPE" != "debug" ] && [ "$BUILD_TYPE" != "release" ]; then
    print_error "Type de build invalide. Utilisez 'debug' ou 'release'"
    exit 1
fi

print_message "Type de build: $BUILD_TYPE"

# Étape 1: Vérifier la structure du projet
print_message "Étape 1: Vérification de la structure du projet..."

if [ ! -f "build.gradle" ]; then
    print_error "Fichier build.gradle racine non trouvé"
    exit 1
fi

if [ ! -f "app/build.gradle" ]; then
    print_error "Fichier app/build.gradle non trouvé"
    exit 1
fi

if [ ! -f "gradlew" ]; then
    print_error "Script gradlew non trouvé"
    exit 1
fi

print_message "Structure du projet OK ✓"

# Étape 2: Vérifier Java
print_message "Étape 2: Vérification de Java..."

if ! command -v java &> /dev/null; then
    print_error "Java non trouvé"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt "11" ]; then
    print_error "Java 11 ou supérieur requis (version actuelle: $JAVA_VERSION)"
    exit 1
fi

print_message "Java OK (version: $JAVA_VERSION) ✓"

# Étape 3: Vérifier le fichier google-services.json
print_message "Étape 3: Vérification de la configuration Firebase..."

if [ ! -f "app/google-services.json" ]; then
    print_error "Fichier google-services.json non trouvé"
    print_message "Veuillez télécharger le fichier depuis Firebase Console"
    print_message "et le placer dans le dossier app/"
    exit 1
fi

# Vérifier si c'est le vrai fichier (pas le template)
if grep -q "friendly-app-xxxxx" "app/google-services.json"; then
    print_warning "Le fichier google-services.json semble être le template"
    print_message "Veuillez le remplacer par le vrai fichier de Firebase Console"
    print_message "Continuer avec le template ? (y/n): "
    read -r response
    if [[ ! $response =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_message "Configuration Firebase OK ✓"

# Étape 4: Nettoyer le projet
print_message "Étape 4: Nettoyage du projet..."
./gradlew clean

# Étape 5: Synchroniser les dépendances
print_message "Étape 5: Synchronisation des dépendances..."
./gradlew build --no-daemon

# Étape 6: Générer l'APK
print_message "Étape 6: Génération de l'APK..."

if [ "$BUILD_TYPE" = "release" ]; then
    print_message "Génération de l'APK release..."
    ./gradlew assembleRelease --no-daemon
    
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
    print_message "Génération de l'APK debug..."
    ./gradlew assembleDebug --no-daemon
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

# Étape 7: Vérifier que l'APK a été généré
if [ -f "$APK_PATH" ]; then
    print_message "APK généré avec succès ! ✓"
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    print_message "Chemin: $APK_PATH"
    print_message "Taille: $APK_SIZE"
    
    # Afficher les informations de l'APK
    print_message "Informations de l'APK:"
    echo "  - Nom: $(basename "$APK_PATH")"
    echo "  - Taille: $APK_SIZE"
    echo "  - Chemin complet: $(realpath "$APK_PATH")"
    
else
    print_error "Échec de la génération de l'APK"
    print_message "Vérifiez les logs d'erreur ci-dessus"
    exit 1
fi

# Étape 8: Installer sur l'appareil (optionnel)
if command -v adb &> /dev/null; then
    DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)
    if [ "$DEVICES" -gt 0 ]; then
        print_message "Appareil(s) Android détecté(s)"
        echo
        print_message "Voulez-vous installer l'APK sur l'appareil connecté ? (y/n): "
        read -r response
        if [[ $response =~ ^[Yy]$ ]]; then
            print_message "Installation de l'APK..."
            adb install -r "$APK_PATH"
            print_message "APK installé avec succès ! ✓"
        fi
    else
        print_warning "Aucun appareil Android connecté"
    fi
else
    print_warning "ADB non trouvé. Impossible d'installer automatiquement."
fi

# Étape 9: Résumé final
echo
print_message "🎉 Build terminé avec succès !"
echo
print_message "Résumé:"
echo "  - Type de build: $BUILD_TYPE"
echo "  - APK généré: $APK_PATH"
echo "  - Taille: $APK_SIZE"
echo
print_message "Prochaines étapes:"
echo "  1. Tester l'APK sur un appareil/émulateur"
echo "  2. Configurer Firebase Console si pas encore fait"
echo "  3. Développer les fonctionnalités avancées"
echo "  4. Préparer le déploiement sur Google Play"
echo
print_message "Pour installer manuellement:"
echo "  adb install $APK_PATH"
echo
print_message "Documentation complète: README.md"