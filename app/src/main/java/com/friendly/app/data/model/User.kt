package com.friendly.app.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

/**
 * Modèle de données représentant un utilisateur de l'application
 * 
 * Cette classe contient toutes les informations d'un utilisateur :
 * - Informations de base (id, nom, email)
 * - Informations de profil (âge, genre, bio, photo)
 * - Préférences et paramètres
 * - Statut en ligne
 * 
 * @property id Identifiant unique de l'utilisateur (Firebase UID)
 * @property email Adresse email de l'utilisateur
 * @property name Nom complet de l'utilisateur
 * @property age Âge de l'utilisateur
 * @property gender Genre de l'utilisateur
 * @property bio Biographie de l'utilisateur
 * @property photoUrl URL de la photo de profil
 * @property isOnline Statut en ligne de l'utilisateur
 * @property lastSeen Timestamp de la dernière connexion
 * @property preferences Préférences de l'utilisateur
 * @property createdAt Timestamp de création du compte
 * @property updatedAt Timestamp de dernière modification
 */
@Parcelize
data class User(
    val id: String = "",
    val email: String = "",
    val name: String = "",
    val age: Int = 0,
    val gender: Gender = Gender.OTHER,
    val bio: String = "",
    val photoUrl: String = "",
    val isOnline: Boolean = false,
    val lastSeen: Long = 0L,
    val preferences: UserPreferences = UserPreferences(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) : Parcelable {
    
    /**
     * Vérifie si l'utilisateur a un profil complet
     * 
     * @return true si le profil est complet, false sinon
     */
    fun hasCompleteProfile(): Boolean {
        return name.isNotBlank() && 
               age >= 18 && 
               bio.isNotBlank() && 
               photoUrl.isNotBlank()
    }
    
    /**
     * Obtient l'âge en années depuis la date de naissance
     * 
     * @return Âge en années
     */
    fun getAgeInYears(): Int {
        return age
    }
    
    /**
     * Vérifie si l'utilisateur est majeur
     * 
     * @return true si l'utilisateur est majeur, false sinon
     */
    fun isAdult(): Boolean {
        return age >= 18
    }
}

/**
 * Enumération des genres disponibles
 */
enum class Gender {
    MALE, FEMALE, OTHER
}

/**
 * Préférences utilisateur pour les rencontres
 * 
 * @property preferredGender Genre préféré pour les rencontres
 * @property minAge Âge minimum préféré
 * @property maxAge Âge maximum préféré
 * @property maxDistance Distance maximum en km
 * @property showOnlineStatus Afficher le statut en ligne
 * @property allowNotifications Autoriser les notifications
 */
@Parcelize
data class UserPreferences(
    val preferredGender: Gender = Gender.OTHER,
    val minAge: Int = 18,
    val maxAge: Int = 100,
    val maxDistance: Int = 50,
    val showOnlineStatus: Boolean = true,
    val allowNotifications: Boolean = true
) : Parcelable