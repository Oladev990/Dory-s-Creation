import firebaseService, { COLLECTIONS } from './firebase';
import authService from './authService';
import conversationService from './conversationService';
import encryptionService from './encryptionService';
import { Message, AppError, MediaFile } from '@/types';
import { v4 as uuidv4 } from 'react-native-uuid';

/**
 * Service de gestion des messages
 * Gère l'envoi, la réception et le chiffrement des messages
 */
class MessageService {

  /**
   * Récupère tous les messages d'une conversation
   */
  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Vérifier que l'utilisateur fait partie de la conversation
      const conversation = await conversationService.getConversationById(conversationId);
      if (!conversation || !conversation.participants.includes(currentUser.id)) {
        throw this.createAppError('UNAUTHORIZED', 'Non autorisé à accéder à cette conversation');
      }

      const messagesSnapshot = await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', conversationId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const messages: Message[] = [];
      
      for (const doc of messagesSnapshot.docs) {
        const data = doc.data();
        const message: Message = {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message;

        // Déchiffrer le message si nécessaire
        if (message.encrypted && conversation.encryptionKey) {
          try {
            const decryptedContent = await encryptionService.decryptMessage(
              {
                encryptedContent: message.content,
                iv: data.iv || '',
              },
              conversation.encryptionKey
            );
            message.content = decryptedContent;
            message.encrypted = false; // Marquer comme déchiffré pour l'affichage
          } catch (error) {
            console.error('Error decrypting message:', error);
            message.content = '[Message chiffré - erreur de déchiffrement]';
          }
        }

        messages.push(message);
      }

      return messages.reverse(); // Retourner dans l'ordre chronologique
    } catch (error) {
      console.error('Error getting messages:', error);
      throw this.createAppError('FETCH_MESSAGES_ERROR', 'Erreur lors de la récupération des messages', error);
    }
  }

  /**
   * Envoie un nouveau message dans une conversation
   */
  async sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text',
    mediaFile?: MediaFile
  ): Promise<Message> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Vérifier que l'utilisateur fait partie de la conversation
      const conversation = await conversationService.getConversationById(conversationId);
      if (!conversation || !conversation.participants.includes(currentUser.id)) {
        throw this.createAppError('UNAUTHORIZED', 'Non autorisé à envoyer un message dans cette conversation');
      }

      const messageId = uuidv4();
      const now = new Date();
      
      let messageContent = content;
      let fileURL: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let iv: string | undefined;

      // Traiter les fichiers média si présents
      if (mediaFile && type !== 'text') {
        const uploadResult = await this.uploadMediaFile(messageId, mediaFile);
        fileURL = uploadResult.url;
        fileName = mediaFile.name;
        fileSize = mediaFile.size;
        messageContent = uploadResult.url; // Le contenu devient l'URL du fichier
      }

      // Chiffrer le message si une clé de chiffrement est disponible
      let encrypted = false;
      if (conversation.encryptionKey) {
        try {
          const encryptedMessage = await encryptionService.encryptMessage(messageContent, conversation.encryptionKey);
          messageContent = encryptedMessage.encryptedContent;
          iv = encryptedMessage.iv;
          encrypted = true;
        } catch (error) {
          console.error('Error encrypting message:', error);
          // Continuer sans chiffrement en cas d'erreur
        }
      }

      // Créer le message
      const newMessage: Message = {
        id: messageId,
        conversationId,
        senderId: currentUser.id,
        content: messageContent,
        type,
        fileURL,
        fileName,
        fileSize,
        timestamp: now,
        readBy: [currentUser.id], // Le sender a déjà "lu" le message
        encrypted,
        status: 'sending',
      };

      // Sauvegarder dans Firestore
      const messageData: any = {
        ...newMessage,
        timestamp: firebaseService.firestore.Timestamp.fromDate(now),
      };

      if (iv) {
        messageData.iv = iv;
      }

      await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .doc(messageId)
        .set(messageData);

      // Mettre à jour la conversation avec le dernier message
      await conversationService.updateConversation(conversationId, {
        lastMessage: newMessage,
        lastMessageTime: now,
      });

      // Incrémenter le compteur de messages non lus pour les autres participants
      const otherParticipants = conversation.participants.filter(id => id !== currentUser.id);
      if (otherParticipants.length > 0) {
        await conversationService.incrementUnreadCount(conversationId);
      }

      // Marquer le message comme envoyé
      await this.updateMessageStatus(messageId, 'sent');
      newMessage.status = 'sent';

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw this.createAppError('SEND_MESSAGE_ERROR', 'Erreur lors de l\'envoi du message', error);
    }
  }

  /**
   * Upload un fichier média vers Firebase Storage
   */
  private async uploadMediaFile(messageId: string, mediaFile: MediaFile): Promise<{ url: string }> {
    try {
      const fileName = `messages/${messageId}/${mediaFile.name}`;
      const storageRef = firebaseService.createStorageRef(fileName);

      // Convertir l'URI du fichier en blob pour l'upload
      const response = await fetch(mediaFile.uri);
      const blob = await response.blob();

      // Upload le fichier
      await storageRef.put(blob);

      // Récupérer l'URL de téléchargement
      const downloadURL = await storageRef.getDownloadURL();

      return { url: downloadURL };
    } catch (error) {
      console.error('Error uploading media file:', error);
      throw this.createAppError('UPLOAD_ERROR', 'Erreur lors de l\'upload du fichier', error);
    }
  }

  /**
   * Met à jour le statut d'un message
   */
  async updateMessageStatus(messageId: string, status: Message['status']): Promise<void> {
    try {
      await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .doc(messageId)
        .update({ status });
    } catch (error) {
      console.error('Error updating message status:', error);
      throw this.createAppError('UPDATE_STATUS_ERROR', 'Erreur lors de la mise à jour du statut', error);
    }
  }

  /**
   * Marque un message comme lu par l'utilisateur actuel
   */
  async markAsRead(messageId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      const messageRef = firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .doc(messageId);

      await firebaseService.firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(messageRef);
        if (!doc.exists) {
          throw new Error('Message not found');
        }

        const messageData = doc.data()!;
        const readBy = messageData.readBy || [];

        if (!readBy.includes(currentUser.id)) {
          transaction.update(messageRef, {
            readBy: [...readBy, currentUser.id],
            status: 'read',
          });
        }
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw this.createAppError('MARK_READ_ERROR', 'Erreur lors du marquage comme lu', error);
    }
  }

  /**
   * Marque tous les messages d'une conversation comme lus
   */
  async markAllAsRead(conversationId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Récupérer tous les messages non lus de la conversation
      const messagesSnapshot = await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', conversationId)
        .where('senderId', '!=', currentUser.id) // Exclure les messages de l'utilisateur actuel
        .get();

      const batch = firebaseService.firestore.batch();
      let hasUpdates = false;

      messagesSnapshot.docs.forEach(doc => {
        const messageData = doc.data();
        const readBy = messageData.readBy || [];

        if (!readBy.includes(currentUser.id)) {
          batch.update(doc.ref, {
            readBy: [...readBy, currentUser.id],
            status: 'read',
          });
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        await batch.commit();
        
        // Remettre le compteur de messages non lus à zéro
        await conversationService.markConversationAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      throw this.createAppError('MARK_ALL_READ_ERROR', 'Erreur lors du marquage de tous les messages comme lus', error);
    }
  }

  /**
   * Supprime un message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Vérifier que l'utilisateur est l'expéditeur du message
      const messageDoc = await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .doc(messageId)
        .get();

      if (!messageDoc.exists) {
        throw this.createAppError('MESSAGE_NOT_FOUND', 'Message non trouvé');
      }

      const messageData = messageDoc.data()!;
      if (messageData.senderId !== currentUser.id) {
        throw this.createAppError('UNAUTHORIZED', 'Non autorisé à supprimer ce message');
      }

      // Supprimer le fichier média associé si présent
      if (messageData.fileURL) {
        try {
          const fileRef = firebaseService.storage.refFromURL(messageData.fileURL);
          await fileRef.delete();
        } catch (error) {
          console.error('Error deleting media file:', error);
          // Continuer même si la suppression du fichier échoue
        }
      }

      // Supprimer le message
      await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .doc(messageId)
        .delete();
    } catch (error) {
      console.error('Error deleting message:', error);
      throw this.createAppError('DELETE_MESSAGE_ERROR', 'Erreur lors de la suppression du message', error);
    }
  }

  /**
   * Recherche des messages dans une conversation
   */
  async searchMessages(conversationId: string, query: string): Promise<Message[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Note: Firestore ne supporte pas la recherche full-text nativamente
      // Cette implémentation est basique et pourrait être améliorée avec Algolia ou Elasticsearch
      const messagesSnapshot = await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', conversationId)
        .where('type', '==', 'text') // Rechercher uniquement dans les messages texte
        .orderBy('timestamp', 'desc')
        .get();

      const messages: Message[] = [];
      const lowerQuery = query.toLowerCase();

      for (const doc of messagesSnapshot.docs) {
        const data = doc.data();
        const message: Message = {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message;

        // Vérifier si le contenu contient la requête (recherche simple)
        if (message.content.toLowerCase().includes(lowerQuery)) {
          messages.push(message);
        }
      }

      return messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw this.createAppError('SEARCH_ERROR', 'Erreur lors de la recherche de messages', error);
    }
  }

  /**
   * Récupère les messages plus anciens (pagination)
   */
  async getOlderMessages(conversationId: string, lastMessageTimestamp: Date, limit: number = 20): Promise<Message[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      const messagesSnapshot = await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', conversationId)
        .orderBy('timestamp', 'desc')
        .startAfter(firebaseService.firestore.Timestamp.fromDate(lastMessageTimestamp))
        .limit(limit)
        .get();

      const messages: Message[] = [];
      
      for (const doc of messagesSnapshot.docs) {
        const data = doc.data();
        const message: Message = {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message;

        messages.push(message);
      }

      return messages.reverse(); // Retourner dans l'ordre chronologique
    } catch (error) {
      console.error('Error getting older messages:', error);
      throw this.createAppError('FETCH_OLDER_MESSAGES_ERROR', 'Erreur lors de la récupération des anciens messages', error);
    }
  }

  /**
   * Écoute les nouveaux messages en temps réel
   */
  listenToMessages(conversationId: string, callback: (messages: Message[]) => void): (() => void) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return () => {};
    }

    const unsubscribe = firebaseService.firestore
      .collection(COLLECTIONS.MESSAGES)
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc')
      .onSnapshot(async (snapshot) => {
        const messages: Message[] = [];
        
        // Récupérer la clé de chiffrement de la conversation
        const conversation = await conversationService.getConversationById(conversationId);
        
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const message: Message = {
            ...data,
            id: doc.id,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as Message;

          // Déchiffrer le message si nécessaire
          if (message.encrypted && conversation?.encryptionKey) {
            try {
              const decryptedContent = await encryptionService.decryptMessage(
                {
                  encryptedContent: message.content,
                  iv: data.iv || '',
                },
                conversation.encryptionKey
              );
              message.content = decryptedContent;
              message.encrypted = false;
            } catch (error) {
              console.error('Error decrypting message:', error);
              message.content = '[Message chiffré - erreur de déchiffrement]';
            }
          }

          messages.push(message);
        }

        callback(messages);
      }, (error) => {
        console.error('Error listening to messages:', error);
      });

    return unsubscribe;
  }

  /**
   * Crée un objet d'erreur standardisé
   */
  private createAppError(code: string, message: string, details?: any): AppError {
    return { code, message, details };
  }
}

// Instance singleton du service de messages
export const messageService = new MessageService();

export default messageService;