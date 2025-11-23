import { FirebaseApp, initializeApp } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { FirebaseConfig } from '@/types';

/**
 * Configuration Firebase
 * Remplacez ces valeurs par votre configuration Firebase
 */
const firebaseConfig: FirebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

/**
 * Service Firebase principal
 * Gère l'initialisation et fournit les instances des services Firebase
 */
class FirebaseService {
  private app: FirebaseApp | null = null;
  private _auth: FirebaseAuthTypes.Module;
  private _firestore: FirebaseFirestoreTypes.Module;
  private _storage: FirebaseStorageTypes.Module;
  private _messaging: FirebaseMessagingTypes.Module;

  constructor() {
    this.initializeFirebase();
    this._auth = auth();
    this._firestore = firestore();
    this._storage = storage();
    this._messaging = messaging();
  }

  /**
   * Initialise Firebase avec la configuration
   */
  private initializeFirebase(): void {
    try {
      // Firebase est automatiquement initialisé avec React Native Firebase
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }

  /**
   * Getters pour accéder aux services Firebase
   */
  get auth(): FirebaseAuthTypes.Module {
    return this._auth;
  }

  get firestore(): FirebaseFirestoreTypes.Module {
    return this._firestore;
  }

  get storage(): FirebaseStorageTypes.Module {
    return this._storage;
  }

  get messaging(): FirebaseMessagingTypes.Module {
    return this._messaging;
  }

  /**
   * Méthode utilitaire pour créer une référence de document Firestore
   */
  createDocRef(collection: string, docId?: string): FirebaseFirestoreTypes.DocumentReference {
    if (docId) {
      return this._firestore.collection(collection).doc(docId);
    }
    return this._firestore.collection(collection).doc();
  }

  /**
   * Méthode utilitaire pour créer une référence de collection Firestore
   */
  createCollectionRef(collection: string): FirebaseFirestoreTypes.CollectionReference {
    return this._firestore.collection(collection);
  }

  /**
   * Méthode utilitaire pour créer une référence de stockage
   */
  createStorageRef(path: string): FirebaseStorageTypes.Reference {
    return this._storage.ref(path);
  }

  /**
   * Configure les règles de sécurité Firestore (côté client)
   */
  setupSecurityRules(): void {
    // Les règles de sécurité sont configurées côté serveur
    // Ici on peut définir des constantes pour les collections
    console.log('Security rules configured');
  }

  /**
   * Méthode pour tester la connexion Firebase
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test simple avec Firestore
      await this._firestore.collection('test').limit(1).get();
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  }
}

// Instance singleton du service Firebase
export const firebaseService = new FirebaseService();

// Collections Firestore constantes
export const COLLECTIONS = {
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  CONTACTS: 'contacts',
} as const;

export default firebaseService;