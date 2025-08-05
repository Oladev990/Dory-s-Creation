import CryptoJS from 'react-native-crypto-js';
import { EncryptionKeys, EncryptedMessage, AppError } from '@/types';

/**
 * Service de chiffrement de bout en bout
 * Utilise l'algorithme AES-256 pour le chiffrement des messages
 * et RSA pour l'échange de clés (simulation avec crypto-js)
 */
class EncryptionService {
  
  /**
   * Génère une paire de clés de chiffrement pour un utilisateur
   * En production, utiliser une vraie implémentation RSA
   */
  async generateKeyPair(): Promise<EncryptionKeys> {
    try {
      // Pour l'exemple, nous générons des clés basées sur crypto-js
      // En production, utilisez une vraie implémentation RSA avec react-native-rsa-native
      const privateKey = CryptoJS.lib.WordArray.random(256/8).toString();
      const publicKey = CryptoJS.SHA256(privateKey).toString();
      
      return {
        privateKey,
        publicKey,
      };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw this.createAppError('KEY_GENERATION_ERROR', 'Erreur lors de la génération des clés', error);
    }
  }

  /**
   * Chiffre un message avec une clé de conversation
   */
  async encryptMessage(message: string, conversationKey: string): Promise<EncryptedMessage> {
    try {
      // Générer un vecteur d'initialisation aléatoire
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      // Chiffrer le message avec AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(message, conversationKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return {
        encryptedContent: encrypted.toString(),
        iv: iv.toString(),
      };
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw this.createAppError('ENCRYPTION_ERROR', 'Erreur lors du chiffrement du message', error);
    }
  }

  /**
   * Déchiffre un message avec une clé de conversation
   */
  async decryptMessage(encryptedMessage: EncryptedMessage, conversationKey: string): Promise<string> {
    try {
      // Déchiffrer le message avec AES-256-CBC
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage.encryptedContent, conversationKey, {
        iv: CryptoJS.enc.Hex.parse(encryptedMessage.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedMessage) {
        throw new Error('Decryption failed - empty result');
      }

      return decryptedMessage;
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw this.createAppError('DECRYPTION_ERROR', 'Erreur lors du déchiffrement du message', error);
    }
  }

  /**
   * Génère une clé de conversation unique pour deux utilisateurs
   * Utilise les clés publiques des participants pour créer une clé partagée
   */
  async generateConversationKey(userPublicKey: string, recipientPublicKey: string): Promise<string> {
    try {
      // Créer une clé de conversation basée sur les clés publiques des participants
      // En production, utiliser un vrai échange de clés Diffie-Hellman
      const combinedKeys = userPublicKey + recipientPublicKey;
      const conversationKey = CryptoJS.SHA256(combinedKeys).toString();
      
      return conversationKey;
    } catch (error) {
      console.error('Error generating conversation key:', error);
      throw this.createAppError('CONVERSATION_KEY_ERROR', 'Erreur lors de la génération de la clé de conversation', error);
    }
  }

  /**
   * Chiffre une clé de conversation avec la clé publique d'un utilisateur
   * (Simulation - en production, utiliser RSA)
   */
  async encryptConversationKey(conversationKey: string, publicKey: string): Promise<string> {
    try {
      // Simulation du chiffrement RSA avec AES
      // En production, utiliser une vraie implémentation RSA
      const encrypted = CryptoJS.AES.encrypt(conversationKey, publicKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Error encrypting conversation key:', error);
      throw this.createAppError('KEY_ENCRYPTION_ERROR', 'Erreur lors du chiffrement de la clé', error);
    }
  }

  /**
   * Déchiffre une clé de conversation avec la clé privée d'un utilisateur
   * (Simulation - en production, utiliser RSA)
   */
  async decryptConversationKey(encryptedKey: string, privateKey: string): Promise<string> {
    try {
      // Simulation du déchiffrement RSA avec AES
      // En production, utiliser une vraie implémentation RSA
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, privateKey);
      const conversationKey = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!conversationKey) {
        throw new Error('Key decryption failed');
      }
      
      return conversationKey;
    } catch (error) {
      console.error('Error decrypting conversation key:', error);
      throw this.createAppError('KEY_DECRYPTION_ERROR', 'Erreur lors du déchiffrement de la clé', error);
    }
  }

  /**
   * Génère un hash sécurisé pour vérifier l'intégrité des messages
   */
  generateMessageHash(message: string, timestamp: string): string {
    try {
      const data = message + timestamp;
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      console.error('Error generating message hash:', error);
      throw this.createAppError('HASH_ERROR', 'Erreur lors de la génération du hash', error);
    }
  }

  /**
   * Vérifie l'intégrité d'un message
   */
  verifyMessageIntegrity(message: string, timestamp: string, hash: string): boolean {
    try {
      const calculatedHash = this.generateMessageHash(message, timestamp);
      return calculatedHash === hash;
    } catch (error) {
      console.error('Error verifying message integrity:', error);
      return false;
    }
  }

  /**
   * Chiffre un fichier (image, vidéo, etc.)
   */
  async encryptFile(fileData: string, conversationKey: string): Promise<EncryptedMessage> {
    try {
      // Pour les fichiers volumineux, on pourrait implémenter un chiffrement par chunks
      return await this.encryptMessage(fileData, conversationKey);
    } catch (error) {
      console.error('Error encrypting file:', error);
      throw this.createAppError('FILE_ENCRYPTION_ERROR', 'Erreur lors du chiffrement du fichier', error);
    }
  }

  /**
   * Déchiffre un fichier
   */
  async decryptFile(encryptedFile: EncryptedMessage, conversationKey: string): Promise<string> {
    try {
      return await this.decryptMessage(encryptedFile, conversationKey);
    } catch (error) {
      console.error('Error decrypting file:', error);
      throw this.createAppError('FILE_DECRYPTION_ERROR', 'Erreur lors du déchiffrement du fichier', error);
    }
  }

  /**
   * Génère une clé de session temporaire pour les groupes
   */
  async generateSessionKey(): Promise<string> {
    try {
      return CryptoJS.lib.WordArray.random(256/8).toString();
    } catch (error) {
      console.error('Error generating session key:', error);
      throw this.createAppError('SESSION_KEY_ERROR', 'Erreur lors de la génération de la clé de session', error);
    }
  }

  /**
   * Nettoie les données sensibles de la mémoire
   */
  clearSensitiveData(data: string): void {
    try {
      // En JavaScript, nous ne pouvons pas vraiment effacer la mémoire
      // mais nous pouvons marquer les variables comme undefined
      data = '';
    } catch (error) {
      console.error('Error clearing sensitive data:', error);
    }
  }

  /**
   * Valide la force d'une clé de chiffrement
   */
  validateKeyStrength(key: string): boolean {
    try {
      // Vérifier que la clé a une longueur suffisante et une entropie correcte
      if (key.length < 32) return false;
      
      // Vérifier la diversité des caractères
      const uniqueChars = new Set(key).size;
      return uniqueChars >= 16; // Au moins 16 caractères différents
    } catch (error) {
      console.error('Error validating key strength:', error);
      return false;
    }
  }

  /**
   * Crée un objet d'erreur standardisé
   */
  private createAppError(code: string, message: string, details?: any): AppError {
    return { code, message, details };
  }
}

// Instance singleton du service de chiffrement
export const encryptionService = new EncryptionService();

// Fonction utilitaire pour générer des clés de chiffrement
export const generateEncryptionKeys = async (): Promise<EncryptionKeys> => {
  return await encryptionService.generateKeyPair();
};

// Fonction utilitaire pour chiffrer un message
export const encryptMessage = async (message: string, conversationKey: string): Promise<EncryptedMessage> => {
  return await encryptionService.encryptMessage(message, conversationKey);
};

// Fonction utilitaire pour déchiffrer un message
export const decryptMessage = async (encryptedMessage: EncryptedMessage, conversationKey: string): Promise<string> => {
  return await encryptionService.decryptMessage(encryptedMessage, conversationKey);
};

export default encryptionService;