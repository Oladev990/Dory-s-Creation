# 🎯 Friendly - Application de Rencontres avec Messagerie et Jeux

## 📱 Description

**Friendly** est une application mobile Android moderne de rencontres avec messagerie instantanée et mini-jeux intégrés, inspirée de l'ancienne application Qeep. Elle permet aux utilisateurs de se connecter, discuter et jouer ensemble dans un environnement sécurisé et convivial.

## ✨ Fonctionnalités Principales

### 🔐 Authentification Sécurisée
- Connexion/inscription avec email et mot de passe
- Authentification Firebase
- Réinitialisation de mot de passe
- Validation des données

### 👤 Gestion des Profils
- Création et modification de profils utilisateurs
- Photos de profil avec Firebase Storage
- Informations personnelles (nom, âge, genre, bio)
- Préférences de rencontres
- Vérification de l'âge (18+)

### 💬 Messagerie Instantanée
- Chat en temps réel avec Firebase Realtime Database
- Messages texte, images et emojis
- Statuts en ligne/hors ligne
- Notifications push pour nouveaux messages
- Historique des conversations

### 🎮 Mini-Jeux Intégrés
- **Tic Tac Toe** jouable en 1v1
- Invitations de jeux
- Système de matchmaking
- Historique des parties

### 👥 Système d'Amis
- Recherche d'utilisateurs
- Demandes d'amis
- Suggestions basées sur les préférences
- Gestion des relations

### 🔔 Notifications
- Notifications push en temps réel
- Canaux de notifications organisés
- Notifications pour messages, demandes d'amis, invitations de jeux

## 🛠️ Technologies Utilisées

### Frontend
- **Kotlin** - Langage de programmation principal
- **Jetpack Compose** - Interface utilisateur moderne
- **Material Design 3** - Design system
- **Navigation Compose** - Navigation entre écrans
- **ViewModel & LiveData** - Gestion d'état
- **Hilt** - Injection de dépendances

### Backend (Firebase)
- **Firebase Authentication** - Authentification des utilisateurs
- **Firestore** - Base de données NoSQL
- **Realtime Database** - Messagerie en temps réel
- **Firebase Storage** - Stockage des images
- **Firebase Cloud Messaging** - Notifications push
- **Firebase Analytics** - Analytics et métriques

### Autres
- **Coil** - Chargement d'images
- **Coroutines** - Programmation asynchrone
- **Room** - Base de données locale
- **DataStore** - Stockage des préférences

## 📋 Prérequis

### Environnement de Développement
- **Android Studio Hedgehog** (dernière version)
- **Android SDK 34** (API Level 34)
- **Kotlin 1.9+**
- **JDK 11** ou supérieur

### Compte Firebase
- Projet Firebase créé
- Services activés (Auth, Firestore, Realtime DB, Storage, Messaging)
- Fichier `google-services.json` configuré

## 🚀 Installation et Configuration

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd friendly-app
```

### 2. Configuration Firebase

#### Créer un Projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet
3. Activer les services suivants :
   - Authentication (Email/Password)
   - Firestore Database
   - Realtime Database
   - Storage
   - Cloud Messaging

#### Configurer l'Application Android
1. Dans Firebase Console, ajouter une application Android
2. Package name : `com.friendly.app`
3. Télécharger le fichier `google-services.json`
4. Placer le fichier dans le dossier `app/`

### 3. Configuration Firestore

#### Règles de Sécurité
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Jeux
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Règles Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_photos/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /chat_images/{chatId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Configuration Realtime Database

#### Règles de Sécurité
```json
{
  "rules": {
    "chats": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

### 5. Compiler et Exécuter
```bash
# Synchroniser le projet
./gradlew build

# Installer sur un émulateur ou appareil
./gradlew installDebug

# Générer l'APK
./gradlew assembleRelease
```

## 📁 Structure du Projet

```
app/
├── src/main/
│   ├── java/com/friendly/app/
│   │   ├── data/
│   │   │   ├── model/          # Modèles de données
│   │   │   └── repository/     # Repositories
│   │   ├── di/                 # Injection de dépendances (Hilt)
│   │   ├── service/            # Services (notifications)
│   │   ├── ui/
│   │   │   ├── auth/           # Écran d'authentification
│   │   │   ├── games/          # Écran des jeux
│   │   │   ├── meetings/       # Écran des rencontres
│   │   │   ├── messages/       # Écran des messages
│   │   │   ├── profile/        # Écran du profil
│   │   │   └── theme/          # Thème et styles
│   │   └── FriendlyApplication.kt
│   ├── res/
│   │   ├── drawable/           # Icônes et images
│   │   ├── values/
│   │   │   ├── colors.xml      # Couleurs
│   │   │   ├── strings.xml     # Chaînes de caractères
│   │   │   └── themes.xml      # Thèmes
│   │   └── xml/                # Configuration
│   └── AndroidManifest.xml
├── build.gradle                # Configuration du module
├── google-services.json        # Configuration Firebase
└── proguard-rules.pro         # Règles ProGuard
```

## 🎨 Design et UX

### Palette de Couleurs
- **Primaire** : Rose (#E55A8A)
- **Secondaire** : Turquoise (#4ECDC4)
- **Accent** : Jaune (#FFD93D)
- **Fond** : Blanc (#FFFFFF)
- **Surface** : Gris clair (#F8F9FA)

### Navigation
- Navigation par onglets en bas
- 4 onglets principaux : Rencontres, Jeux, Messages, Profil
- Navigation fluide avec animations

### Composants UI
- Cartes Material Design 3
- Boutons avec états visuels
- Champs de saisie avec validation
- Indicateurs de chargement
- Messages d'erreur et de succès

## 🔒 Sécurité

### Authentification
- Validation côté client et serveur
- Mots de passe sécurisés (minimum 6 caractères)
- Sessions sécurisées

### Données
- Chiffrement des messages sensibles
- Validation des données utilisateur
- Protection contre les injections

### Permissions
- Permissions minimales requises
- Demande explicite des permissions
- Gestion des refus de permissions

## 📱 Fonctionnalités Détaillées

### Écran d'Authentification
- Connexion avec email/mot de passe
- Inscription de nouveaux utilisateurs
- Réinitialisation de mot de passe
- Validation en temps réel
- Messages d'erreur explicites

### Écran des Rencontres
- Suggestions d'utilisateurs
- Système de like/dislike
- Filtres par préférences
- Profils détaillés
- Photos de profil

### Écran des Jeux
- Liste des jeux disponibles
- Invitations de jeux
- Parties en cours
- Système de matchmaking
- Historique des parties

### Écran des Messages
- Liste des conversations
- Messages en temps réel
- Statuts en ligne
- Notifications push
- Recherche de conversations

### Écran du Profil
- Informations personnelles
- Photo de profil
- Paramètres de confidentialité
- Préférences de rencontres
- Options de déconnexion

## 🧪 Tests

### Tests Unitaires
```bash
# Exécuter les tests unitaires
./gradlew test
```

### Tests d'Interface
```bash
# Exécuter les tests d'interface
./gradlew connectedAndroidTest
```

## 📦 Génération de l'APK

### Version Debug
```bash
./gradlew assembleDebug
```

### Version Release
```bash
# Signer l'APK
./gradlew assembleRelease

# L'APK sera généré dans : app/build/outputs/apk/release/
```

## 🚀 Déploiement

### Google Play Store
1. Créer un compte développeur Google Play
2. Préparer les métadonnées (description, captures d'écran)
3. Signer l'APK avec une clé de production
4. Uploader sur Google Play Console

### Distribution Interne
- APK signé pour distribution directe
- QR code pour téléchargement facile
- Installation via ADB

## 🔧 Configuration Avancée

### Variables d'Environnement
```bash
# Ajouter dans local.properties
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
```

### ProGuard
- Règles de minification configurées
- Protection du code source
- Optimisation de la taille

### Analytics
- Firebase Analytics intégré
- Métriques d'utilisation
- Rapports de performance

## 🤝 Contribution

### Guidelines
1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Créer une Pull Request

### Code Style
- Kotlin Coding Conventions
- Ktlint pour le formatage
- Documentation des fonctions

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [Jetpack Compose Documentation](https://developer.android.com/jetpack/compose)
- [Material Design 3](https://m3.material.io/)

### Issues
- Créer une issue sur GitHub
- Décrire le problème en détail
- Inclure les logs d'erreur

### Contact
- Email : support@friendly-app.com
- Discord : [Serveur Communauté](https://discord.gg/friendly-app)

## 🎉 Remerciements

- Équipe Firebase pour l'infrastructure
- Communauté Android pour les ressources
- Utilisateurs beta pour les retours

---

**Friendly** - Connecter, Discuter, Jouer ! 🎯💬🎮