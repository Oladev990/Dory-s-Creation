package com.friendly.app.di

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ktx.database
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.ktx.messaging
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.ktx.storage
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Module Hilt pour l'injection de dépendances Firebase
 * 
 * Ce module fournit les instances Firebase nécessaires :
 * - Firebase Auth pour l'authentification
 * - Firestore pour la base de données
 * - Realtime Database pour la messagerie
 * - Storage pour les fichiers
 * - Messaging pour les notifications
 */
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    /**
     * Fournit l'instance Firebase Auth
     * 
     * @return Instance Firebase Auth
     */
    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth {
        return Firebase.auth
    }
    
    /**
     * Fournit l'instance Firestore
     * 
     * @return Instance Firestore
     */
    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore {
        return Firebase.firestore
    }
    
    /**
     * Fournit l'instance Realtime Database
     * 
     * @return Instance Realtime Database
     */
    @Provides
    @Singleton
    fun provideFirebaseDatabase(): FirebaseDatabase {
        return Firebase.database
    }
    
    /**
     * Fournit l'instance Firebase Storage
     * 
     * @return Instance Firebase Storage
     */
    @Provides
    @Singleton
    fun provideFirebaseStorage(): FirebaseStorage {
        return Firebase.storage
    }
    
    /**
     * Fournit l'instance Firebase Messaging
     * 
     * @return Instance Firebase Messaging
     */
    @Provides
    @Singleton
    fun provideFirebaseMessaging(): FirebaseMessaging {
        return Firebase.messaging
    }
}