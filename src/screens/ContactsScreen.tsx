import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '@/context/AppContext';
import { Contact } from '@/types';

const COLORS = {
  primary: '#25D366',
  secondary: '#075E54',
  background: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  border: '#E2E8F0',
  inputBackground: '#F7FAFC',
};

const ContactsScreen: React.FC = () => {
  const { state, loadContacts, syncContacts, createConversation } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [state.contacts, searchQuery]);

  const initializeContacts = async (): Promise<void> => {
    try {
      setLoading(true);
      await loadContacts();
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Erreur', 'Impossible de charger les contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = (): void => {
    if (!searchQuery.trim()) {
      setFilteredContacts(state.contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = state.contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      (contact.phoneNumber && contact.phoneNumber.includes(query)) ||
      (contact.email && contact.email.toLowerCase().includes(query))
    );

    setFilteredContacts(filtered);
  };

  const handleSyncContacts = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await syncContacts();
      Alert.alert('Succès', 'Contacts synchronisés avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de synchroniser les contacts');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateConversation = async (contact: Contact): Promise<void> => {
    if (!contact.isRegistered) {
      Alert.alert('Contact non enregistré', 'Ce contact n\'utilise pas encore l\'application');
      return;
    }

    try {
      await createConversation(contact.userId!);
      Alert.alert('Succès', 'Conversation créée');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la conversation');
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleCreateConversation(item)}
      disabled={!item.isRegistered}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactDetail}>
          {item.phoneNumber || item.email || 'Pas d\'information'}
        </Text>
      </View>
      
      {item.isRegistered ? (
        <Icon name="chat" size={24} color={COLORS.primary} />
      ) : (
        <Text style={styles.notRegistered}>Pas inscrit</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un contact..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity style={styles.syncButton} onPress={handleSyncContacts}>
        <Icon name="sync" size={20} color={COLORS.primary} />
        <Text style={styles.syncButtonText}>Synchroniser les contacts</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleSyncContacts} />
        }
      />
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
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  syncButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactDetail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  notRegistered: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
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
});

export default ContactsScreen;