import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '@/context/AppContext';

const COLORS = {
  primary: '#25D366',
  secondary: '#075E54',
  background: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  border: '#E2E8F0',
  danger: '#E53E3E',
};

const SettingsScreen: React.FC = () => {
  const { state, signOut } = useApp();

  const handleSignOut = (): void => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: confirmSignOut },
      ]
    );
  };

  const confirmSignOut = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon name={icon} size={24} color={danger ? COLORS.danger : COLORS.text} />
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      {rightComponent || (onPress && <Icon name="chevron-right" size={24} color={COLORS.textLight} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Section Profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {state.auth.user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {state.auth.user?.displayName || 'Utilisateur'}
              </Text>
              <Text style={styles.profileEmail}>
                {state.auth.user?.email}
              </Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Profil', 'Édition du profil en cours de développement')}>
              <Icon name="edit" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          
          {renderSettingItem(
            'security',
            'Confidentialité et sécurité',
            'Gérer vos paramètres de confidentialité',
            () => Alert.alert('Confidentialité', 'Paramètres de confidentialité en cours de développement')
          )}
          
          {renderSettingItem(
            'backup',
            'Sauvegarde des discussions',
            'Sauvegarder vos conversations',
            () => Alert.alert('Sauvegarde', 'Fonctionnalité en cours de développement')
          )}
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSettingItem(
            'notifications',
            'Notifications push',
            'Recevoir des notifications',
            undefined,
            <Switch value={true} onValueChange={() => {}} />
          )}
          
          {renderSettingItem(
            'volume-up',
            'Sons et vibrations',
            'Personnaliser les alertes',
            () => Alert.alert('Sons', 'Paramètres audio en cours de développement')
          )}
        </View>

        {/* Section Stockage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stockage et données</Text>
          
          {renderSettingItem(
            'storage',
            'Stockage',
            'Gérer l\'utilisation du stockage',
            () => Alert.alert('Stockage', 'Gestion du stockage en cours de développement')
          )}
          
          {renderSettingItem(
            'download',
            'Téléchargement automatique',
            'Gérer les téléchargements de médias',
            () => Alert.alert('Téléchargements', 'Paramètres de téléchargement en cours de développement')
          )}
        </View>

        {/* Section Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          {renderSettingItem(
            'help',
            'Aide',
            'FAQ et support',
            () => Alert.alert('Aide', 'Centre d\'aide en cours de développement')
          )}
          
          {renderSettingItem(
            'info',
            'À propos',
            'Version de l\'application et informations',
            () => Alert.alert('À propos', 'ChatApp v1.0.0\nApplication de messagerie sécurisée')
          )}
        </View>

        {/* Section Déconnexion */}
        <View style={styles.section}>
          {renderSettingItem(
            'logout',
            'Déconnexion',
            undefined,
            handleSignOut,
            undefined,
            true
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: COLORS.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  dangerText: {
    color: COLORS.danger,
  },
});

export default SettingsScreen;