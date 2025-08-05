package com.friendly.app.service

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.friendly.app.FriendlyApplication
import com.friendly.app.R
import com.friendly.app.ui.MainActivity
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
 * Service pour gérer les notifications Firebase
 * 
 * Ce service gère :
 * - La réception des notifications push
 * - L'affichage des notifications locales
 * - La navigation vers l'application
 */
class FriendlyFirebaseMessagingService : FirebaseMessagingService() {
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        
        // TODO: Envoyer le token au serveur pour les notifications
        sendRegistrationToServer(token)
    }
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Traiter le message reçu
        remoteMessage.data.isNotEmpty().let {
            // Message avec données
            val title = remoteMessage.data["title"] ?: "Friendly"
            val message = remoteMessage.data["message"] ?: "Nouvelle notification"
            val type = remoteMessage.data["type"] ?: "general"
            
            showNotification(title, message, type)
        }
        
        // Message avec notification
        remoteMessage.notification?.let { notification ->
            val title = notification.title ?: "Friendly"
            val message = notification.body ?: "Nouvelle notification"
            
            showNotification(title, message, "general")
        }
    }
    
    /**
     * Affiche une notification locale
     * 
     * @param title Titre de la notification
     * @param message Message de la notification
     * @param type Type de notification
     */
    private fun showNotification(title: String, message: String, type: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Créer l'intent pour ouvrir l'application
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("notification_type", type)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE
        )
        
        // Déterminer le canal selon le type
        val channelId = when (type) {
            "message" -> FriendlyApplication.CHANNEL_ID_MESSAGES
            "friend_request" -> FriendlyApplication.CHANNEL_ID_FRIEND_REQUESTS
            "game_invitation" -> FriendlyApplication.CHANNEL_ID_GAME_INVITATIONS
            else -> FriendlyApplication.CHANNEL_ID_GENERAL
        }
        
        // Construire la notification
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_notification)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
        
        // Afficher la notification
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
    
    /**
     * Envoie le token de registration au serveur
     * 
     * @param token Token Firebase
     */
    private fun sendRegistrationToServer(token: String) {
        // TODO: Implémenter l'envoi du token au serveur
        // Cette méthode devrait envoyer le token à votre backend
        // pour permettre l'envoi de notifications ciblées
    }
}