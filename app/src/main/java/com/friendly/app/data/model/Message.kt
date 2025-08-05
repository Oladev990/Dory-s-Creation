package com.friendly.app.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

/**
 * Modèle de données représentant un message dans le chat
 * 
 * Cette classe contient toutes les informations d'un message :
 * - Contenu et type du message
 * - Informations sur l'expéditeur et le destinataire
 * - Timestamps et statut de lecture
 * 
 * @property id Identifiant unique du message
 * @property senderId ID de l'expéditeur
 * @property receiverId ID du destinataire
 * @property content Contenu du message
 * @property type Type de message (texte, image, etc.)
 * @property timestamp Timestamp d'envoi du message
 * @property isRead Statut de lecture du message
 * @property chatId ID de la conversation
 */
@Parcelize
data class Message(
    val id: String = "",
    val senderId: String = "",
    val receiverId: String = "",
    val content: String = "",
    val type: MessageType = MessageType.TEXT,
    val timestamp: Long = System.currentTimeMillis(),
    val isRead: Boolean = false,
    val chatId: String = ""
) : Parcelable {
    
    /**
     * Vérifie si le message a été envoyé par l'utilisateur actuel
     * 
     * @param currentUserId ID de l'utilisateur actuel
     * @return true si le message a été envoyé par l'utilisateur actuel
     */
    fun isFromCurrentUser(currentUserId: String): Boolean {
        return senderId == currentUserId
    }
    
    /**
     * Obtient le timestamp formaté pour l'affichage
     * 
     * @return Timestamp formaté
     */
    fun getFormattedTimestamp(): String {
        val now = System.currentTimeMillis()
        val diff = now - timestamp
        
        return when {
            diff < 60000 -> "À l'instant"
            diff < 3600000 -> "${diff / 60000} min"
            diff < 86400000 -> "${diff / 3600000} h"
            else -> "${diff / 86400000} j"
        }
    }
}

/**
 * Types de messages supportés
 */
enum class MessageType {
    TEXT,           // Message texte simple
    IMAGE,          // Message avec image
    EMOJI,          // Message avec emoji
    GAME_INVITE,    // Invitation à jouer
    FRIEND_REQUEST  // Demande d'ami
}

/**
 * Modèle de données représentant une conversation
 * 
 * @property id Identifiant unique de la conversation
 * @property participants Liste des participants
 * @property lastMessage Dernier message échangé
 * @property unreadCount Nombre de messages non lus
 * @property createdAt Timestamp de création
 * @property updatedAt Timestamp de dernière activité
 */
@Parcelize
data class Chat(
    val id: String = "",
    val participants: List<String> = emptyList(),
    val lastMessage: Message? = null,
    val unreadCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) : Parcelable {
    
    /**
     * Obtient l'autre participant de la conversation
     * 
     * @param currentUserId ID de l'utilisateur actuel
     * @return ID de l'autre participant
     */
    fun getOtherParticipant(currentUserId: String): String? {
        return participants.find { it != currentUserId }
    }
    
    /**
     * Vérifie si la conversation a des messages non lus
     * 
     * @return true s'il y a des messages non lus
     */
    fun hasUnreadMessages(): Boolean {
        return unreadCount > 0
    }
}