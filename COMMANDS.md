# 📋 Commandes Essentielles - ChatApp

## 🚀 Développement

### Installation
```bash
# Installation initiale
npm install

# iOS uniquement (macOS)
cd ios && pod install && cd ..
```

### Lancement
```bash
# Démarrer Metro Bundler
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios

# Lancer avec cache vidé
npm start -- --reset-cache
```

### Debug et Tests
```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Linting
npm run lint

# Corriger automatiquement le linting
npm run lint:fix
```

## 🔧 Build et Production

### Android
```bash
# Build de développement
npm run android

# Build de production
cd android
./gradlew assembleRelease
cd ..

# Nettoyer le build Android
cd android && ./gradlew clean && cd ..
```

### iOS
```bash
# Build de développement
npm run ios

# Build de production
npm run ios -- --configuration Release

# Nettoyer les pods
cd ios && pod deintegrate && pod install && cd ..
```

## 🛠️ Maintenance

### Nettoyage
```bash
# Nettoyer node_modules
rm -rf node_modules && npm install

# Nettoyer Metro cache
npx react-native start --reset-cache

# Nettoyer Watchman
watchman watch-del-all

# Nettoyage complet
npm run clean
```

### Mise à jour
```bash
# Mettre à jour les dépendances
npm update

# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour React Native
npx react-native upgrade
```

## 🐛 Debug et Logs

### Logs
```bash
# Logs Android
npx react-native log-android

# Logs iOS
npx react-native log-ios

# Logs Metro
npm start -- --verbose
```

### Debug
```bash
# Ouvrir le menu debug (Android)
adb shell input keyevent 82

# Reload sur Android
adb shell input text "RR"

# Flipper pour le debugging avancé
npx flipper
```

## 📱 Émulateurs

### Android
```bash
# Lister les émulateurs
emulator -list-avds

# Démarrer un émulateur
emulator -avd Pixel_4_API_30

# Installer l'APK manuellement
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS
```bash
# Lister les simulateurs
xcrun simctl list devices

# Ouvrir le simulateur
open -a Simulator

# Installer sur un simulateur spécifique
npx react-native run-ios --simulator="iPhone 13"
```

## 🔥 Firebase

### Configuration
```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser Firebase dans le projet
firebase init

# Déployer les fonctions Cloud
firebase deploy --only functions
```

### Firestore
```bash
# Exporter les données Firestore
gcloud firestore export gs://your-bucket/exports

# Importer les données Firestore
gcloud firestore import gs://your-bucket/exports
```

## 📦 Gestion des Packages

### Ajout de packages
```bash
# Ajouter un package standard
npm install package-name

# Ajouter un package React Native
npm install react-native-package-name

# Lier automatiquement (RN < 0.60)
npx react-native link

# Installer les pods iOS après ajout
cd ios && pod install && cd ..
```

### Suppression de packages
```bash
# Supprimer un package
npm uninstall package-name

# Nettoyer après suppression
cd ios && pod install && cd ..
```

## 🔍 Analyse et Performance

### Bundle Analyzer
```bash
# Analyser la taille du bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-bundle.js --assets-dest android-assets

# Analyser les performances
npx flipper
```

### Profiling
```bash
# Profiler avec Hermes (Android)
npx react-native profile-hermes

# Générateur de rapport de performance
npx react-native run-android --variant=release
```

## 🚢 Déploiement

### Android Play Store
```bash
# Générer une clé de signature
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Build signé pour production
cd android && ./gradlew assembleRelease
```

### iOS App Store
```bash
# Archive pour l'App Store
xcodebuild -workspace ios/ChatApp.xcworkspace -scheme ChatApp archive

# Ou via Xcode
open ios/ChatApp.xcworkspace
```

## 🔄 Scripts Personnalisés

### Scripts package.json utiles
```json
{
  "scripts": {
    "clean": "npx react-native clean",
    "android:clean": "cd android && ./gradlew clean && cd ..",
    "ios:clean": "cd ios && xcodebuild clean && cd ..",
    "fresh-install": "rm -rf node_modules && npm install && cd ios && pod install && cd ..",
    "reset": "npm run clean && npm run fresh-install"
  }
}
```

## ⚡ Raccourcis Utiles

### Émulateur Android
- `Ctrl + M` (ou `Cmd + M`) : Menu développeur
- `R + R` : Reload
- `Ctrl + Shift + Z` : Ouvrir l'inspecteur

### Simulateur iOS  
- `Cmd + R` : Reload
- `Cmd + D` : Menu développeur
- `Cmd + Shift + Z` : Secouer l'appareil

### Metro Bundler
- `R` : Reload toutes les plateformes
- `D` : Ouvrir le menu développeur
- `I` : Lancer sur iOS
- `A` : Lancer sur Android

---

💡 **Conseil** : Créez des alias dans votre terminal pour les commandes fréquentes :
```bash
alias rn-android="npm run android"
alias rn-ios="npm run ios"
alias rn-clean="npm run clean"
```