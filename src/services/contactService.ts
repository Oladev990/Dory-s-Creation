import { PermissionsAndroid, Platform } from 'react-native';
import Contacts from 'react-native-contacts';
import firebaseService, { COLLECTIONS } from './firebase';
import authService from './authService';
import { Contact, AppError } from '@/types';
import { v4 as uuidv4 } from 'react-native-uuid';

/**
 * Service de gestion des contacts
 * Gère la synchronisation avec les contacts téléphoniques et la base de données
 */
class ContactService {

  /**
   * Récupère tous les contacts de l'utilisateur
   */
  async getContacts(): Promise<Contact[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      const contactsSnapshot = await firebaseService.firestore
        .collection(COLLECTIONS.CONTACTS)
        .where('userId', '==', currentUser.id)
        .orderBy('name', 'asc')
        .get();

      const contacts: Contact[] = [];
      
      contactsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        contacts.push({
          ...data,
          id: doc.id,
        } as Contact);
      });

      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw this.createAppError('FETCH_CONTACTS_ERROR', 'Erreur lors de la récupération des contacts', error);
    }
  }

  /**
   * Ajoute un nouveau contact
   */
  async addContact(contactData: Partial<Contact>): Promise<Contact> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Vérifier si le contact existe déjà
      if (contactData.phoneNumber || contactData.email) {
        const existingContact = await this.findExistingContact(
          contactData.phoneNumber, 
          contactData.email
        );
        
        if (existingContact) {
          throw this.createAppError('CONTACT_EXISTS', 'Ce contact existe déjà');
        }
      }

      const contactId = uuidv4();
      const newContact: Contact = {
        id: contactId,
        name: contactData.name || 'Contact sans nom',
        phoneNumber: contactData.phoneNumber,
        email: contactData.email,
        photoURL: contactData.photoURL,
        isRegistered: false,
        userId: undefined,
      };

      // Vérifier si le contact est enregistré dans l'application
      if (contactData.phoneNumber || contactData.email) {
        const registeredUser = await this.findRegisteredUser(
          contactData.phoneNumber,
          contactData.email
        );
        
        if (registeredUser) {
          newContact.isRegistered = true;
          newContact.userId = registeredUser.id;
          newContact.photoURL = registeredUser.photoURL || newContact.photoURL;
        }
      }

      // Sauvegarder dans Firestore
      await firebaseService.firestore
        .collection(COLLECTIONS.CONTACTS)
        .doc(contactId)
        .set({
          ...newContact,
          userId: currentUser.id, // ID du propriétaire du contact
        });

      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw this.createAppError('ADD_CONTACT_ERROR', 'Erreur lors de l\'ajout du contact', error);
    }
  }

  /**
   * Met à jour un contact existant
   */
  async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Vérifier que le contact appartient à l'utilisateur
      const contactDoc = await firebaseService.firestore
        .collection(COLLECTIONS.CONTACTS)
        .doc(contactId)
        .get();

      if (!contactDoc.exists) {
        throw this.createAppError('CONTACT_NOT_FOUND', 'Contact non trouvé');
      }

      const contactData = contactDoc.data()!;
      if (contactData.userId !== currentUser.id) {
        throw this.createAppError('UNAUTHORIZED', 'Non autorisé à modifier ce contact');
      }

      // Mettre à jour le contact
      await firebaseService.firestore
        .collection(COLLECTIONS.CONTACTS)
        .doc(contactId)
        .update(updates);

      return {
        ...contactData,
        ...updates,
        id: contactId,
      } as Contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw this.createAppError('UPDATE_CONTACT_ERROR', 'Erreur lors de la mise à jour du contact', error);
    }
  }

  /**
   * Supprime un contact
   */
  async deleteContact(contactId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Vérifier que le contact appartient à l'utilisateur
      const contactDoc = await firebaseService.firestore
        .collection(COLLECTIONS.CONTACTS)
        .doc(contactId)
        .get();

      if (!contactDoc.exists) {
        throw this.createAppError('CONTACT_NOT_FOUND', 'Contact non trouvé');
      }

      const contactData = contactDoc.data()!;
      if (contactData.userId !== currentUser.id) {
        throw this.createAppError('UNAUTHORIZED', 'Non autorisé à supprimer ce contact');
      }

      // Supprimer le contact
      await firebaseService.firestore
        .collection(COLLECTIONS.CONTACTS)
        .doc(contactId)
        .delete();
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw this.createAppError('DELETE_CONTACT_ERROR', 'Erreur lors de la suppression du contact', error);
    }
  }

  /**
   * Synchronise les contacts téléphoniques avec l'application
   */
  async syncPhoneContacts(): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      // Demander la permission d'accès aux contacts
      const hasPermission = await this.requestContactsPermission();
      if (!hasPermission) {
        throw this.createAppError('PERMISSION_DENIED', 'Permission d\'accès aux contacts refusée');
      }

      // Récupérer les contacts du téléphone
      const phoneContacts = await Contacts.getAll();
      
      // Récupérer les contacts existants de l'utilisateur
      const existingContacts = await this.getContacts();
      const existingPhoneNumbers = new Set(
        existingContacts
          .map(c => c.phoneNumber)
          .filter(phone => phone !== undefined)
      );

      const newContacts: Partial<Contact>[] = [];

      // Traiter les contacts du téléphone
      for (const phoneContact of phoneContacts) {
        if (phoneContact.phoneNumbers && phoneContact.phoneNumbers.length > 0) {
          const phoneNumber = this.normalizePhoneNumber(phoneContact.phoneNumbers[0].number);
          
          // Éviter les doublons
          if (!existingPhoneNumbers.has(phoneNumber)) {
            const email = phoneContact.emailAddresses && phoneContact.emailAddresses.length > 0
              ? phoneContact.emailAddresses[0].email
              : undefined;

            newContacts.push({
              name: `${phoneContact.givenName || ''} ${phoneContact.familyName || ''}`.trim() || 'Contact',
              phoneNumber: phoneNumber,
              email: email,
              photoURL: phoneContact.thumbnailPath || undefined,
            });
          }
        }
      }

      // Ajouter les nouveaux contacts par batch
      if (newContacts.length > 0) {
        const batch = firebaseService.firestore.batch();
        
        for (const contactData of newContacts) {
          const contactId = uuidv4();
          const contact: Contact = {
            id: contactId,
            name: contactData.name || 'Contact',
            phoneNumber: contactData.phoneNumber,
            email: contactData.email,
            photoURL: contactData.photoURL,
            isRegistered: false,
            userId: undefined,
          };

          // Vérifier si le contact est enregistré dans l'application
          if (contactData.phoneNumber || contactData.email) {
            const registeredUser = await this.findRegisteredUser(
              contactData.phoneNumber,
              contactData.email
            );
            
            if (registeredUser) {
              contact.isRegistered = true;
              contact.userId = registeredUser.id;
              contact.photoURL = registeredUser.photoURL || contact.photoURL;
            }
          }

          const contactRef = firebaseService.firestore
            .collection(COLLECTIONS.CONTACTS)
            .doc(contactId);

          batch.set(contactRef, {
            ...contact,
            userId: currentUser.id, // ID du propriétaire du contact
          });
        }

        await batch.commit();
      }

      console.log(`Synchronisation terminée: ${newContacts.length} nouveaux contacts ajoutés`);
    } catch (error) {
      console.error('Error syncing phone contacts:', error);
      throw this.createAppError('SYNC_CONTACTS_ERROR', 'Erreur lors de la synchronisation des contacts', error);
    }
  }

  /**
   * Recherche des contacts par nom ou numéro
   */
  async searchContacts(query: string): Promise<Contact[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      const allContacts = await this.getContacts();
      const lowerQuery = query.toLowerCase();

      return allContacts.filter(contact => 
        contact.name.toLowerCase().includes(lowerQuery) ||
        (contact.phoneNumber && contact.phoneNumber.includes(query)) ||
        (contact.email && contact.email.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw this.createAppError('SEARCH_CONTACTS_ERROR', 'Erreur lors de la recherche de contacts', error);
    }
  }

  /**
   * Récupère les contacts qui sont enregistrés dans l'application
   */
  async getRegisteredContacts(): Promise<Contact[]> {
    try {
      const allContacts = await this.getContacts();
      return allContacts.filter(contact => contact.isRegistered);
    } catch (error) {
      console.error('Error getting registered contacts:', error);
      throw this.createAppError('GET_REGISTERED_CONTACTS_ERROR', 'Erreur lors de la récupération des contacts enregistrés', error);
    }
  }

  /**
   * Met à jour le statut d'enregistrement des contacts
   */
  async updateContactRegistrationStatus(): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw this.createAppError('NOT_AUTHENTICATED', 'Utilisateur non connecté');
    }

    try {
      const contacts = await this.getContacts();
      const batch = firebaseService.firestore.batch();

      for (const contact of contacts) {
        if (contact.phoneNumber || contact.email) {
          const registeredUser = await this.findRegisteredUser(
            contact.phoneNumber,
            contact.email
          );

          if (registeredUser && !contact.isRegistered) {
            // Contact nouvellement enregistré
            const contactRef = firebaseService.firestore
              .collection(COLLECTIONS.CONTACTS)
              .doc(contact.id);

            batch.update(contactRef, {
              isRegistered: true,
              userId: registeredUser.id,
              photoURL: registeredUser.photoURL || contact.photoURL,
            });
          }
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating contact registration status:', error);
      throw this.createAppError('UPDATE_REGISTRATION_STATUS_ERROR', 'Erreur lors de la mise à jour du statut d\'enregistrement', error);
    }
  }

  /**
   * Demande la permission d'accès aux contacts
   */
  private async requestContactsPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Accès aux contacts',
            message: 'Cette application a besoin d\'accéder à vos contacts pour vous permettre de discuter avec vos amis.',
            buttonPositive: 'Autoriser',
            buttonNegative: 'Refuser',
          }
        );
        return permission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Pour iOS, la permission est gérée automatiquement par react-native-contacts
        return true;
      }
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  }

  /**
   * Recherche un contact existant par téléphone ou email
   */
  private async findExistingContact(phoneNumber?: string, email?: string): Promise<Contact | null> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;

    try {
      let query = firebaseService.firestore
        .collection(COLLECTIONS.CONTACTS)
        .where('userId', '==', currentUser.id);

      if (phoneNumber) {
        const phoneSnapshot = await query
          .where('phoneNumber', '==', phoneNumber)
          .limit(1)
          .get();

        if (!phoneSnapshot.empty) {
          const doc = phoneSnapshot.docs[0];
          return { ...doc.data(), id: doc.id } as Contact;
        }
      }

      if (email) {
        const emailSnapshot = await query
          .where('email', '==', email)
          .limit(1)
          .get();

        if (!emailSnapshot.empty) {
          const doc = emailSnapshot.docs[0];
          return { ...doc.data(), id: doc.id } as Contact;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding existing contact:', error);
      return null;
    }
  }

  /**
   * Recherche un utilisateur enregistré par téléphone ou email
   */
  private async findRegisteredUser(phoneNumber?: string, email?: string): Promise<{ id: string; photoURL?: string } | null> {
    try {
      if (phoneNumber) {
        const phoneSnapshot = await firebaseService.firestore
          .collection(COLLECTIONS.USERS)
          .where('phoneNumber', '==', phoneNumber)
          .limit(1)
          .get();

        if (!phoneSnapshot.empty) {
          const doc = phoneSnapshot.docs[0];
          const userData = doc.data();
          return {
            id: doc.id,
            photoURL: userData.photoURL,
          };
        }
      }

      if (email) {
        const emailSnapshot = await firebaseService.firestore
          .collection(COLLECTIONS.USERS)
          .where('email', '==', email)
          .limit(1)
          .get();

        if (!emailSnapshot.empty) {
          const doc = emailSnapshot.docs[0];
          const userData = doc.data();
          return {
            id: doc.id,
            photoURL: userData.photoURL,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding registered user:', error);
      return null;
    }
  }

  /**
   * Normalise un numéro de téléphone
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Supprimer tous les caractères non numériques sauf le +
    return phoneNumber.replace(/[^\d+]/g, '');
  }

  /**
   * Crée un objet d'erreur standardisé
   */
  private createAppError(code: string, message: string, details?: any): AppError {
    return { code, message, details };
  }
}

// Instance singleton du service de contacts
export const contactService = new ContactService();

export default contactService;