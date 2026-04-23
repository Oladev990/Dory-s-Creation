# 🚀 Guide de configuration Firebase

## 📋 Table des matières

1. [Configuration initiale](#configuration-initiale)
2. [Obtenir les clés Firebase](#obtenir-les-clés-firebase)
3. [Configurer Google Sign-In](#configurer-google-sign-in)
4. [Tester la configuration](#tester-la-configuration)
5. [Dépannage](#dépannage)

---

## 1. Configuration initiale

### Prérequis

- Un compte Google (https://accounts.google.com)
- Accès à Google Cloud Console
- Accès à Firebase Console

### Étapes

```bash
# 1. Copier le fichier d'exemple
cp .env.example .env

# 2. Créer un projet Firebase (voir section suivante)

# 3. Remplir .env avec vos clés

# 4. Installer les dépendances
npm install react-native-keychain react-native-dotenv

# 5. Relancer l'app
npm start -- --reset-cache
```

---

## 2. Obtenir les clés Firebase

### Étape 1: Créer un projet Firebase

1. Aller sur https://console.firebase.google.com
2. Cliquer sur **"Ajouter un projet"**
3. Donner un nom au projet: `Dorys-Creation` (par exemple)
4. Cliquer sur **"Créer un projet"**

### Étape 2: Ajouter une application React Native

1. Dans Firebase Console, cliquer sur l'icône **"</>"** pour ajouter une app
2. Sélectionner **"React Native"**
3. Donner un surnom à l'app: `Dorys-Creation-App`
4. Cliquer sur **"Enregistrer l'app"**

### Étape 3: Copier la configuration

La page affichera une configuration comme celle-ci:

```javascript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:android:abcdef1234567890"
};
```

### Étape 4: Ajouter à `.env`

Copier les valeurs dans votre fichier `.env`:

```bash
FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:android:abcdef1234567890
```

### Étape 5: Configurer l'authentification

1. Dans Firebase Console, aller à **"Authentication"**
2. Cliquer sur **"Configurer la première méthode de connexion"**
3. Activer **"Email/Mot de passe"**
4. Activer **"Téléphone"** (optionnel)
5. Activer **"Google"** (voir section suivante)

---

## 3. Configurer Google Sign-In

### Étape 1: Créer des identifiants Google Cloud

1. Aller sur https://console.cloud.google.com
2. Sélectionner votre projet Dorys-Creation
3. Aller à **"Identifiants"** dans le menu de gauche
4. Cliquer sur **"Créer des identifiants"** → **"Identifiant OAuth"**

### Étape 2: Créer un identifiant OAuth pour web

1. Choisir **"Application Web"** comme type
2. Donner un nom: `Dorys-Web-Client`
3. Ajouter les URL autorisées:
   ```
   http://localhost:3000
   http://localhost:5000
   ```
4. Cliquer sur **"Créer"**
5. Copier le **"Client ID"** (ressemble à: `xxx.apps.googleusercontent.com`)

### Étape 3: Ajouter à `.env`

```bash
GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Étape 4: Configurer Android (optionnel)

Si vous développez pour Android, il faut aussi une clé Android:

1. Dans Google Cloud Console, créer un identifiant **"Android"**
2. Ajouter votre package name: `com.doryscreation` (ou similaire)
3. Obtenir votre SHA-1 certificate fingerprint:
   ```bash
   # Sur macOS/Linux
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
4. Ajouter le SHA-1 dans Google Cloud Console
5. Télécharger le fichier `google-services.json`
6. Placer le fichier dans `android/app/`

### Étape 5: Configurer iOS (optionnel)

Si vous développez pour iOS:

1. Dans Firebase Console, sélectionner l'application iOS
2. Télécharger `GoogleService-Info.plist`
3. Ajouter le fichier au projet Xcode

---

## 4. Tester la configuration

### Test 1: Vérifier Firebase

Ajouter ce code dans `App.tsx`:

```typescript
import { useEffect } from 'react';
import firebaseService from '@/services/firebase';

export default function App() {
  useEffect(() => {
    // Afficher le statut de configuration
    firebaseService.printConfigurationStatus();

    // Tester la connexion
    firebaseService.testConnection().then((isConnected) => {
      console.log('Firebase connected:', isConnected);
    });
  }, []);

  return (
    // ... votre app
  );
}
```

**Résultat attendu dans la console:**
```
=== Firebase Configuration Status ===
API Key: ✅ Configured
Auth Domain: ✅ Configured
Project ID: ✅ Configured
Storage Bucket: ✅ Configured
App ID: ✅ Configured
Overall Status: ✅ READY
=====================================
✅ Firebase connection test passed
```

### Test 2: Tester l'authentification

```typescript
import { useApp } from '@/context/AppContext';

export default function LoginTest() {
  const { signUp } = useApp();

  const testSignUp = async () => {
    try {
      await signUp('test@example.com', 'password123', 'Test User');
      console.log('✅ Sign up successful');
    } catch (error) {
      console.error('❌ Sign up failed:', error);
    }
  };

  return (
    <TouchableOpacity onPress={testSignUp}>
      <Text>Test Sign Up</Text>
    </TouchableOpacity>
  );
}
```

### Test 3: Tester le Keychain (stockage sécurisé)

```typescript
import authService from '@/services/authService';

// Après la connexion
const privateKey = await authService.getPrivateKey();
console.log('Private key retrieved:', privateKey ? '✅ Found' : '❌ Not found');
```

---

## 5. Dépannage

### Erreur: "Firebase not configured"

**Cause:** Les variables d'environnement ne sont pas chargées

**Solution:**
```bash
# 1. Vérifier que .env existe
ls -la .env

# 2. Vérifier le contenu
cat .env

# 3. Vérifier babel.config.js
cat babel.config.js

# 4. Relancer l'app
npm start -- --reset-cache
```

### Erreur: "Auth domain mismatch"

**Cause:** L'authDomain dans `.env` ne correspond pas à Firebase Console

**Solution:**
1. Ouvrir Firebase Console
2. Aller à **Project Settings**
3. Vérifier le **Auth Domain** exact
4. Mettre à jour `.env` avec la bonne valeur

### Erreur: "Google Sign-In not working"

**Cause:** Le `GOOGLE_WEB_CLIENT_ID` est incorrect

**Solution:**
1. Aller sur https://console.cloud.google.com
2. Vérifier le **Client ID** OAuth
3. Copier la bonne valeur dans `.env`
4. Redémarrer l'app

### Erreur: "Keychain operation failed" (iOS)

**Cause:** Les permissions Keychain ne sont pas configurées

**Solution:**
1. Ouvrir Xcode
2. Sélectionner le target
3. Aller à **Signing & Capabilities**
4. Ajouter **Keychain Sharing** si nécessaire

### Variables d'env vides

**Cause:** `react-native-dotenv` n'est pas correctement configuré

**Solution:**
```bash
# Vérifier l'installation
npm list react-native-dotenv

# Mettre à jour babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
      },
    ],
  ],
};

# Relancer
npm start -- --reset-cache
```

---

## 📞 Support supplémentaire

### Ressources officielles

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firebase Console:** https://console.firebase.google.com
- **Google Cloud Console:** https://console.cloud.google.com
- **React Native Firebase:** https://rnfirebase.io

### Vérifier les logs

```bash
# Android
npm run android -- --logcat

# iOS
npm run ios
```

---

**Validé:** 23 Avril 2026
**Status:** ✅ READY FOR IMPLEMENTATION
