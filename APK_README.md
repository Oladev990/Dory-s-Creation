# 📱 ChatApp - APK Prêt à Installer

## 🎯 Génération Rapide de l'APK

### Option 1: Script Automatique (Recommandé)
```bash
# Setup complet + génération APK
chmod +x setup-and-build.sh && ./setup-and-build.sh
```

### Option 2: Génération Simple
```bash
# Si dépendances déjà installées
npm run build:apk
```

### Option 3: Windows
```cmd
build-apk.bat
```

## 📋 Prérequis Minimum

- **Java 11+** (téléchargeable sur [adoptium.net](https://adoptium.net/))
- **Node.js 16+** (téléchargeable sur [nodejs.org](https://nodejs.org/))

## 📦 Résultat

Après exécution réussie :
- **Fichier APK** : `ChatApp-v1.0.0-debug.apk`
- **Taille** : ~50-80 MB
- **Compatible** : Android 5.0+ (API 21+)

## 📲 Installation sur Android

1. **Activez les sources inconnues :**
   - Paramètres → Sécurité → Sources inconnues ✅

2. **Transférez l'APK :**
   - USB, Bluetooth, email, cloud, etc.

3. **Installez :**
   - Ouvrez le fichier APK sur l'appareil
   - Suivez les instructions

## 🔧 Installation via ADB (Développeurs)

```bash
# Vérifier l'appareil connecté
adb devices

# Installer l'APK
adb install ChatApp-v1.0.0-debug.apk
```

## ⚡ Test Rapide

L'APK contient :
- ✅ Interface d'authentification
- ✅ Navigation entre écrans
- ✅ Interface de chat (UI)
- ⚠️ Backend Firebase (nécessite configuration)

## 🚨 Résolution de Problèmes

### Java introuvable
```bash
# Ubuntu/Debian
sudo apt install openjdk-11-jdk

# macOS
brew install openjdk@11

# Windows: télécharger depuis adoptium.net
```

### Erreur de build
```bash
# Nettoyer et recommencer
npm run clean:android
npm run build:android-debug
```

## 🔥 Firebase (Optionnel)

Pour activer toutes les fonctionnalités :
1. Créez un projet sur [console.firebase.google.com](https://console.firebase.google.com)
2. Ajoutez une app Android avec package `com.chatapp`
3. Téléchargez `google-services.json` → `android/app/`
4. Activez Authentication, Firestore, Storage, Messaging

## 📞 Support

- **Guide complet** : `APK_GUIDE.md`
- **Logs** : `adb logcat | grep ChatApp`
- **Debug** : Secouez l'appareil → Dev Menu

---

**🎊 Votre application ChatApp est maintenant prête à être testée !**