# 🚀 Instructions de Démarrage Rapide - ChatApp

## ⚡ Démarrage en 5 Minutes

### 1. Installation des Dépendances
```bash
npm install
```

### 2. Configuration Firebase Minimale
Créer un projet Firebase et remplacer dans `src/services/firebase.ts` :
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

### 3. Lancement
```bash
# Démarrer Metro
npm start

# Dans un autre terminal
npm run android  # ou npm run ios
```

## 📱 Test Rapide

### Créer un Compte Test
1. Ouvrir l'application
2. Cliquer sur "S'inscrire"
3. Utiliser un email test : `test@example.com`
4. Mot de passe : `123456`
5. Nom : `Utilisateur Test`

### Fonctionnalités à Tester
- ✅ Inscription/Connexion
- ✅ Navigation entre onglets
- ✅ Interface de chat
- ✅ Envoi de messages texte
- ✅ Interface des contacts
- ✅ Paramètres utilisateur

## 🔧 Configuration Avancée

### Firebase Authentication
1. Console Firebase > Authentication
2. Activer "Email/Password"
3. Optionnel : Activer Google, Téléphone

### Firestore Database
1. Console Firebase > Firestore Database
2. Créer en mode test
3. Copier les règles de sécurité du README

### Firebase Storage
1. Console Firebase > Storage
2. Activer pour les fichiers
3. Configurer les règles

### Notifications Push
1. Console Firebase > Messaging
2. Télécharger les certificats
3. Configurer FCM

## 🐛 Résolution de Problèmes

### Erreur de Build Android
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Erreur de Pods iOS
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Erreur Firebase
- Vérifier la configuration dans `firebase.ts`
- S'assurer que les services sont activés
- Vérifier les règles Firestore

### Erreur de Permissions
- Vérifier `AndroidManifest.xml`
- Vérifier `Info.plist` pour iOS
- Redémarrer l'application

## 📚 Ressources Utiles

- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Gifted Chat](https://github.com/FaridSafi/react-native-gifted-chat)

## 💡 Conseils de Développement

1. **Toujours tester sur un vrai appareil** pour les notifications
2. **Utiliser Flipper** pour le débogage
3. **Activer les logs** Firebase en mode développement
4. **Tester les permissions** sur différentes versions d'OS
5. **Sauvegarder régulièrement** vos configurations Firebase

## 🎯 Prochaines Étapes

Après le test initial, consulter le README.md pour :
- Configuration complète de Firebase
- Déploiement en production
- Fonctionnalités avancées
- Tests automatisés

## 🆘 Support

En cas de problème :
1. Vérifier cette liste de troubleshooting
2. Consulter les logs de Metro/Xcode/Android Studio
3. Rechercher l'erreur sur Stack Overflow
4. Ouvrir une issue GitHub avec les détails

Bon développement ! 🎉