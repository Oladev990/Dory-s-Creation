#!/bin/bash

# 🚀 Script de Génération APK ChatApp
# Ce script automatise la création d'un APK prêt à installer

echo "📱 ============================================="
echo "🚀 Génération APK ChatApp - Version 1.0.0"
echo "============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
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

# Vérifier que le dossier android existe
if [ ! -d "android" ]; then
    print_error "Le dossier android n'existe pas"
    exit 1
fi

print_status "Nettoyage des builds précédents..."
cd android

# Nettoyer les builds précédents
./gradlew clean > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Nettoyage terminé"
else
    print_warning "Erreur lors du nettoyage (continuons quand même)"
fi

print_status "Vérification des dépendances..."

# Vérifier que Java est installé
if ! command -v java &> /dev/null; then
    print_error "Java n'est pas installé. Veuillez installer Java 11 ou plus récent."
    exit 1
fi

# Vérifier la version de Java
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 11 ]; then
    print_error "Java 11 ou plus récent est requis. Version actuelle: $JAVA_VERSION"
    exit 1
fi

print_success "Java $JAVA_VERSION détecté"

print_status "Génération de l'APK debug (signature automatique)..."

# Générer l'APK debug
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    print_success "APK généré avec succès!"
    
    # Vérifier que l'APK existe
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        # Calculer la taille de l'APK
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        print_success "Taille de l'APK: $APK_SIZE"
        
        # Copier l'APK vers la racine du projet avec un nom plus explicite
        cd ..
        cp "android/$APK_PATH" "ChatApp-v1.0.0-debug.apk"
        
        print_success "APK copié vers: ChatApp-v1.0.0-debug.apk"
        
        # Afficher les informations de l'APK
        print_status "Informations de l'APK:"
        echo "  📍 Emplacement: $(pwd)/ChatApp-v1.0.0-debug.apk"
        echo "  📦 Taille: $APK_SIZE"
        echo "  🆔 Package: com.chatapp"
        echo "  📱 Version: 1.0.0"
        echo "  🔧 Type: Debug (auto-signé)"
        
        echo ""
        echo "✅ ============================================="
        echo "🎉 APK PRÊT À INSTALLER!"
        echo "============================================="
        echo ""
        echo "📲 Pour installer sur un appareil Android:"
        echo "   1. Activez 'Sources inconnues' dans les paramètres"
        echo "   2. Transférez le fichier ChatApp-v1.0.0-debug.apk"
        echo "   3. Ouvrez le fichier sur l'appareil"
        echo "   4. Suivez les instructions d'installation"
        echo ""
        echo "🔧 Pour installer via ADB (appareil connecté):"
        echo "   adb install ChatApp-v1.0.0-debug.apk"
        echo ""
        echo "📝 Note: Ceci est un APK de debug. Pour la production,"
        echo "   configurez une clé de signature et utilisez assembleRelease"
        
    else
        print_error "APK non trouvé à l'emplacement attendu: $APK_PATH"
        exit 1
    fi
else
    print_error "Échec de la génération de l'APK"
    print_status "Logs d'erreur:"
    ./gradlew assembleDebug --stacktrace
    exit 1
fi