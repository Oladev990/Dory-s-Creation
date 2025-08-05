# Règles ProGuard pour l'application Friendly
# Ces règles optimisent et protègent le code lors de la compilation release

# Règles générales
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# Kotlin
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Firebase Auth
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.firebase.auth.** { *; }
-keep class com.google.android.gms.auth.** { *; }

# Firebase Firestore
-keep class com.google.firebase.firestore.** { *; }
-keep class com.google.firebase.firestore.core.** { *; }
-keep class com.google.firebase.firestore.model.** { *; }

# Firebase Realtime Database
-keep class com.google.firebase.database.** { *; }

# Firebase Storage
-keep class com.google.firebase.storage.** { *; }

# Firebase Messaging
-keep class com.google.firebase.messaging.** { *; }

# Firebase Analytics
-keep class com.google.firebase.analytics.** { *; }

# Firebase Crashlytics
-keep class com.google.firebase.crashlytics.** { *; }

# Hilt
-keep class dagger.hilt.** { *; }
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager { *; }
-keep class * extends dagger.hilt.android.internal.managers.ActivityComponentManager { *; }
-keep class * extends dagger.hilt.android.internal.managers.FragmentComponentManager { *; }
-keep class * extends dagger.hilt.android.internal.managers.ServiceComponentManager { *; }

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# Jetpack Compose
-keep class androidx.compose.** { *; }
-keepclassmembers class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Navigation Compose
-keep class androidx.navigation.** { *; }
-dontwarn androidx.navigation.**

# ViewModel
-keep class * extends androidx.lifecycle.ViewModel {
    <init>();
}
-keep class * extends androidx.lifecycle.AndroidViewModel {
    <init>(android.app.Application);
}

# LiveData
-keep class androidx.lifecycle.LiveData { *; }
-keep class androidx.lifecycle.MutableLiveData { *; }

# Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Coil
-keep class coil.** { *; }
-dontwarn coil.**

# Modèles de données de l'application
-keep class com.friendly.app.data.model.** { *; }
-keep class com.friendly.app.data.repository.** { *; }

# ViewModels de l'application
-keep class com.friendly.app.ui.**.ViewModel { *; }
-keep class com.friendly.app.ui.**.UiState { *; }

# Services de l'application
-keep class com.friendly.app.service.** { *; }

# Application
-keep class com.friendly.app.FriendlyApplication { *; }

# Règles pour les ressources
-keep class **.R$* {
    public static <fields>;
}

# Règles pour les animations
-keep class android.animation.** { *; }
-keep class android.view.animation.** { *; }

# Règles pour les permissions
-keep class android.permission.** { *; }

# Règles pour les notifications
-keep class android.app.Notification** { *; }
-keep class android.app.NotificationManager** { *; }

# Règles pour les intents
-keep class android.content.Intent { *; }
-keep class android.content.IntentFilter { *; }

# Règles pour les bundles
-keep class android.os.Bundle { *; }
-keep class android.os.Parcelable { *; }

# Règles pour les serialization
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Règles pour les annotations
-keep @interface androidx.annotation.Keep
-keep @androidx.annotation.Keep class *
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# Règles pour les tests (à supprimer en production)
-dontnote junit.framework.**
-dontnote junit.runner.**

# Règles pour les logs (à supprimer en production)
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}

# Optimisations
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Règles pour réduire la taille
-repackageclasses ''
-allowaccessmodification

# Règles pour les exceptions
-keep public class * extends java.lang.Exception

# Règles pour les interfaces
-keep interface * {
    @retrofit2.http.* <methods>;
}

# Règles pour les enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Règles pour les inner classes
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# Règles pour les méthodes natives
-keepclasseswithmembernames class * {
    native <methods>;
}

# Règles pour les constructeurs
-keepclassmembers class * {
    @androidx.annotation.Keep <init>(...);
}

# Règles pour les champs
-keepclassmembers class * {
    @androidx.annotation.Keep <fields>;
}

# Règles pour les méthodes
-keepclassmembers class * {
    @androidx.annotation.Keep <methods>;
}