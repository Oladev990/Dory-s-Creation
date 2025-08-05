# 🔧 Installation Complète - Friendly App

## 📋 Prérequis

### **1. Java JDK 11+** ✅
```bash
java -version
# Doit afficher Java 11 ou supérieur
```

### **2. Android SDK** ❌ (À installer)
```bash
# Vérifier si Android SDK est installé
which android
# Si rien n'est affiché, il faut l'installer
```

### **3. Variables d'Environnement** ❌ (À configurer)
```bash
echo $ANDROID_HOME
# Doit pointer vers le SDK Android
```

## 🚀 Installation du SDK Android

### **Option A : Android Studio (Recommandé)**

1. **Télécharger Android Studio**
   - Va sur [developer.android.com/studio](https://developer.android.com/studio)
   - Télécharge la dernière version
   - Installe Android Studio

2. **Installer le SDK**
   - Lance Android Studio
   - Va dans "Tools" > "SDK Manager"
   - Installe :
     - Android SDK Platform 34
     - Android SDK Build-Tools 34
     - Android SDK Platform-Tools

3. **Configurer les variables d'environnement**
   ```bash
   # Ajouter dans ~/.bashrc ou ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

### **Option B : SDK Standalone (Linux/Mac)**

1. **Télécharger le SDK**
   ```bash
   # Créer le dossier
   mkdir -p ~/Android/Sdk
   cd ~/Android/Sdk
   
   # Télécharger le SDK
   wget https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip
   unzip commandlinetools-linux-10406996_latest.zip
   ```

2. **Installer les composants**
   ```bash
   # Créer la structure
   mkdir -p cmdline-tools/latest
   mv cmdline-tools/* cmdline-tools/latest/
   
   # Installer les composants
   ./cmdline-tools/latest/bin/sdkmanager --install "platform-tools"
   ./cmdline-tools/latest/bin/sdkmanager --install "platforms;android-34"
   ./cmdline-tools/latest/bin/sdkmanager --install "build-tools;34.0.0"
   ```

3. **Configurer les variables**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

## 🔧 Configuration du Projet

### **1. Créer local.properties**
```bash
# Créer le fichier local.properties
echo "sdk.dir=$ANDROID_HOME" > local.properties
```

### **2. Vérifier la configuration**
```bash
# Vérifier que tout est configuré
./setup-firebase.sh
```

### **3. Tester le build**
```bash
# Build de test
./gradlew assembleDebug
```

## 📱 Émulateur Android (Optionnel)

### **Créer un émulateur**
```bash
# Lister les images disponibles
$ANDROID_HOME/emulator/emulator -list-avds

# Créer un émulateur (via Android Studio ou ligne de commande)
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd -n "Friendly_Test" -k "system-images;android-34;google_apis;x86_64"
```

### **Lancer l'émulateur**
```bash
# Lancer l'émulateur
$ANDROID_HOME/emulator/emulator -avd Friendly_Test
```

## 🎯 Génération de l'APK

### **Une fois tout configuré :**

```bash
# APK Debug
./build-complete.sh debug

# APK Release
./build-complete.sh release
```

## 🔍 Vérification

### **Vérifier l'installation**
```bash
# Java
java -version

# Android SDK
echo $ANDROID_HOME
ls $ANDROID_HOME

# ADB
adb version

# Gradle
./gradlew --version
```

### **Tester l'APK**
```bash
# Installer sur émulateur/appareil
adb install app/build/outputs/apk/debug/app-debug.apk

# Voir les logs
adb logcat | grep Friendly
```

## 🚨 Problèmes Courants

### **Erreur "SDK location not found"**
- Vérifie que `ANDROID_HOME` est défini
- Vérifie que `local.properties` contient `sdk.dir=$ANDROID_HOME`

### **Erreur "Build tools not found"**
- Installe les build tools : `sdkmanager --install "build-tools;34.0.0"`

### **Erreur "Platform not found"**
- Installe la platform : `sdkmanager --install "platforms;android-34"`

### **Erreur "ADB not found"**
- Installe platform-tools : `sdkmanager --install "platform-tools"`

## 📞 Support

Si tu rencontres des problèmes :

1. **Vérifie les prérequis** ci-dessus
2. **Consulte les logs** : `./gradlew build --info`
3. **Redémarre** le terminal après configuration des variables
4. **Vérifie les permissions** des fichiers

## 🎉 Succès !

Une fois tout configuré, tu pourras :

- ✅ Générer l'APK debug/release
- ✅ Tester sur émulateur/appareil
- ✅ Développer les fonctionnalités
- ✅ Déployer sur Google Play

---

**Friendly** - Connecter, Discuter, Jouer ! 🎯💬🎮