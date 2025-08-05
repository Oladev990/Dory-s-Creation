# 🚀 Guide Rapide - Obtenir l'APK Friendly

## 📋 Étapes Rapides

### **1. Configuration Firebase (5 minutes)**

1. **Créer le projet Firebase**
   - Va sur [console.firebase.google.com](https://console.firebase.google.com/)
   - Clique "Créer un projet"
   - Nom : `Friendly App`
   - Suis les étapes (Google Analytics optionnel)

2. **Ajouter l'application Android**
   - Dans Firebase Console, clique sur l'icône Android
   - Package : `com.friendly.app`
   - Télécharge `google-services.json`

3. **Remplacer le fichier**
   - Remplace `app/google-services.json` par ton fichier téléchargé

### **2. Activer les Services (5 minutes)**

Dans Firebase Console, active ces services :

- **Authentication** → Email/Password
- **Firestore Database** → Mode test
- **Realtime Database** → Mode test  
- **Storage** → Mode test
- **Cloud Messaging** → Automatique

### **3. Générer l'APK (2 minutes)**

```bash
# APK Debug (recommandé pour tester)
./build-complete.sh debug

# APK Release (pour distribution)
./build-complete.sh release
```

## 🎯 Commandes Utiles

```bash
# Vérifier la configuration
./setup-firebase.sh

# Build rapide
./gradlew assembleDebug

# Installer sur appareil connecté
adb install app/build/outputs/apk/debug/app-debug.apk

# Voir les logs
adb logcat | grep Friendly
```

## 📱 Tester l'APK

### **Sur Émulateur**
1. Lance un émulateur Android
2. `adb install app/build/outputs/apk/debug/app-debug.apk`
3. Ouvre l'app "Friendly"

### **Sur Appareil Physique**
1. Active le mode développeur
2. Active le débogage USB
3. Connecte l'appareil
4. `adb install app/build/outputs/apk/debug/app-debug.apk`

## 🔧 Dépannage

### **Erreur "google-services.json not found"**
- Vérifie que le fichier est dans `app/`
- Synchronise le projet Gradle

### **Erreur "Firebase not initialized"**
- Vérifie que le plugin est dans `app/build.gradle`
- Redémarre Android Studio

### **Erreur de build**
- `./gradlew clean`
- `./gradlew build --info`

### **APK ne s'installe pas**
- Vérifie les permissions sur l'appareil
- Désinstalle l'ancienne version si présente

## 📁 Structure de l'APK

```
app/build/outputs/apk/
├── debug/
│   └── app-debug.apk          # APK de test
└── release/
    └── app-release.apk        # APK de production
```

## 🎉 Félicitations !

Tu as maintenant ton APK Friendly ! 

**Prochaines étapes :**
1. Teste toutes les fonctionnalités
2. Configure Firebase Console complètement
3. Développe les fonctionnalités avancées
4. Prépare le déploiement sur Google Play

## 📞 Support

- **Documentation complète** : `README.md`
- **Scripts automatiques** : `build-complete.sh`, `setup-firebase.sh`
- **Configuration Firebase** : Voir `README.md` section Firebase

---

**Friendly** - Connecter, Discuter, Jouer ! 🎯💬🎮