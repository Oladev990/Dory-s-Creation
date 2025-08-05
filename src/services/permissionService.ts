import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import { PermissionType, PermissionStatus, AppError } from '@/types';

/**
 * Service de gestion des permissions
 * Gère les demandes et vérifications de permissions pour l'application
 */
class PermissionService {

  /**
   * Demande toutes les permissions nécessaires pour l'application
   */
  async requestAllPermissions(): Promise<PermissionStatus> {
    const permissions: PermissionType[] = [
      'camera',
      'microphone', 
      'storage',
      'contacts',
      'notifications'
    ];

    const results: PermissionStatus = {};

    for (const permission of permissions) {
      try {
        const result = await this.requestPermission(permission);
        results[permission] = result;
      } catch (error) {
        console.error(`Error requesting ${permission} permission:`, error);
        results[permission] = 'unknown';
      }
    }

    return results;
  }

  /**
   * Demande une permission spécifique
   */
  async requestPermission(type: PermissionType): Promise<string> {
    try {
      const permission = this.getPermissionForPlatform(type);
      if (!permission) {
        return 'unknown';
      }

      // Vérifier d'abord si la permission est déjà accordée
      const currentStatus = await check(permission);
      if (currentStatus === RESULTS.GRANTED) {
        return 'granted';
      }

      // Demander la permission si elle n'est pas accordée
      const result = await request(permission);
      return this.mapPermissionResult(result);
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return 'unknown';
    }
  }

  /**
   * Vérifie le statut d'une permission
   */
  async checkPermission(type: PermissionType): Promise<string> {
    try {
      const permission = this.getPermissionForPlatform(type);
      if (!permission) {
        return 'unknown';
      }

      const result = await check(permission);
      return this.mapPermissionResult(result);
    } catch (error) {
      console.error(`Error checking ${type} permission:`, error);
      return 'unknown';
    }
  }

  /**
   * Vérifie le statut de toutes les permissions
   */
  async checkAllPermissions(): Promise<PermissionStatus> {
    const permissions: PermissionType[] = [
      'camera',
      'microphone',
      'storage', 
      'contacts',
      'notifications'
    ];

    const results: PermissionStatus = {};

    for (const permission of permissions) {
      results[permission] = await this.checkPermission(permission);
    }

    return results;
  }

  /**
   * Demande la permission d'accès à la caméra
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const status = await this.requestPermission('camera');
      
      if (status !== 'granted') {
        this.showPermissionDeniedAlert(
          'Caméra',
          'L\'accès à la caméra est nécessaire pour prendre des photos et enregistrer des vidéos.'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Demande la permission d'accès au microphone
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const status = await this.requestPermission('microphone');
      
      if (status !== 'granted') {
        this.showPermissionDeniedAlert(
          'Microphone',
          'L\'accès au microphone est nécessaire pour enregistrer des messages vocaux.'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }

  /**
   * Demande la permission d'accès au stockage
   */
  async requestStoragePermission(): Promise<boolean> {
    try {
      const status = await this.requestPermission('storage');
      
      if (status !== 'granted') {
        this.showPermissionDeniedAlert(
          'Stockage',
          'L\'accès au stockage est nécessaire pour sauvegarder et partager des fichiers.'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      return false;
    }
  }

  /**
   * Demande la permission d'accès aux contacts
   */
  async requestContactsPermission(): Promise<boolean> {
    try {
      const status = await this.requestPermission('contacts');
      
      if (status !== 'granted') {
        this.showPermissionDeniedAlert(
          'Contacts',
          'L\'accès aux contacts est nécessaire pour vous permettre de discuter avec vos amis.'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  }

  /**
   * Demande la permission pour les notifications
   */
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Pour Android, les notifications sont généralement autorisées par défaut
        // Mais on peut vérifier les permissions POST_NOTIFICATIONS pour Android 13+
        if (Platform.Version >= 33) {
          const status = await this.requestPermission('notifications');
          return status === 'granted';
        }
        return true;
      } else {
        // Pour iOS, utiliser Firebase Messaging pour demander la permission
        const status = await this.requestPermission('notifications');
        return status === 'granted';
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Demande les permissions nécessaires pour la capture de médias
   */
  async requestMediaPermissions(): Promise<{ camera: boolean; microphone: boolean; storage: boolean }> {
    const results = {
      camera: false,
      microphone: false,
      storage: false,
    };

    try {
      // Demander les permissions en parallèle
      const [cameraResult, microphoneResult, storageResult] = await Promise.all([
        this.requestCameraPermission(),
        this.requestMicrophonePermission(),
        this.requestStoragePermission(),
      ]);

      results.camera = cameraResult;
      results.microphone = microphoneResult;
      results.storage = storageResult;

      return results;
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      return results;
    }
  }

  /**
   * Vérifie si l'application a toutes les permissions essentielles
   */
  async hasEssentialPermissions(): Promise<boolean> {
    try {
      const permissions = await this.checkAllPermissions();
      
      // Les permissions essentielles pour le fonctionnement de base
      const essentialPermissions: PermissionType[] = ['storage', 'notifications'];
      
      for (const permission of essentialPermissions) {
        if (permissions[permission] !== 'granted') {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking essential permissions:', error);
      return false;
    }
  }

  /**
   * Affiche une alerte pour les permissions refusées
   */
  private showPermissionDeniedAlert(permissionName: string, description: string): void {
    Alert.alert(
      `Permission ${permissionName} refusée`,
      `${description}\n\nVous pouvez activer cette permission dans les paramètres de l'application.`,
      [
        { text: 'Plus tard', style: 'cancel' },
        { 
          text: 'Paramètres', 
          onPress: () => Linking.openSettings(),
          style: 'default'
        },
      ]
    );
  }

  /**
   * Obtient la permission appropriée selon la plateforme
   */
  private getPermissionForPlatform(type: PermissionType): Permission | null {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'camera':
          return PERMISSIONS.IOS.CAMERA;
        case 'microphone':
          return PERMISSIONS.IOS.MICROPHONE;
        case 'storage':
          return PERMISSIONS.IOS.PHOTO_LIBRARY;
        case 'contacts':
          return PERMISSIONS.IOS.CONTACTS;
        case 'notifications':
          return PERMISSIONS.IOS.NOTIFICATIONS;
        default:
          return null;
      }
    } else {
      switch (type) {
        case 'camera':
          return PERMISSIONS.ANDROID.CAMERA;
        case 'microphone':
          return PERMISSIONS.ANDROID.RECORD_AUDIO;
        case 'storage':
          return Platform.Version >= 33 
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        case 'contacts':
          return PERMISSIONS.ANDROID.READ_CONTACTS;
        case 'notifications':
          return Platform.Version >= 33 
            ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
            : null; // Les notifications sont autorisées par défaut sur les anciennes versions
        default:
          return null;
      }
    }
  }

  /**
   * Mappe les résultats de permissions vers nos types
   */
  private mapPermissionResult(result: string): string {
    switch (result) {
      case RESULTS.GRANTED:
        return 'granted';
      case RESULTS.DENIED:
        return 'denied';
      case RESULTS.NEVER_ASK_AGAIN:
      case RESULTS.BLOCKED:
        return 'never_ask_again';
      case RESULTS.UNAVAILABLE:
      case RESULTS.LIMITED:
      default:
        return 'unknown';
    }
  }

  /**
   * Demande les permissions Android spécifiques (fallback)
   */
  private async requestAndroidPermission(permission: string): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return false;
      }

      const result = await PermissionsAndroid.request(permission);
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Error requesting Android permission:', error);
      return false;
    }
  }

  /**
   * Vérifie les permissions Android spécifiques (fallback)
   */
  private async checkAndroidPermission(permission: string): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return false;
      }

      const result = await PermissionsAndroid.check(permission);
      return result === true;
    } catch (error) {
      console.error('Error checking Android permission:', error);
      return false;
    }
  }

  /**
   * Affiche un résumé des permissions pour le debug
   */
  async logPermissionStatus(): Promise<void> {
    try {
      const permissions = await this.checkAllPermissions();
      console.log('Permission Status:', permissions);
    } catch (error) {
      console.error('Error logging permission status:', error);
    }
  }

  /**
   * Crée un objet d'erreur standardisé
   */
  private createAppError(code: string, message: string, details?: any): AppError {
    return { code, message, details };
  }
}

// Instance singleton du service de permissions
export const permissionService = new PermissionService();

// Fonction utilitaire pour demander toutes les permissions
export const requestPermissions = async (): Promise<PermissionStatus> => {
  return await permissionService.requestAllPermissions();
};

// Fonction utilitaire pour vérifier les permissions essentielles
export const checkEssentialPermissions = async (): Promise<boolean> => {
  return await permissionService.hasEssentialPermissions();
};

export default permissionService;