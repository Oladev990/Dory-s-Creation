import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firebaseService, { COLLECTIONS } from './firebase';
import { User, AppError } from '@/types';
import { generateEncryptionKeys } from './encryptionService';

/**
 * Service d'authentification
 * Gère l'inscription, la connexion et la gestion des utilisateurs
 */
class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.initializeGoogleSignIn();
    this.setupAuthStateListener();
  }

  /**
   * Initialise Google Sign-In
   */
  private initializeGoogleSignIn(): void {
    GoogleSignin.configure({
      webClientId: 'your-web-client-id.googleusercontent.com', // Remplacez par votre ID client web
      offlineAccess: true,
    });
  }

  /**
   * Configure l'écouteur d'état d'authentification
   */
  private setupAuthStateListener(): void {
    firebaseService.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await this.handleUserSignIn(firebaseUser);
      } else {
        this.currentUser = null;
      }
    });
  }

  /**
   * Gère la connexion d'un utilisateur
   */
  private async handleUserSignIn(firebaseUser: FirebaseAuthTypes.User): Promise<void> {
    try {
      const userDoc = await firebaseService.firestore
        .collection(COLLECTIONS.USERS)
        .doc(firebaseUser.uid)
        .get();

      if (userDoc.exists) {
        // Utilisateur existant, mettre à jour le statut en ligne
        this.currentUser = userDoc.data() as User;
        await this.updateUserOnlineStatus(true);
      } else {
        // Nouvel utilisateur, créer le profil
        await this.createUserProfile(firebaseUser);
      }
    } catch (error) {
      console.error('Error handling user sign in:', error);
      throw this.createAppError('SIGNIN_ERROR', 'Erreur lors de la connexion', error);
    }
  }

  /**
   * Crée le profil utilisateur dans Firestore
   */
  private async createUserProfile(firebaseUser: FirebaseAuthTypes.User): Promise<void> {
    try {
      // Générer les clés de chiffrement pour l'utilisateur
      const encryptionKeys = await generateEncryptionKeys();
      
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        phoneNumber: firebaseUser.phoneNumber || undefined,
        displayName: firebaseUser.displayName || 'Utilisateur',
        photoURL: firebaseUser.photoURL || undefined,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        publicKey: encryptionKeys.publicKey,
      };

      await firebaseService.firestore
        .collection(COLLECTIONS.USERS)
        .doc(firebaseUser.uid)
        .set(newUser);

      // Stocker la clé privée localement (sécurisé)
      await this.storePrivateKey(encryptionKeys.privateKey);

      this.currentUser = newUser;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw this.createAppError('PROFILE_CREATION_ERROR', 'Erreur lors de la création du profil', error);
    }
  }

  /**
   * Inscription avec email et mot de passe
   */
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await firebaseService.auth.createUserWithEmailAndPassword(email, password);
      
      // Mettre à jour le profil avec le nom d'affichage
      await userCredential.user.updateProfile({ displayName });
      
      // Le profil sera créé automatiquement par l'écouteur d'état d'authentification
      return this.currentUser!;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw this.createAppError('SIGNUP_ERROR', this.getAuthErrorMessage(error.code), error);
    }
  }

  /**
   * Connexion avec email et mot de passe
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      await firebaseService.auth.signInWithEmailAndPassword(email, password);
      return this.currentUser!;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.createAppError('SIGNIN_ERROR', this.getAuthErrorMessage(error.code), error);
    }
  }

  /**
   * Connexion avec numéro de téléphone
   */
  async signInWithPhoneNumber(phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> {
    try {
      const confirmation = await firebaseService.auth.signInWithPhoneNumber(phoneNumber);
      return confirmation;
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      throw this.createAppError('PHONE_SIGNIN_ERROR', this.getAuthErrorMessage(error.code), error);
    }
  }

  /**
   * Confirmer le code SMS
   */
  async confirmPhoneNumber(confirmation: FirebaseAuthTypes.ConfirmationResult, code: string): Promise<User> {
    try {
      await confirmation.confirm(code);
      return this.currentUser!;
    } catch (error: any) {
      console.error('Phone confirmation error:', error);
      throw this.createAppError('PHONE_CONFIRMATION_ERROR', 'Code SMS invalide', error);
    }
  }

  /**
   * Connexion avec Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      // Vérifier si les services Google Play sont disponibles
      await GoogleSignin.hasPlayServices();
      
      // Obtenir les informations de l'utilisateur
      const { idToken } = await GoogleSignin.signIn();
      
      // Créer les credentials Firebase
      const googleCredential = firebaseService.auth.GoogleAuthProvider.credential(idToken);
      
      // Se connecter avec Firebase
      await firebaseService.auth.signInWithCredential(googleCredential);
      
      return this.currentUser!;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw this.createAppError('GOOGLE_SIGNIN_ERROR', 'Erreur lors de la connexion Google', error);
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    try {
      // Mettre à jour le statut hors ligne
      if (this.currentUser) {
        await this.updateUserOnlineStatus(false);
      }

      // Déconnexion de Google si nécessaire
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }

      // Déconnexion de Firebase
      await firebaseService.auth.signOut();
      
      this.currentUser = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw this.createAppError('SIGNOUT_ERROR', 'Erreur lors de la déconnexion', error);
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await firebaseService.auth.sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw this.createAppError('PASSWORD_RESET_ERROR', this.getAuthErrorMessage(error.code), error);
    }
  }

  /**
   * Mettre à jour le statut en ligne de l'utilisateur
   */
  async updateUserOnlineStatus(isOnline: boolean): Promise<void> {
    if (!this.currentUser) return;

    try {
      const updateData: Partial<User> = {
        isOnline,
        lastSeen: new Date(),
      };

      await firebaseService.firestore
        .collection(COLLECTIONS.USERS)
        .doc(this.currentUser.id)
        .update(updateData);

      this.currentUser = { ...this.currentUser, ...updateData };
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateUserProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      await firebaseService.firestore
        .collection(COLLECTIONS.USERS)
        .doc(this.currentUser.id)
        .update(updates);

      this.currentUser = { ...this.currentUser, ...updates };
      return this.currentUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw this.createAppError('PROFILE_UPDATE_ERROR', 'Erreur lors de la mise à jour du profil', error);
    }
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Stocker la clé privée de manière sécurisée
   */
  private async storePrivateKey(privateKey: string): Promise<void> {
    // Ici, vous devriez utiliser react-native-keychain pour stocker la clé de manière sécurisée
    // Pour l'exemple, nous la stockons dans AsyncStorage (non recommandé en production)
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(`privateKey_${this.currentUser?.id}`, privateKey);
    } catch (error) {
      console.error('Error storing private key:', error);
    }
  }

  /**
   * Récupérer la clé privée de manière sécurisée
   */
  async getPrivateKey(): Promise<string | null> {
    if (!this.currentUser) return null;
    
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(`privateKey_${this.currentUser.id}`);
    } catch (error) {
      console.error('Error retrieving private key:', error);
      return null;
    }
  }

  /**
   * Créer un objet d'erreur standardisé
   */
  private createAppError(code: string, message: string, details?: any): AppError {
    return { code, message, details };
  }

  /**
   * Obtenir le message d'erreur d'authentification Firebase
   */
  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Aucun utilisateur trouvé avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/network-request-failed': 'Erreur de connexion réseau',
      'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard',
    };

    return errorMessages[errorCode] || 'Une erreur inattendue s\'est produite';
  }
}

// Instance singleton du service d'authentification
export const authService = new AuthService();

export default authService;