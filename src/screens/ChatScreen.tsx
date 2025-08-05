import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GiftedChat, IMessage, InputToolbar, Send, Bubble, Avatar } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera, MediaType } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

import { useApp } from '@/context/AppContext';
import { RootStackParamList, Message, MediaFile } from '@/types';
import messageService from '@/services/messageService';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: '#25D366',
  secondary: '#075E54',
  background: '#ECE5DD',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  bubble: '#DCF8C6',
  bubbleReceived: '#FFFFFF',
  border: '#E2E8F0',
};

/**
 * Écran de chat principal
 * Gère l'affichage et l'envoi de messages en temps réel
 */
const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { state, loadMessages, sendMessage, markMessageAsRead } = useApp();
  
  const { conversationId, recipientName } = route.params;
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Configure la navigation avec le nom du destinataire
   */
  useEffect(() => {
    navigation.setOptions({
      headerTitle: recipientName,
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleVideoCall} style={styles.headerButton}>
            <Icon name="videocam" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleVoiceCall} style={styles.headerButton}>
            <Icon name="call" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMoreOptions} style={styles.headerButton}>
            <Icon name="more-vert" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, recipientName]);

  /**
   * Charge les messages au montage du composant
   */
  useEffect(() => {
    initializeChat();
    
    // Écouter les nouveaux messages en temps réel
    const unsubscribe = messageService.listenToMessages(conversationId, handleNewMessages);
    
    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  /**
   * Marque les messages comme lus quand l'utilisateur entre dans le chat
   */
  useEffect(() => {
    if (messages.length > 0) {
      markAllMessagesAsRead();
    }
  }, [messages]);

  /**
   * Initialise le chat avec les messages existants
   */
  const initializeChat = async (): Promise<void> => {
    try {
      setLoading(true);
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Erreur', 'Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère les nouveaux messages reçus en temps réel
   */
  const handleNewMessages = useCallback((newMessages: Message[]) => {
    const giftedMessages = convertMessagesToGiftedChat(newMessages);
    setMessages(giftedMessages);
  }, []);

  /**
   * Convertit les messages de notre format vers le format GiftedChat
   */
  const convertMessagesToGiftedChat = (messages: Message[]): IMessage[] => {
    return messages.map(message => ({
      _id: message.id,
      text: message.content,
      createdAt: message.timestamp,
      user: {
        _id: message.senderId,
        name: 'User', // À remplacer par le vrai nom
        avatar: undefined, // À remplacer par la vraie photo
      },
      image: message.type === 'image' ? message.fileURL : undefined,
      video: message.type === 'video' ? message.fileURL : undefined,
      audio: message.type === 'audio' ? message.fileURL : undefined,
      pending: message.status === 'sending',
      sent: message.status === 'sent' || message.status === 'delivered' || message.status === 'read',
      received: message.status === 'delivered' || message.status === 'read',
      system: false,
    }));
  };

  /**
   * Marque tous les messages comme lus
   */
  const markAllMessagesAsRead = async (): Promise<void> => {
    try {
      await messageService.markAllAsRead(conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  /**
   * Gère l'envoi de nouveaux messages
   */
  const onSend = useCallback(async (messages: IMessage[] = []) => {
    const message = messages[0];
    if (!message.text.trim()) return;

    try {
      await sendMessage(conversationId, message.text, 'text');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  }, [conversationId, sendMessage]);

  /**
   * Gère l'appel vidéo
   */
  const handleVideoCall = (): void => {
    Alert.alert('Appel vidéo', 'Fonctionnalité en cours de développement');
  };

  /**
   * Gère l'appel vocal
   */
  const handleVoiceCall = (): void => {
    Alert.alert('Appel vocal', 'Fonctionnalité en cours de développement');
  };

  /**
   * Gère les options supplémentaires
   */
  const handleMoreOptions = (): void => {
    Alert.alert(
      'Options',
      'Choisissez une action',
      [
        { text: 'Voir le profil', onPress: () => handleViewProfile() },
        { text: 'Rechercher dans la conversation', onPress: () => handleSearch() },
        { text: 'Médias partagés', onPress: () => handleSharedMedia() },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  /**
   * Navigation vers le profil du contact
   */
  const handleViewProfile = (): void => {
    // TODO: Implémenter la navigation vers le profil
    Alert.alert('Profil', 'Navigation vers le profil en cours de développement');
  };

  /**
   * Gère la recherche dans la conversation
   */
  const handleSearch = (): void => {
    Alert.alert('Recherche', 'Recherche dans la conversation en cours de développement');
  };

  /**
   * Affiche les médias partagés
   */
  const handleSharedMedia = (): void => {
    Alert.alert('Médias partagés', 'Fonctionnalité en cours de développement');
  };

  /**
   * Gère l'envoi de fichiers multimédias
   */
  const handleAttachment = (): void => {
    Alert.alert(
      'Envoyer un fichier',
      'Choisissez le type de fichier',
      [
        { text: 'Photo depuis la galerie', onPress: () => pickImageFromGallery() },
        { text: 'Prendre une photo', onPress: () => takePhoto() },
        { text: 'Document', onPress: () => pickDocument() },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  /**
   * Sélectionne une image depuis la galerie
   */
  const pickImageFromGallery = (): void => {
    launchImageLibrary(
      {
        mediaType: 'mixed' as MediaType,
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          sendMediaFile({
            uri: asset.uri!,
            type: asset.type!,
            name: asset.fileName || 'image.jpg',
            size: asset.fileSize || 0,
          }, asset.type?.startsWith('video') ? 'video' : 'image');
        }
      }
    );
  };

  /**
   * Prend une photo avec la caméra
   */
  const takePhoto = (): void => {
    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          sendMediaFile({
            uri: asset.uri!,
            type: asset.type!,
            name: asset.fileName || 'photo.jpg',
            size: asset.fileSize || 0,
          }, 'image');
        }
      }
    );
  };

  /**
   * Sélectionne un document
   */
  const pickDocument = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      
      if (result[0]) {
        const file = result[0];
        sendMediaFile({
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name || 'document',
          size: file.size || 0,
        }, 'file');
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Error picking document:', error);
        Alert.alert('Erreur', 'Impossible de sélectionner le document');
      }
    }
  };

  /**
   * Envoie un fichier multimédia
   */
  const sendMediaFile = async (file: MediaFile, type: string): Promise<void> => {
    try {
      await sendMessage(conversationId, file.name, type as any);
      // TODO: Gérer l'upload du fichier
    } catch (error) {
      console.error('Error sending media file:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le fichier');
    }
  };

  /**
   * Personnalise la barre d'outils de saisie
   */
  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
      renderActions={() => (
        <TouchableOpacity onPress={handleAttachment} style={styles.attachmentButton}>
          <Icon name="attach-file" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      )}
    />
  );

  /**
   * Personnalise le bouton d'envoi
   */
  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <Icon name="send" size={20} color={COLORS.white} />
      </View>
    </Send>
  );

  /**
   * Personnalise les bulles de messages
   */
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: styles.bubbleRight,
        left: styles.bubbleLeft,
      }}
      textStyle={{
        right: styles.bubbleTextRight,
        left: styles.bubbleTextLeft,
      }}
      timeTextStyle={{
        right: styles.timeTextRight,
        left: styles.timeTextLeft,
      }}
    />
  );

  /**
   * Personnalise les avatars
   */
  const renderAvatar = (props: any) => (
    <Avatar
      {...props}
      containerStyle={styles.avatarContainer}
      imageStyle={styles.avatar}
    />
  );

  /**
   * Affiche l'indicateur de frappe
   */
  const renderFooter = () => {
    if (isTyping) {
      return (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{recipientName} est en train d'écrire...</Text>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{
            _id: state.auth.user?.id || 'unknown',
          }}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          renderBubble={renderBubble}
          renderAvatar={renderAvatar}
          renderFooter={renderFooter}
          showUserAvatar
          alwaysShowSend
          scrollToBottom
          scrollToBottomComponent={() => (
            <Icon name="keyboard-arrow-down" size={24} color={COLORS.primary} />
          )}
          maxComposerHeight={100}
          placeholder="Tapez votre message..."
          timeTextStyle={styles.timeText}
          dateFormat="DD/MM/YYYY"
          timeFormat="HH:mm"
          locale="fr"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  inputToolbar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  attachmentButton: {
    padding: 8,
    marginLeft: 4,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  bubbleRight: {
    backgroundColor: COLORS.bubble,
  },
  bubbleLeft: {
    backgroundColor: COLORS.bubbleReceived,
  },
  bubbleTextRight: {
    color: COLORS.text,
  },
  bubbleTextLeft: {
    color: COLORS.text,
  },
  timeTextRight: {
    color: COLORS.textLight,
  },
  timeTextLeft: {
    color: COLORS.textLight,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  typingText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginRight: 8,
  },
});

export default ChatScreen;