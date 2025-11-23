// Types pour l'utilisateur
export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  publicKey?: string; // Pour le chiffrement E2E
}

// Types pour les conversations
export interface Conversation {
  id: string;
  participants: string[]; // IDs des utilisateurs
  type: 'individual' | 'group';
  name?: string; // Pour les groupes
  photoURL?: string;
  lastMessage?: Message;
  lastMessageTime: Date;
  unreadCount: number;
  createdAt: Date;
  encryptionKey?: string; // Clé de chiffrement pour cette conversation
}

// Types pour les messages
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  fileURL?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: Date;
  readBy: string[]; // IDs des utilisateurs qui ont lu le message
  encrypted: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

// Types pour les contacts
export interface Contact {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  photoURL?: string;
  isRegistered: boolean; // Si l'utilisateur est inscrit dans l'app
  userId?: string; // ID de l'utilisateur s'il est inscrit
}

// Types pour l'authentification
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Types pour les notifications
export interface NotificationData {
  type: 'message' | 'call' | 'contact_request';
  conversationId?: string;
  senderId?: string;
  messageText?: string;
  senderName?: string;
}

// Types pour la navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: { conversationId: string; recipientName: string };
  Profile: { userId: string };
  Settings: undefined;
  Contacts: undefined;
  AddContact: undefined;
};

export type TabParamList = {
  Conversations: undefined;
  Contacts: undefined;
  Settings: undefined;
};

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Types pour le store/state management
export interface AppState {
  auth: AuthState;
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  contacts: Contact[];
  isLoading: boolean;
  error: AppError | null;
}

// Types pour les services
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Types pour le chiffrement
export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  encryptedContent: string;
  iv: string;
}

// Types pour les médias
export interface MediaFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

// Types pour les permissions
export type PermissionType = 'camera' | 'microphone' | 'storage' | 'contacts' | 'notifications';

export interface PermissionStatus {
  [key: string]: 'granted' | 'denied' | 'never_ask_again' | 'unknown';
}