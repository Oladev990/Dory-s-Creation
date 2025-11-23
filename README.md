# ChatApp - Application de Messagerie Instantanée

## 📱 Description

ChatApp est une application de messagerie instantanée moderne et sécurisée développée avec React Native. Elle offre toutes les fonctionnalités essentielles d'une application de chat, incluant le chiffrement de bout en bout, les notifications push en temps réel, et la synchronisation des contacts.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Connexion par email** avec validation
- **Connexion par numéro de téléphone** avec SMS
- **Connexion Google OAuth** (à configurer)
- **Récupération de mot de passe**
- **Création de compte** avec validation

### 💬 Messagerie
- **Messages texte en temps réel** avec Firebase Firestore
- **Envoi d'images et vidéos** avec compression
- **Envoi de fichiers** de tous types
- **Statuts de lecture** (envoyé, livré, lu)
- **Indicateurs de frappe** en temps réel
- **Chiffrement de bout en bout** (AES-256)

### 👥 Contacts
- **Synchronisation automatique** des contacts téléphoniques
- **Recherche de contacts** par nom, email ou téléphone
- **Détection des utilisateurs inscrits** dans l'application
- **Création de conversations** depuis les contacts

### 🔔 Notifications
- **Notifications push** en temps réel avec Firebase Messaging
- **Notifications locales** pour les messages reçus
- **Gestion des permissions** de notifications
- **Badges d'application** avec compteur de messages non lus

### 🎨 Interface Utilisateur
- **Design moderne** inspiré de WhatsApp
- **Interface responsive** adaptée à tous les écrans
- **Animations fluides** avec React Native Reanimated
- **Mode sombre** (à implémenter)
- **Support multilingue** (français par défaut)

### 🛡️ Sécurité
- **Chiffrement E2E** avec crypto-js
- **Stockage sécurisé** des clés avec Keychain
- **Validation des permissions** côté serveur
- **Gestion des erreurs** complète

## 🏗️ Architecture

### Structure du Projet
```
src/
├── components/          # Composants réutilisables
├── context/            # Contexte global React
├── hooks/              # Hooks personnalisés
├── navigation/         # Configuration de navigation
├── screens/            # Écrans de l'application
├── services/           # Services métier
│   ├── authService.ts      # Authentification
│   ├── messageService.ts   # Gestion des messages
│   ├── contactService.ts   # Gestion des contacts
│   ├── encryptionService.ts # Chiffrement E2E
│   ├── notificationService.ts # Notifications
│   ├── permissionService.ts # Permissions
│   └── firebase.ts         # Configuration Firebase
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

### Architecture MVVM
- **Model** : Services et types de données
- **View** : Composants React Native
- **ViewModel** : Context API pour la gestion d'état

### Technologies Utilisées
- **React Native 0.72.6** - Framework mobile
- **TypeScript** - Langage de programmation
- **Firebase** - Backend-as-a-Service
  - Firestore (Base de données)
  - Authentication (Authentification)
  - Storage (Stockage de fichiers)
  - Messaging (Notifications push)
- **React Navigation** - Navigation
- **Gifted Chat** - Interface de chat
- **Crypto-js** - Chiffrement
- **React Native Vector Icons** - Icônes

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+
- React Native CLI
- Android Studio (pour Android)
- Xcode (pour iOS)
- Compte Firebase

### 1. Installation des dépendances
```bash
# Cloner le projet
git clone <repository-url>
cd ChatApp

# Installer les dépendances npm
npm install

# Installer les pods iOS (macOS uniquement)
cd ios && pod install && cd ..
```

### 2. Configuration Firebase

#### Créer un projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet
3. Activer Authentication, Firestore, Storage et Messaging

#### Configuration Android
1. Ajouter une app Android dans Firebase
2. Télécharger `google-services.json`
3. Placer le fichier dans `android/app/`

#### Configuration iOS
1. Ajouter une app iOS dans Firebase
2. Télécharger `GoogleService-Info.plist`
3. Ajouter le fichier au projet Xcode

#### Mettre à jour la configuration
Éditer `src/services/firebase.ts` avec vos credentials :
```typescript
const firebaseConfig: FirebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

### 3. Configuration Google Sign-In
1. Aller dans Firebase Console > Authentication > Sign-in method
2. Activer Google
3. Télécharger la configuration OAuth
4. Mettre à jour `src/services/authService.ts` :
```typescript
GoogleSignin.configure({
  webClientId: 'votre-web-client-id.googleusercontent.com',
  offlineAccess: true,
});
```

### 4. Permissions Android
Ajouter dans `android/app/src/main/AndroidManifest.xml` :
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 5. Configuration iOS
Ajouter dans `ios/ChatApp/Info.plist` :
```xml
<key>NSCameraUsageDescription</key>
<string>Cette app a besoin d'accéder à la caméra pour prendre des photos</string>
<key>NSMicrophoneUsageDescription</key>
<string>Cette app a besoin d'accéder au micro pour les messages vocaux</string>
<key>NSContactsUsageDescription</key>
<string>Cette app a besoin d'accéder aux contacts pour vous connecter avec vos amis</string>
```

## 🏃‍♂️ Lancement de l'Application

### Développement
```bash
# Démarrer Metro
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS (macOS uniquement)
npm run ios
```

### Production
```bash
# Build Android
cd android && ./gradlew assembleRelease

# Build iOS
npx react-native run-ios --configuration Release
```

## 📊 Règles de Sécurité Firestore

Créer ces règles dans Firebase Console > Firestore > Rules :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs : lecture/écriture pour l'utilisateur authentifié
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conversations : lecture/écriture si l'utilisateur est participant
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages : lecture/écriture si l'utilisateur est dans la conversation
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
    }
    
    // Contacts : lecture/écriture pour le propriétaire
    match /contacts/{contactId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🔧 Fonctions Firebase Cloud

Créer ces fonctions pour les notifications automatiques :

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Envoyer notification lors d'un nouveau message
exports.sendMessageNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const conversationRef = admin.firestore()
      .collection('conversations')
      .doc(message.conversationId);
    
    const conversation = await conversationRef.get();
    const participants = conversation.data().participants;
    
    // Récupérer les tokens FCM des destinataires
    const recipients = participants.filter(id => id !== message.senderId);
    const userDocs = await Promise.all(
      recipients.map(id => admin.firestore().collection('users').doc(id).get())
    );
    
    const tokens = userDocs
      .map(doc => doc.data()?.fcmToken)
      .filter(token => token);
    
    if (tokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title: 'Nouveau message',
          body: message.content,
        },
        data: {
          conversationId: message.conversationId,
          senderId: message.senderId,
        },
      });
    }
  });
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests E2E avec Detox (à configurer)
npm run e2e
```

## 📈 Améliorations Futures

### Fonctionnalités à Ajouter
1. **Appels audio/vidéo** avec WebRTC
2. **Messages vocaux** avec enregistrement
3. **Partage de localisation** en temps réel
4. **Stories/Statuts** éphémères
5. **Groupes de discussion** avec admin
6. **Sauvegarde cloud** des conversations
7. **Mode sombre** automatique
8. **Traduction automatique** des messages
9. **Bots et assistants IA**
10. **Chiffrement quantique** pour l'avenir

### Optimisations Techniques
1. **Cache intelligent** avec React Query
2. **Compression d'images** avancée
3. **Synchronisation offline** avec Redux Persist
4. **Performance monitoring** avec Flipper
5. **Analytics** avec Firebase Analytics
6. **Crash reporting** avec Crashlytics
7. **Code splitting** pour réduire la taille
8. **Lazy loading** des conversations
9. **Virtualisation** des listes longues
10. **PWA** pour le web

### Sécurité Avancée
1. **Chiffrement RSA** véritable
2. **Authentification biométrique**
3. **Chiffrement des métadonnées**
4. **Forward secrecy** pour les messages
5. **Audit de sécurité** régulier
6. **Détection d'intrusion**
7. **Sauvegarde chiffrée**
8. **Self-destructing messages**

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour obtenir de l'aide :
1. Consulter la documentation
2. Ouvrir une issue sur GitHub
3. Contacter l'équipe de développement

## 👨‍💻 Auteur

Développé avec ❤️ par l'équipe ChatApp

---

**Note**: Cette application est un exemple éducatif. Pour une utilisation en production, assurez-vous de :
- Configurer correctement Firebase avec votre projet
- Tester l'application sur de vrais appareils
- Implémenter des tests automatisés
- Effectuer un audit de sécurité
- Respecter les réglementations sur la protection des données (RGPD, etc.)