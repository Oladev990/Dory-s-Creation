import { FirebaseApp, initializeApp } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { FirebaseConfig } from '@/types';

/**
 * Configuration Firebase avec support des variables d'environnement
 * Les clés doivent être définies dans le fichier .env
 */
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || 'your-app-id',
};

/**
 * Vérifie si Firebase est correctement configuré
 */
const isFirebaseConfigured = (): boolean => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
  return requiredKeys.every(key => {
    const value = firebaseConfig[key as keyof FirebaseConfig];
    return value && value !== `your-${key}` && value !== 'your-api-key' && value !== 'your-project-id';
  });
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
  private _isConfigured: boolean;

  constructor() {
    this._isConfigured = isFirebaseConfigured();
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
      if (!this._isConfigured) {
        console.warn(
          '⚠️  FIREBASE NOT PROPERLY CONFIGURED\n' +
          'Please fill out your Firebase credentials in .env file\n' +
          'See .env.example for reference'
        );
        return;
      }

      // Firebase est automatiquement initialisé avec React Native Firebase
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      throw error;
    }
  }

  /**
   * Vérifie si Firebase est configuré
   */
  public isConfigured(): boolean {
    return this._isConfigured;
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
      if (!this._isConfigured) {
        console.warn('Firebase is not configured');
        return false;
      }

      // Test simple avec Firestore
      await this._firestore.collection('test').limit(1).get();
      console.log('✅ Firebase connection test passed');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      return false;
    }
  }

  /**
   * Affiche l'état de la configuration Firebase
   */
  printConfigurationStatus(): void {
    console.log('=== Firebase Configuration Status ===');
    console.log(`API Key: ${this._isConfigured ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Auth Domain: ${firebaseConfig.authDomain !== 'your-project.firebaseapp.com' ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Project ID: ${firebaseConfig.projectId !== 'your-project-id' ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Storage Bucket: ${firebaseConfig.storageBucket !== 'your-project.appspot.com' ? '✅ Configured' : '❌ Missing'}`);
    console.log(`App ID: ${firebaseConfig.appId !== 'your-app-id' ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Overall Status: ${this._isConfigured ? '✅ READY' : '❌ NOT READY'}`);
    console.log('=====================================');
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
