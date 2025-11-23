import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, Conversation, Message, Contact, AppError } from '@/types';
import authService from '@/services/authService';
import conversationService from '@/services/conversationService';
import messageService from '@/services/messageService';
import contactService from '@/services/contactService';

// Actions du reducer
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'SET_MESSAGES'; payload: { conversationId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: { id: string; updates: Partial<Contact> } };

// État initial
const initialState: AppState = {
  auth: {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  },
  conversations: [],
  messages: {},
  contacts: [],
  isLoading: false,
  error: null,
};

// Reducer pour gérer l'état global
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_USER':
      return {
        ...state,
        auth: {
          user: action.payload,
          isLoading: false,
          isAuthenticated: action.payload !== null,
        },
      };

    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
      };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, ...action.payload.updates }
            : conv
        ),
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
      };

    case 'ADD_MESSAGE':
      const conversationId = action.payload.conversationId;
      const existingMessages = state.messages[conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, action.payload],
        },
      };

    case 'UPDATE_MESSAGE':
      const updatedMessages = { ...state.messages };
      Object.keys(updatedMessages).forEach(convId => {
        updatedMessages[convId] = updatedMessages[convId].map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        );
      });
      return {
        ...state,
        messages: updatedMessages,
      };

    case 'SET_CONTACTS':
      return {
        ...state,
        contacts: action.payload,
      };

    case 'ADD_CONTACT':
      return {
        ...state,
        contacts: [...state.contacts, action.payload],
      };

    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.payload.id
            ? { ...contact, ...action.payload.updates }
            : contact
        ),
      };

    default:
      return state;
  }
};

// Interface du contexte
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Actions pour l'authentification
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Actions pour les conversations
  loadConversations: () => Promise<void>;
  createConversation: (participantId: string) => Promise<Conversation>;
  
  // Actions pour les messages
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  
  // Actions pour les contacts
  loadContacts: () => Promise<void>;
  addContact: (contact: Partial<Contact>) => Promise<void>;
  syncContacts: () => Promise<void>;
  
  // Utilitaires
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Création du contexte
const AppContext = createContext<AppContextType | null>(null);

// Hook pour utiliser le contexte
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Props du provider
interface AppProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Effet pour initialiser l'application
  useEffect(() => {
    initializeApp();
  }, []);

  // Effet pour écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = authService.auth.onAuthStateChanged((firebaseUser) => {
      const user = authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
      
      if (user) {
        // Charger les données de l'utilisateur
        loadInitialData();
      } else {
        // Nettoyer les données lors de la déconnexion
        clearUserData();
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Initialise l'application
   */
  const initializeApp = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Vérifier l'état d'authentification
      const user = authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
      
      if (user) {
        await loadInitialData();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          code: 'INIT_ERROR', 
          message: 'Erreur lors de l\'initialisation de l\'application' 
        } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Charge les données initiales de l'utilisateur
   */
  const loadInitialData = async (): Promise<void> => {
    try {
      await Promise.all([
        loadConversations(),
        loadContacts(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  /**
   * Nettoie les données utilisateur lors de la déconnexion
   */
  const clearUserData = (): void => {
    dispatch({ type: 'SET_CONVERSATIONS', payload: [] });
    dispatch({ type: 'SET_MESSAGES', payload: { conversationId: '', messages: [] } });
    dispatch({ type: 'SET_CONTACTS', payload: [] });
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Actions d'authentification
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await authService.signInWithEmail(email, password);
      // L'état sera mis à jour par l'écouteur onAuthStateChanged
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await authService.signUpWithEmail(email, password, displayName);
      // L'état sera mis à jour par l'écouteur onAuthStateChanged
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authService.signOut();
      clearUserData();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Actions pour les conversations
  const loadConversations = async (): Promise<void> => {
    try {
      const conversations = await conversationService.getUserConversations();
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      dispatch({ type: 'SET_ERROR', payload: error });
    }
  };

  const createConversation = async (participantId: string): Promise<Conversation> => {
    try {
      const conversation = await conversationService.createConversation([participantId]);
      dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
      return conversation;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error });
      throw error;
    }
  };

  // Actions pour les messages
  const loadMessages = async (conversationId: string): Promise<void> => {
    try {
      const messages = await messageService.getMessages(conversationId);
      dispatch({ type: 'SET_MESSAGES', payload: { conversationId, messages } });
    } catch (error: any) {
      console.error('Error loading messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error });
    }
  };

  const sendMessage = async (conversationId: string, content: string, type: string = 'text'): Promise<void> => {
    try {
      const message = await messageService.sendMessage(conversationId, content, type as any);
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      
      // Mettre à jour la conversation avec le dernier message
      dispatch({ 
        type: 'UPDATE_CONVERSATION', 
        payload: { 
          id: conversationId, 
          updates: { 
            lastMessage: message, 
            lastMessageTime: message.timestamp 
          } 
        } 
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error });
      throw error;
    }
  };

  const markMessageAsRead = async (messageId: string): Promise<void> => {
    try {
      await messageService.markAsRead(messageId);
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { 
          id: messageId, 
          updates: { status: 'read' } 
        } 
      });
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  };

  // Actions pour les contacts
  const loadContacts = async (): Promise<void> => {
    try {
      const contacts = await contactService.getContacts();
      dispatch({ type: 'SET_CONTACTS', payload: contacts });
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      dispatch({ type: 'SET_ERROR', payload: error });
    }
  };

  const addContact = async (contact: Partial<Contact>): Promise<void> => {
    try {
      const newContact = await contactService.addContact(contact);
      dispatch({ type: 'ADD_CONTACT', payload: newContact });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error });
      throw error;
    }
  };

  const syncContacts = async (): Promise<void> => {
    try {
      await contactService.syncPhoneContacts();
      await loadContacts(); // Recharger les contacts après synchronisation
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error });
      throw error;
    }
  };

  // Utilitaires
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const setLoading = (loading: boolean): void => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  // Valeur du contexte
  const contextValue: AppContextType = {
    state,
    dispatch,
    signIn,
    signUp,
    signOut,
    loadConversations,
    createConversation,
    loadMessages,
    sendMessage,
    markMessageAsRead,
    loadContacts,
    addContact,
    syncContacts,
    clearError,
    setLoading,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;