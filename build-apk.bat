@echo off
setlocal EnableDelayedExpansion

echo.
echo =============================================
echo 🚀 Generation APK ChatApp - Version 1.0.0
echo =============================================
echo.

:: Vérifier que nous sommes dans le bon répertoire
if not exist "package.json" (
    echo [ERREUR] Ce script doit être exécuté depuis la racine du projet ChatApp
    pause
    exit /b 1
)

:: Vérifier que le dossier android existe
if not exist "android" (
    echo [ERREUR] Le dossier android n'existe pas
    pause
    exit /b 1
)

echo [INFO] Nettoyage des builds précédents...
cd android

:: Nettoyer les builds précédents
call gradlew.bat clean >nul 2>&1
if !errorlevel! equ 0 (
    echo [SUCCESS] Nettoyage terminé
) else (
    echo [WARNING] Erreur lors du nettoyage ^(continuons quand même^)
)

echo [INFO] Vérification des dépendances...

:: Vérifier que Java est installé
java -version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERREUR] Java n'est pas installé. Veuillez installer Java 11 ou plus récent.
    pause
    exit /b 1
)

echo [SUCCESS] Java détecté

echo [INFO] Génération de l'APK debug ^(signature automatique^)...

:: Générer l'APK debug
call gradlew.bat assembleDebug

if !errorlevel! equ 0 (
    echo [SUCCESS] APK généré avec succès!
    
    :: Vérifier que l'APK existe
    set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
    if exist "!APK_PATH!" (
        :: Calculer la taille de l'APK
        for %%A in ("!APK_PATH!") do set APK_SIZE=%%~zA
        set /a APK_SIZE_MB=!APK_SIZE!/1024/1024
        echo [SUCCESS] Taille de l'APK: !APK_SIZE_MB! MB
        
        :: Copier l'APK vers la racine du projet
        cd ..
        copy "android\!APK_PATH!" "ChatApp-v1.0.0-debug.apk" >nul
        
        echo [SUCCESS] APK copié vers: ChatApp-v1.0.0-debug.apk
        
        :: Afficher les informations de l'APK
        echo.
        echo [INFO] Informations de l'APK:
        echo   📍 Emplacement: %CD%\ChatApp-v1.0.0-debug.apk
        echo   📦 Taille: !APK_SIZE_MB! MB
        echo   🆔 Package: com.chatapp
        echo   📱 Version: 1.0.0
        echo   🔧 Type: Debug ^(auto-signé^)
        
        echo.
        echo ✅ =============================================
        echo 🎉 APK PRÊT À INSTALLER!
        echo =============================================
        echo.
        echo 📲 Pour installer sur un appareil Android:
        echo    1. Activez 'Sources inconnues' dans les paramètres
        echo    2. Transférez le fichier ChatApp-v1.0.0-debug.apk
        echo    3. Ouvrez le fichier sur l'appareil
        echo    4. Suivez les instructions d'installation
        echo.
        echo 🔧 Pour installer via ADB ^(appareil connecté^):
        echo    adb install ChatApp-v1.0.0-debug.apk
        echo.
        echo 📝 Note: Ceci est un APK de debug. Pour la production,
        echo    configurez une clé de signature et utilisez assembleRelease
        
    ) else (
        echo [ERREUR] APK non trouvé à l'emplacement attendu: !APK_PATH!
        pause
        exit /b 1
    )
) else (
    echo [ERREUR] Échec de la génération de l'APK
    echo [INFO] Logs d'erreur:
    call gradlew.bat assembleDebug --stacktrace
    pause
    exit /b 1
)

echo.
echo Appuyez sur une touche pour fermer...
pause >nul