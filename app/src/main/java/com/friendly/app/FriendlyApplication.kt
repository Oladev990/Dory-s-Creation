package com.friendly.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import dagger.hilt.android.HiltAndroidApp

/**
 * Classe Application principale de l'application Friendly
 * 
 * Cette classe initialise :
 * - Hilt pour l'injection de dépendances
 * - Les canaux de notifications
 * - Firebase
 * 
 * @author Friendly Team
 */
@HiltAndroidApp
class FriendlyApplication : Application() {
    
    companion object {
        // Constantes pour les canaux de notifications
        const val CHANNEL_ID_MESSAGES = "messages_channel"
        const val CHANNEL_ID_FRIEND_REQUESTS = "friend_requests_channel"
        const val CHANNEL_ID_GAME_INVITATIONS = "game_invitations_channel"
        const val CHANNEL_ID_GENERAL = "general_channel"
    }
    
    override fun onCreate() {
        super.onCreate()
        
        // Créer les canaux de notifications pour Android 8.0+
        createNotificationChannels()
    }
    
    /**
     * Crée les canaux de notifications nécessaires pour l'application
     * 
     * Les canaux permettent de grouper les notifications par type
     * et de permettre à l'utilisateur de configurer les préférences
     * pour chaque type de notification.
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // Canal pour les messages
            val messagesChannel = NotificationChannel(
                CHANNEL_ID_MESSAGES,
                "Messages",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications pour les nouveaux messages"
                enableVibration(true)
                enableLights(true)
            }
            
            // Canal pour les demandes d'amis
            val friendRequestsChannel = NotificationChannel(
                CHANNEL_ID_FRIEND_REQUESTS,
                "Demandes d'amis",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications pour les nouvelles demandes d'amis"
                enableVibration(true)
            }
            
            // Canal pour les invitations de jeux
            val gameInvitationsChannel = NotificationChannel(
                CHANNEL_ID_GAME_INVITATIONS,
                "Invitations de jeux",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications pour les invitations à jouer"
                enableVibration(true)
                enableLights(true)
            }
            
            // Canal général
            val generalChannel = NotificationChannel(
                CHANNEL_ID_GENERAL,
                "Général",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notifications générales de l'application"
            }
            
            // Créer tous les canaux
            notificationManager.createNotificationChannels(
                listOf(
                    messagesChannel,
                    friendRequestsChannel,
                    gameInvitationsChannel,
                    generalChannel
                )
            )
        }
    }
}