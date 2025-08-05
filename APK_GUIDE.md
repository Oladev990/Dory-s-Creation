# 📱 Guide Génération APK ChatApp

## 🚀 Méthodes de Génération

### Option 1: Script Automatisé (Recommandé)

#### Linux/macOS:
```bash
npm run build:apk
# ou
chmod +x build-apk.sh && ./build-apk.sh
```

#### Windows:
```cmd
npm run build:apk:windows
# ou
build-apk.bat
```

### Option 2: Commandes Manuelles

```bash
# Nettoyer le build précédent
npm run clean:android

# Générer l'APK debug
npm run build:android-debug

# L'APK sera dans: android/app/build/outputs/apk/debug/app-debug.apk
```

## 📋 Prérequis

### 1. Java Development Kit (JDK)
```bash
# Vérifier la version Java (minimum JDK 11)
java -version

# Si pas installé, télécharger depuis:
# https://adoptium.net/temurin/releases/
```

### 2. Android SDK (optionnel pour APK simple)
Si vous voulez utiliser Android Studio:
- Télécharger Android Studio
- Installer Android SDK Platform-tools
- Configurer ANDROID_HOME

### 3. Node.js et npm
```bash
# Vérifier les versions
node -v  # >= 16.x
npm -v   # >= 8.x
```

## 🔧 Configuration Firebase (Optionnelle pour Test)

Pour un APK fonctionnel avec Firebase:

1. **Créer un projet Firebase** (console.firebase.google.com)
2. **Ajouter une app Android** avec package `com.chatapp`
3. **Télécharger google-services.json** → `android/app/`
4. **Activer les services:**
   - Authentication (Email/Password, Phone, Google)
   - Firestore Database
   - Storage
   - Cloud Messaging

## 📦 Résultat

Après génération réussie:
- **Fichier APK:** `ChatApp-v1.0.0-debug.apk`
- **Taille:** ~50-80 MB (selon les dépendances)
- **Type:** Debug (auto-signé)
- **Compatible:** Android 5.0+ (API 21+)

## 📲 Installation sur Appareil

### Méthode 1: Installation Directe
1. **Activer les sources inconnues:**
   - Paramètres → Sécurité → Sources inconnues ✅
   - Ou: Paramètres → Applications → Sources inconnues ✅

2. **Transférer l'APK:**
   - USB, Bluetooth, email, cloud, etc.

3. **Installer:**
   - Ouvrir le fichier APK sur l'appareil
   - Confirmer l'installation

### Méthode 2: ADB (Développeurs)
```bash
# Vérifier que l'appareil est connecté
adb devices

# Installer l'APK
npm run install:apk
# ou
adb install ChatApp-v1.0.0-debug.apk

# Démarrer l'app
adb shell am start -n com.chatapp/.MainActivity
```

## 🔍 Vérification APK

### Informations APK
```bash
# Analyser l'APK (si Android SDK installé)
aapt dump badging ChatApp-v1.0.0-debug.apk

# Taille de l'APK
ls -lh ChatApp-v1.0.0-debug.apk
```

### Test Fonctionnel
- ✅ Lancement de l'application
- ✅ Interface d'authentification
- ✅ Permissions (caméra, contacts, stockage)
- ⚠️ Fonctionnalités Firebase (nécessitent configuration)

## 🚨 Résolution de Problèmes

### Erreur: "Java not found"
```bash
# Installer Java 11+
sudo apt install openjdk-11-jdk  # Ubuntu/Debian
brew install openjdk@11          # macOS
# Windows: télécharger depuis adoptium.net
```

### Erreur: "Android SDK not found"
Pour APK simple, ce n'est pas nécessaire. Si besoin:
```bash
export ANDROID_HOME=/path/to/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Erreur: "Gradle build failed"
```bash
# Nettoyer et recommencer
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

### APK trop volumineux
```bash
# Activer ProGuard (dans android/app/build.gradle)
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        ...
    }
}
```

### Erreur d'installation "Parse error"
- APK corrompu → Régénérer
- Architecture incompatible → Vérifier l'appareil
- Version Android trop ancienne → Minimum API 21

## 🏭 APK de Production

Pour un APK signé (Google Play Store):

### 1. Générer une clé de signature
```bash
keytool -genkey -v -keystore release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurer gradle.properties
```properties
MYAPP_UPLOAD_STORE_FILE=release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=release
MYAPP_UPLOAD_STORE_PASSWORD=****
MYAPP_UPLOAD_KEY_PASSWORD=****
```

### 3. Générer APK release
```bash
npm run build:android-release
```

## 📊 Optimisations

### Réduire la taille
- Activer Hermes engine ✅ (déjà fait)
- Activer ProGuard/R8
- Séparer les APK par architecture
- Utiliser Android App Bundle (.aab)

### Performance
- Optimiser les images
- Lazy loading des composants
- Minimiser les dépendances

## 📞 Support

### Logs de Debug
```bash
# Logs de l'application
adb logcat | grep ChatApp

# Logs React Native
npx react-native log-android
```

### Debug sur Appareil
1. Activer les options développeur
2. Activer le débogage USB
3. Secouer l'appareil → Dev Menu

## ✅ Checklist Installation

- [ ] Java 11+ installé
- [ ] Projet ChatApp téléchargé
- [ ] Dépendances npm installées
- [ ] Script build-apk.sh exécuté
- [ ] APK généré (ChatApp-v1.0.0-debug.apk)
- [ ] Sources inconnues activées sur l'appareil
- [ ] APK transféré et installé
- [ ] Application lancée avec succès

---

**📝 Note:** Cet APK debug est prêt pour les tests. Pour une utilisation en production, configurez Firebase et générez un APK release signé.