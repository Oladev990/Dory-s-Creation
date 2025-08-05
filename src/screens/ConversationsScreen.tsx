import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useApp } from '@/context/AppContext';
import { Conversation, RootStackParamList } from '@/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: '#25D366',
  secondary: '#075E54',
  background: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  textMuted: '#999999',
  border: '#E2E8F0',
  inputBackground: '#F7FAFC',
  unreadBadge: '#25D366',
  onlineIndicator: '#4CAF50',
};

/**
 * Écran principal des conversations
 * Affiche la liste des conversations avec recherche et navigation vers le chat
 */
const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, loadConversations, createConversation } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Charge les conversations au montage du composant
   */
  useEffect(() => {
    initializeConversations();
  }, []);

  /**
   * Filtre les conversations selon la recherche
   */
  useEffect(() => {
    filterConversations();
  }, [state.conversations, searchQuery]);

  /**
   * Initialise les conversations
   */
  const initializeConversations = async (): Promise<void> => {
    try {
      setLoading(true);
      await loadConversations();
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Erreur', 'Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtre les conversations selon la requête de recherche
   */
  const filterConversations = (): void => {
    if (!searchQuery.trim()) {
      setFilteredConversations(state.conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = state.conversations.filter(conversation => {
      // Rechercher dans le nom de la conversation ou le dernier message
      const conversationName = conversation.name?.toLowerCase() || '';
      const lastMessageContent = conversation.lastMessage?.content?.toLowerCase() || '';
      
      return conversationName.includes(query) || lastMessageContent.includes(query);
    });

    setFilteredConversations(filtered);
  };

  /**
   * Gère le rafraîchissement de la liste
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadConversations();
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadConversations]);

  /**
   * Navigation vers l'écran de chat
   */
  const navigateToChat = (conversation: Conversation): void => {
    const recipientName = conversation.name || 'Conversation';
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      recipientName,
    });
  };

  /**
   * Navigation vers l'écran des contacts pour créer une nouvelle conversation
   */
  const navigateToNewChat = (): void => {
    navigation.navigate('Contacts');
  };

  /**
   * Formate la date du dernier message
   */
  const formatLastMessageTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 24 * 7) {
      return format(date, 'EEEE', { locale: fr });
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  /**
   * Rendu d'un élément de conversation
   */
  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const isUnread = item.unreadCount > 0;
    const lastMessagePreview = item.lastMessage?.content || 'Aucun message';
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigateToChat(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.photoURL ? (
            <FastImage
              source={{ uri: item.photoURL }}
              style={styles.avatar}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.name ? item.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          
          {/* Indicateur en ligne (à implémenter) */}
          {false && <View style={styles.onlineIndicator} />}
        </View>

        {/* Contenu de la conversation */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, isUnread && styles.conversationNameUnread]}>
              {item.name || 'Conversation sans nom'}
            </Text>
            <Text style={styles.lastMessageTime}>
              {formatLastMessageTime(item.lastMessageTime)}
            </Text>
          </View>

          <View style={styles.conversationFooter}>
            <Text 
              style={[styles.lastMessage, isUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {lastMessagePreview.length > 50 
                ? lastMessagePreview.substring(0, 50) + '...' 
                : lastMessagePreview
              }
            </Text>
            
            {/* Badge de messages non lus */}
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Indicateur de statut du message */}
        {item.lastMessage && (
          <View style={styles.messageStatus}>
            <Icon 
              name={getMessageStatusIcon(item.lastMessage.status)} 
              size={16} 
              color={getMessageStatusColor(item.lastMessage.status)} 
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Obtient l'icône du statut du message
   */
  const getMessageStatusIcon = (status: string): string => {
    switch (status) {
      case 'sending': return 'schedule';
      case 'sent': return 'done';
      case 'delivered': return 'done-all';
      case 'read': return 'done-all';
      case 'failed': return 'error';
      default: return 'done';
    }
  };

  /**
   * Obtient la couleur du statut du message
   */
  const getMessageStatusColor = (status: string): string => {
    switch (status) {
      case 'sending': return COLORS.textMuted;
      case 'sent': return COLORS.textLight;
      case 'delivered': return COLORS.textLight;
      case 'read': return COLORS.primary;
      case 'failed': return '#E53E3E';
      default: return COLORS.textLight;
    }
  };

  /**
   * Rendu de l'état vide
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="chat-bubble-outline" size={80} color={COLORS.textMuted} />
      <Text style={styles.emptyStateTitle}>Aucune conversation</Text>
      <Text style={styles.emptyStateSubtitle}>
        Commencez une nouvelle conversation en touchant le bouton +
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={navigateToNewChat}>
        <Text style={styles.emptyStateButtonText}>Nouvelle conversation</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Rendu de l'état de chargement
   */
  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Chargement des conversations...</Text>
    </View>
  );

  /**
   * Rendu de la barre de recherche
   */
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher dans les conversations..."
        placeholderTextColor={COLORS.textLight}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
          <Icon name="clear" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Barre de recherche */}
      {renderSearchBar()}

      {/* Liste des conversations */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        style={styles.conversationsList}
        contentContainerStyle={
          filteredConversations.length === 0 ? styles.emptyListContainer : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Bouton flottant pour nouvelle conversation */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToNewChat}
        activeOpacity={0.8}
      >
        <Icon name="add" size={24} color={COLORS.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  conversationsList: {
    flex: 1,
  },
  emptyListContainer: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.onlineIndicator,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  conversationNameUnread: {
    fontWeight: 'bold',
  },
  lastMessageTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
  },
  lastMessageUnread: {
    color: COLORS.text,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: COLORS.unreadBadge,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageStatus: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 78,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default ConversationsScreen;