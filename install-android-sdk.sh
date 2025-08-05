#!/bin/bash

# Script d'installation automatique du SDK Android
# Usage: ./install-android-sdk.sh

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
    echo -e "${BLUE}  Installation SDK Android${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

# Vérifier si le SDK est déjà installé
if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
    print_message "SDK Android déjà installé à: $ANDROID_HOME"
    print_message "Voulez-vous continuer l'installation ? (y/n): "
    read -r response
    if [[ ! $response =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Définir le chemin d'installation
SDK_PATH="$HOME/Android/Sdk"
print_message "Installation du SDK Android dans: $SDK_PATH"

# Créer le dossier
mkdir -p "$SDK_PATH"
cd "$SDK_PATH"

# Télécharger le SDK Command Line Tools
print_message "Téléchargement du SDK Command Line Tools..."
wget -O commandlinetools.zip "https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip"

# Extraire
print_message "Extraction du SDK..."
unzip -q commandlinetools.zip

# Créer la structure correcte
print_message "Configuration de la structure..."
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Installer les composants essentiels
print_message "Installation des composants SDK..."

# Accepter les licences
echo "y" | ./cmdline-tools/latest/bin/sdkmanager --licenses

# Installer les composants
./cmdline-tools/latest/bin/sdkmanager --install "platform-tools"
./cmdline-tools/latest/bin/sdkmanager --install "platforms;android-34"
./cmdline-tools/latest/bin/sdkmanager --install "build-tools;34.0.0"
./cmdline-tools/latest/bin/sdkmanager --install "emulator"
./cmdline-tools/latest/bin/sdkmanager --install "system-images;android-34;google_apis;x86_64"

# Nettoyer
rm commandlinetools.zip

# Configurer les variables d'environnement
print_message "Configuration des variables d'environnement..."

# Ajouter au .bashrc
BASH_RC="$HOME/.bashrc"
if [ -f "$BASH_RC" ]; then
    # Vérifier si déjà configuré
    if ! grep -q "ANDROID_HOME" "$BASH_RC"; then
        echo "" >> "$BASH_RC"
        echo "# Android SDK Configuration" >> "$BASH_RC"
        echo "export ANDROID_HOME=$SDK_PATH" >> "$BASH_RC"
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$BASH_RC"
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$BASH_RC"
        echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> "$BASH_RC"
        print_message "Variables ajoutées à $BASH_RC"
    else
        print_warning "Variables Android déjà configurées dans $BASH_RC"
    fi
fi

# Ajouter au .zshrc si il existe
ZSH_RC="$HOME/.zshrc"
if [ -f "$ZSH_RC" ]; then
    if ! grep -q "ANDROID_HOME" "$ZSH_RC"; then
        echo "" >> "$ZSH_RC"
        echo "# Android SDK Configuration" >> "$ZSH_RC"
        echo "export ANDROID_HOME=$SDK_PATH" >> "$ZSH_RC"
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$ZSH_RC"
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$ZSH_RC"
        echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> "$ZSH_RC"
        print_message "Variables ajoutées à $ZSH_RC"
    fi
fi

# Exporter pour la session actuelle
export ANDROID_HOME="$SDK_PATH"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"

# Créer local.properties dans le projet
PROJECT_DIR="$(pwd)"
if [ -f "$PROJECT_DIR/build.gradle" ]; then
    echo "sdk.dir=$SDK_PATH" > "$PROJECT_DIR/local.properties"
    print_message "Fichier local.properties créé"
fi

# Vérifier l'installation
print_message "Vérification de l'installation..."

if [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
    print_message "ADB installé ✓"
else
    print_error "ADB non trouvé"
    exit 1
fi

if [ -d "$ANDROID_HOME/platforms/android-34" ]; then
    print_message "Android Platform 34 installé ✓"
else
    print_error "Android Platform 34 non trouvé"
    exit 1
fi

if [ -d "$ANDROID_HOME/build-tools/34.0.0" ]; then
    print_message "Build Tools 34.0.0 installés ✓"
else
    print_error "Build Tools 34.0.0 non trouvés"
    exit 1
fi

# Tester ADB
print_message "Test d'ADB..."
adb version

print_message "🎉 Installation du SDK Android terminée !"
print_message ""
print_message "Prochaines étapes:"
print_message "1. Redémarre ton terminal ou exécute: source ~/.bashrc"
print_message "2. Vérifie l'installation: ./setup-firebase.sh"
print_message "3. Génère l'APK: ./build-complete.sh debug"
print_message ""
print_message "Variables d'environnement:"
echo "  ANDROID_HOME=$ANDROID_HOME"
echo "  PATH inclut maintenant les outils Android"