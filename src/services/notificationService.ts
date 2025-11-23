import { Platform, Alert } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { NotificationData, AppError } from '@/types';
import authService from './authService';
import firebaseService, { COLLECTIONS } from './firebase';

/**
 * Service de gestion des notifications push
 * Gère l'enregistrement, l'envoi et la réception des notifications
 */
class NotificationService {
  private isInitialized = false;

  /**
   * Initialise le service de notifications
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Demander la permission pour les notifications
      await this.requestPermission();

      // Configurer les notifications locales
      this.configureLocalNotifications();

      // Configurer les écouteurs Firebase Messaging
      this.setupFirebaseMessaging();

      // Obtenir et sauvegarder le token FCM
      await this.updateFCMToken();

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
      throw this.createAppError('NOTIFICATION_INIT_ERROR', 'Erreur lors de l\'initialisation des notifications', error);
    }
  }

  /**
   * Demande la permission pour les notifications
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        Alert.alert(
          'Notifications désactivées',
          'Pour recevoir les messages en temps réel, veuillez activer les notifications dans les paramètres.',
          [{ text: 'OK' }]
        );
      }

      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Configure les notifications locales
   */
  private configureLocalNotifications(): void {
    PushNotification.configure({
      // Callback appelé quand une notification est reçue
      onNotification: (notification) => {
        console.log('Local notification received:', notification);
        
        if (notification.userInteraction) {
          // L'utilisateur a touché la notification
          this.handleNotificationOpen(notification.data);
        }
      },

      // Callback appelé quand le token est généré (iOS)
      onRegister: (token) => {
        console.log('Push notification token:', token);
      },

      // Permissions iOS
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Demander les permissions au démarrage (iOS)
      requestPermissions: Platform.OS === 'ios',
    });

    // Créer le canal de notification (Android)
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'chat-messages',
          channelName: 'Messages',
          channelDescription: 'Notifications pour les nouveaux messages',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Notification channel created: ${created}`)
      );
    }
  }

  /**
   * Configure Firebase Messaging
   */
  private setupFirebaseMessaging(): void {
    // Écouter les messages en premier plan
    messaging().onMessage(async (remoteMessage) => {
      console.log('FCM message received in foreground:', remoteMessage);
      
      if (remoteMessage.notification) {
        this.showLocalNotification(
          remoteMessage.notification.title || 'Nouveau message',
          remoteMessage.notification.body || '',
          remoteMessage.data
        );
      }
    });

    // Écouter les messages en arrière-plan/fermé
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('FCM message received in background:', remoteMessage);
      
      // Les notifications en arrière-plan sont gérées automatiquement par FCM
      // Ici on peut traiter les données personnalisées si nécessaire
    });

    // Gérer l'ouverture de l'app via une notification
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('App opened via notification:', remoteMessage);
      this.handleNotificationOpen(remoteMessage.data);
    });

    // Vérifier si l'app a été ouverte via une notification (app fermée)
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log('App opened from notification (killed state):', remoteMessage);
        this.handleNotificationOpen(remoteMessage.data);
      }
    });

    // Écouter les changements de token
    messaging().onTokenRefresh((token) => {
      console.log('FCM token refreshed:', token);
      this.updateFCMToken(token);
    });
  }

  /**
   * Affiche une notification locale
   */
  private showLocalNotification(title: string, message: string, data?: any): void {
    PushNotification.localNotification({
      channelId: 'chat-messages',
      title,
      message,
      playSound: true,
      soundName: 'default',
      userInfo: data,
      actions: ['Répondre', 'Marquer comme lu'],
    });
  }

  /**
   * Gère l'ouverture d'une notification
   */
  private handleNotificationOpen(data?: any): void {
    if (!data) return;

    const notificationData = data as NotificationData;
    
    switch (notificationData.type) {
      case 'message':
        if (notificationData.conversationId) {
          // Naviguer vers la conversation
          this.navigateToConversation(notificationData.conversationId);
        }
        break;
      
      case 'call':
        // Gérer les appels (à implémenter)
        break;
      
      case 'contact_request':
        // Gérer les demandes de contact
        break;
      
      default:
        console.log('Unknown notification type:', notificationData.type);
    }
  }

  /**
   * Navigation vers une conversation (à implémenter avec le router)
   */
  private navigateToConversation(conversationId: string): void {
    // Cette fonction devra être connectée au système de navigation
    console.log('Navigate to conversation:', conversationId);
    
    // Exemple d'implémentation avec React Navigation:
    // NavigationService.navigate('Chat', { conversationId });
  }

  /**
   * Met à jour le token FCM de l'utilisateur
   */
  async updateFCMToken(token?: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      const fcmToken = token || await messaging().getToken();
      
      if (fcmToken) {
        // Sauvegarder le token dans Firestore
        await firebaseService.firestore
          .collection(COLLECTIONS.USERS)
          .doc(currentUser.id)
          .update({
            fcmToken,
            tokenUpdatedAt: firebaseService.firestore.FieldValue.serverTimestamp(),
          });

        console.log('FCM token updated successfully');
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  }

  /**
   * Envoie une notification push à un utilisateur
   */
  async sendNotificationToUser(
    userId: string, 
    title: string, 
    body: string, 
    data?: NotificationData
  ): Promise<void> {
    try {
      // Récupérer le token FCM de l'utilisateur destinataire
      const userDoc = await firebaseService.firestore
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        throw this.createAppError('USER_NOT_FOUND', 'Utilisateur non trouvé');
      }

      const userData = userDoc.data()!;
      const fcmToken = userData.fcmToken;

      if (!fcmToken) {
        console.log('User has no FCM token, skipping notification');
        return;
      }

      // Construire le message FCM
      const message: FirebaseMessagingTypes.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: data ? {
          type: data.type,
          conversationId: data.conversationId || '',
          senderId: data.senderId || '',
          messageText: data.messageText || '',
          senderName: data.senderName || '',
        } : undefined,
        android: {
          notification: {
            channelId: 'chat-messages',
            priority: 'high',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Envoyer la notification via FCM
      await messaging().send(message);
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      throw this.createAppError('SEND_NOTIFICATION_ERROR', 'Erreur lors de l\'envoi de la notification', error);
    }
  }

  /**
   * Envoie une notification de nouveau message
   */
  async sendMessageNotification(
    recipientId: string,
    senderName: string,
    messageText: string,
    conversationId: string,
    senderId: string
  ): Promise<void> {
    try {
      const title = senderName;
      const body = messageText.length > 100 
        ? messageText.substring(0, 100) + '...' 
        : messageText;

      const data: NotificationData = {
        type: 'message',
        conversationId,
        senderId,
        messageText,
        senderName,
      };

      await this.sendNotificationToUser(recipientId, title, body, data);
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }

  /**
   * Met à jour le badge de l'application (iOS)
   */
  updateAppBadge(count: number): void {
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(count);
    }
  }

  /**
   * Efface toutes les notifications
   */
  clearAllNotifications(): void {
    PushNotification.removeAllDeliveredNotifications();
    this.updateAppBadge(0);
  }

  /**
   * Efface les notifications d'une conversation spécifique
   */
  clearConversationNotifications(conversationId: string): void {
    // Note: React Native Push Notification ne supporte pas le filtrage par ID
    // Une approche alternative serait de maintenir une liste des notifications
    // et de les supprimer individuellement
    
    PushNotification.getDeliveredNotifications((notifications) => {
      notifications.forEach((notification) => {
        if (notification.userInfo?.conversationId === conversationId) {
          PushNotification.removeDeliveredNotifications([notification.identifier]);
        }
      });
    });
  }

  /**
   * Désactive les notifications pour l'utilisateur actuel
   */
  async disableNotifications(): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      await firebaseService.firestore
        .collection(COLLECTIONS.USERS)
        .doc(currentUser.id)
        .update({
          fcmToken: firebaseService.firestore.FieldValue.delete(),
          notificationsEnabled: false,
        });

      console.log('Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }

  /**
   * Reactive les notifications pour l'utilisateur actuel
   */
  async enableNotifications(): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (hasPermission) {
        await this.updateFCMToken();
        
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          await firebaseService.firestore
            .collection(COLLECTIONS.USERS)
            .doc(currentUser.id)
            .update({
              notificationsEnabled: true,
            });
        }
      }
      
      console.log('Notifications enabled');
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  }

  /**
   * Vérifie le statut des notifications
   */
  async getNotificationStatus(): Promise<{
    hasPermission: boolean;
    isEnabled: boolean;
  }> {
    try {
      const authStatus = await messaging().hasPermission();
      const hasPermission = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      const currentUser = authService.getCurrentUser();
      let isEnabled = false;
      
      if (currentUser) {
        const userDoc = await firebaseService.firestore
          .collection(COLLECTIONS.USERS)
          .doc(currentUser.id)
          .get();
          
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          isEnabled = userData.notificationsEnabled !== false && !!userData.fcmToken;
        }
      }

      return { hasPermission, isEnabled };
    } catch (error) {
      console.error('Error getting notification status:', error);
      return { hasPermission: false, isEnabled: false };
    }
  }

  /**
   * Crée un objet d'erreur standardisé
   */
  private createAppError(code: string, message: string, details?: any): AppError {
    return { code, message, details };
  }
}

// Instance singleton du service de notifications
export const notificationService = new NotificationService();

// Fonction utilitaire pour configurer les notifications
export const setupNotifications = async (): Promise<void> => {
  await notificationService.initialize();
};

export default notificationService;