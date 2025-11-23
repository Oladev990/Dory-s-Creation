import firebaseService, { COLLECTIONS } from './firebase';
import authService from './authService';
import encryptionService from './encryptionService';
import { Conversation, User, AppError } from '@/types';
import { v4 as uuidv4 } from 'react-native-uuid';

/**
 * Service de gestion des conversations
 * Gère la création, la récupération et la mise à jour des conversations
 */
class ConversationService {

  /**
   * Récupère toutes les conversations de l'utilisateur actuel
   */
  async getUserConversations(): Promise<Conversation[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      const conversationsSnapshot = await firebaseService.firestore
        .collection(COLLECTIONS.CONVERSATIONS)
        .where('participants', 'array-contains', currentUser.id)
        .orderBy('lastMessageTime', 'desc')
        .get();

      const conversations: Conversation[] = [];
      
      for (const doc of conversationsSnapshot.docs) {
        const data = doc.data();
        const conversation: Conversation = {
          ...data,
          id: doc.id,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Conversation;

        conversations.push(conversation);
      }

      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw this.createAppError('FETCH_CONVERSATIONS_ERROR', 'Erreur lors de la récupération des conversations', error);
    }
  }

  /**
   * Crée une nouvelle conversation entre utilisateurs
   */
  async createConversation(participantIds: string[], type: 'individual' | 'group' = 'individual', name?: string): Promise<Conversation> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Ajouter l'utilisateur actuel à la liste des participants
      const allParticipants = [currentUser.id, ...participantIds.filter(id => id !== currentUser.id)];

      // Pour les conversations individuelles, vérifier si une conversation existe déjà
      if (type === 'individual' && allParticipants.length === 2) {
        const existingConversation = await this.findExistingConversation(allParticipants);
        if (existingConversation) {
          return existingConversation;
        }
      }

      // Générer une clé de chiffrement pour la conversation
      const encryptionKey = await encryptionService.generateSessionKey();

      // Créer la nouvelle conversation
      const conversationId = uuidv4();
      const now = new Date();

      const newConversation: Conversation = {
        id: conversationId,
        participants: allParticipants,
        type,
        name: name || (type === 'group' ? 'Groupe' : undefined),
        lastMessageTime: now,
        unreadCount: 0,
        createdAt: now,
        encryptionKey,
      };

      // Sauvegarder dans Firestore
      await firebaseService.firestore
        .collection(COLLECTIONS.CONVERSATIONS)
        .doc(conversationId)
        .set({
          ...newConversation,
          lastMessageTime: firebaseService.firestore.Timestamp.fromDate(now),
          createdAt: firebaseService.firestore.Timestamp.fromDate(now),
        });

      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw this.createAppError('CREATE_CONVERSATION_ERROR', 'Erreur lors de la création de la conversation', error);
    }
  }

  /**
   * Recherche une conversation existante entre les participants
   */
  private async findExistingConversation(participants: string[]): Promise<Conversation | null> {
    try {
      const snapshot = await firebaseService.firestore
        .collection(COLLECTIONS.CONVERSATIONS)
        .where('participants', '==', participants)
        .where('type', '==', 'individual')
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Conversation;
      }

      return null;
    } catch (error) {
      console.error('Error finding existing conversation:', error);
      return null;
    }
  }

  /**
   * Met à jour une conversation
   */
  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void> {
    try {
      const updateData: any = { ...updates };
      
      // Convertir les dates en Timestamp Firebase si nécessaire
      if (updates.lastMessageTime) {
        updateData.lastMessageTime = firebaseService.firestore.Timestamp.fromDate(updates.lastMessageTime);
      }

      await firebaseService.firestore
        .collection(COLLECTIONS.CONVERSATIONS)
        .doc(conversationId)
        .update(updateData);
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw this.createAppError('UPDATE_CONVERSATION_ERROR', 'Erreur lors de la mise à jour de la conversation', error);
    }
  }

  /**
   * Récupère une conversation par son ID
   */
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const doc = await firebaseService.firestore
        .collection(COLLECTIONS.CONVERSATIONS)
        .doc(conversationId)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        ...data,
        id: doc.id,
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Conversation;
    } catch (error) {
      console.error('Error getting conversation by ID:', error);
      throw this.createAppError('FETCH_CONVERSATION_ERROR', 'Erreur lors de la récupération de la conversation', error);
    }
  }

  /**
   * Supprime une conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Vérifier que l'utilisateur fait partie de la conversation
      const conversation = await this.getConversationById(conversationId);
      if (!conversation || !conversation.participants.includes(currentUser.id)) {
        throw this.createAppError('UNAUTHORIZED', 'Non autorisé à supprimer cette conversation');
      }

      // Supprimer la conversation
      await firebaseService.firestore
        .collection(COLLECTIONS.CONVERSATIONS)
        .doc(conversationId)
        .delete();

      // Supprimer tous les messages de la conversation
      const messagesSnapshot = await firebaseService.firestore
        .collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', conversationId)
        .get();

      const batch = firebaseService.firestore.batch();
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw this.createAppError('DELETE_CONVERSATION_ERROR', 'Erreur lors de la suppression de la conversation', error);
    }
  }

  /**
   * Ajoute un participant à une conversation de groupe
   */
  async addParticipant(conversationId: string, participantId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      const conversation = await this.getConversationById(conversationId);
      if (!conversation) {
        throw this.createAppError('CONVERSATION_NOT_FOUND', 'Conversation non trouvée');
      }

      if (conversation.type !== 'group') {
        throw this.createAppError('INVALID_OPERATION', 'Impossible d\'ajouter un participant à une conversation individuelle');
      }

      if (!conversation.participants.includes(currentUser.id)) {
        throw this.createAppError('UNAUTHORIZED', 'Non autorisé à modifier cette conversation');
      }

      if (conversation.participants.includes(participantId)) {
        throw this.createAppError('ALREADY_PARTICIPANT', 'L\'utilisateur fait déjà partie de la conversation');
      }

      // Ajouter le participant
      const updatedParticipants = [...conversation.participants, participantId];
      await this.updateConversation(conversationId, { participants: updatedParticipants });
    } catch (error) {
      console.error('Error adding participant:', error);
      throw this.createAppError('ADD_PARTICIPANT_ERROR', 'Erreur lors de l\'ajout du participant', error);
    }
  }

  /**
   * Retire un participant d'une conversation de groupe
   */
  async removeParticipant(conversationId: string, participantId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      const conversation = await this.getConversationById(conversationId);
      if (!conversation) {
        throw this.createAppError('CONVERSATION_NOT_FOUND', 'Conversation non trouvée');
      }

      if (conversation.type !== 'group') {
        throw this.createAppError('INVALID_OPERATION', 'Impossible de retirer un participant d\'une conversation individuelle');
      }

      if (!conversation.participants.includes(currentUser.id)) {
        throw this.createAppError('UNAUTHORIZED', 'Non autorisé à modifier cette conversation');
      }

      if (!conversation.participants.includes(participantId)) {
        throw this.createAppError('NOT_PARTICIPANT', 'L\'utilisateur ne fait pas partie de la conversation');
      }

      // Retirer le participant
      const updatedParticipants = conversation.participants.filter(id => id !== participantId);
      
      // Si il ne reste qu'un participant, supprimer la conversation
      if (updatedParticipants.length <= 1) {
        await this.deleteConversation(conversationId);
      } else {
        await this.updateConversation(conversationId, { participants: updatedParticipants });
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      throw this.createAppError('REMOVE_PARTICIPANT_ERROR', 'Erreur lors du retrait du participant', error);
    }
  }

  /**
   * Marque une conversation comme lue (remet le compteur de messages non lus à zéro)
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await this.updateConversation(conversationId, { unreadCount: 0 });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw this.createAppError('MARK_READ_ERROR', 'Erreur lors du marquage comme lu', error);
    }
  }

  /**
   * Incrémente le compteur de messages non lus
   */
  async incrementUnreadCount(conversationId: string): Promise<void> {
    try {
      const conversationRef = firebaseService.firestore
        .collection(COLLECTIONS.CONVERSATIONS)
        .doc(conversationId);

      await firebaseService.firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(conversationRef);
        if (!doc.exists) {
          throw new Error('Conversation not found');
        }

        const currentCount = doc.data()?.unreadCount || 0;
        transaction.update(conversationRef, { unreadCount: currentCount + 1 });
      });
    } catch (error) {
      console.error('Error incrementing unread count:', error);
      throw this.createAppError('INCREMENT_UNREAD_ERROR', 'Erreur lors de l\'incrémentation du compteur', error);
    }
  }

  /**
   * Récupère les informations des participants d'une conversation
   */
  async getConversationParticipants(conversationId: string): Promise<User[]> {
    try {
      const conversation = await this.getConversationById(conversationId);
      if (!conversation) {
        throw this.createAppError('CONVERSATION_NOT_FOUND', 'Conversation non trouvée');
      }

      const participants: User[] = [];
      
      for (const participantId of conversation.participants) {
        try {
          const userDoc = await firebaseService.firestore
            .collection(COLLECTIONS.USERS)
            .doc(participantId)
            .get();

          if (userDoc.exists) {
            const userData = userDoc.data()!;
            participants.push({
              ...userData,
              id: userDoc.id,
              lastSeen: userData.lastSeen?.toDate() || new Date(),
              createdAt: userData.createdAt?.toDate() || new Date(),
            } as User);
          }
        } catch (error) {
          console.error(`Error fetching participant ${participantId}:`, error);
        }
      }

      return participants;
    } catch (error) {
      console.error('Error getting conversation participants:', error);
      throw this.createAppError('FETCH_PARTICIPANTS_ERROR', 'Erreur lors de la récupération des participants', error);
    }
  }

  /**
   * Écoute les changements en temps réel des conversations
   */
  listenToConversationChanges(callback: (conversations: Conversation[]) => void): (() => void) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return () => {};
    }

    const unsubscribe = firebaseService.firestore
      .collection(COLLECTIONS.CONVERSATIONS)
      .where('participants', 'array-contains', currentUser.id)
      .orderBy('lastMessageTime', 'desc')
      .onSnapshot((snapshot) => {
        const conversations: Conversation[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          conversations.push({
            ...data,
            id: doc.id,
            lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Conversation);
        });

        callback(conversations);
      }, (error) => {
        console.error('Error listening to conversation changes:', error);
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

// Instance singleton du service de conversation
export const conversationService = new ConversationService();

export default conversationService;