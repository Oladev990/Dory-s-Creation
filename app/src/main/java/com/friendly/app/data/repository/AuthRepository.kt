package com.friendly.app.data.repository

import com.friendly.app.data.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository pour gérer l'authentification des utilisateurs
 * 
 * Ce repository gère :
 * - Connexion et inscription avec Firebase Auth
 * - Gestion de l'état de connexion
 * - Récupération des informations utilisateur
 * 
 * @property auth Instance Firebase Auth
 * @property firestore Instance Firestore
 */
@Singleton
class AuthRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore
) {
    
    /**
     * Obtient l'utilisateur actuellement connecté
     * 
     * @return Utilisateur Firebase ou null si non connecté
     */
    fun getCurrentUser(): FirebaseUser? {
        return auth.currentUser
    }
    
    /**
     * Obtient l'ID de l'utilisateur actuel
     * 
     * @return ID de l'utilisateur ou null si non connecté
     */
    fun getCurrentUserId(): String? {
        return auth.currentUser?.uid
    }
    
    /**
     * Vérifie si un utilisateur est connecté
     * 
     * @return true si un utilisateur est connecté
     */
    fun isUserLoggedIn(): Boolean {
        return auth.currentUser != null
    }
    
    /**
     * Inscrit un nouvel utilisateur avec email et mot de passe
     * 
     * @param email Adresse email
     * @param password Mot de passe
     * @return Résultat de l'inscription
     */
    suspend fun registerUser(email: String, password: String): Result<FirebaseUser> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            Result.success(result.user!!)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Connecte un utilisateur avec email et mot de passe
     * 
     * @param email Adresse email
     * @param password Mot de passe
     * @return Résultat de la connexion
     */
    suspend fun loginUser(email: String, password: String): Result<FirebaseUser> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            Result.success(result.user!!)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Déconnecte l'utilisateur actuel
     */
    suspend fun logoutUser() {
        auth.signOut()
    }
    
    /**
     * Envoie un email de réinitialisation de mot de passe
     * 
     * @param email Adresse email
     * @return Résultat de l'envoi
     */
    suspend fun sendPasswordResetEmail(email: String): Result<Unit> {
        return try {
            auth.sendPasswordResetEmail(email).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Crée ou met à jour le profil utilisateur dans Firestore
     * 
     * @param user Données utilisateur
     * @return Résultat de l'opération
     */
    suspend fun createOrUpdateUserProfile(user: User): Result<Unit> {
        return try {
            val userId = auth.currentUser?.uid
                ?: return Result.failure(Exception("Utilisateur non connecté"))
            
            val userWithId = user.copy(id = userId)
            firestore.collection("users")
                .document(userId)
                .set(userWithId)
                .await()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Récupère le profil utilisateur depuis Firestore
     * 
     * @param userId ID de l'utilisateur
     * @return Profil utilisateur ou null
     */
    suspend fun getUserProfile(userId: String): User? {
        return try {
            val document = firestore.collection("users")
                .document(userId)
                .get()
                .await()
            
            document.toObject(User::class.java)
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Récupère le profil de l'utilisateur actuel
     * 
     * @return Profil utilisateur ou null
     */
    suspend fun getCurrentUserProfile(): User? {
        val userId = getCurrentUserId() ?: return null
        return getUserProfile(userId)
    }
    
    /**
     * Met à jour le statut en ligne de l'utilisateur
     * 
     * @param isOnline Statut en ligne
     * @return Résultat de l'opération
     */
    suspend fun updateOnlineStatus(isOnline: Boolean): Result<Unit> {
        return try {
            val userId = getCurrentUserId()
                ?: return Result.failure(Exception("Utilisateur non connecté"))
            
            val updates = mapOf(
                "isOnline" to isOnline,
                "lastSeen" to System.currentTimeMillis(),
                "updatedAt" to System.currentTimeMillis()
            )
            
            firestore.collection("users")
                .document(userId)
                .update(updates)
                .await()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Obtient un Flow pour observer les changements d'état d'authentification
     * 
     * @return Flow des changements d'état
     */
    fun getAuthStateFlow(): Flow<FirebaseUser?> = flow {
        emit(auth.currentUser)
        // Note: Pour une implémentation complète, on utiliserait
        // auth.addAuthStateListener() dans un callback flow
    }
}