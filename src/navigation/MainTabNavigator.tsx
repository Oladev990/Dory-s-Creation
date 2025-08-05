import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TabParamList } from '@/types';

// Screens
import ConversationsScreen from '@/screens/ConversationsScreen';
import ContactsScreen from '@/screens/ContactsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

// Colors
const COLORS = {
  primary: '#25D366',
  secondary: '#075E54',
  background: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  tabInactive: '#B0B0B0',
};

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Navigateur principal à onglets
 * Gère la navigation entre les conversations, contacts et paramètres
 */
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Conversations':
              iconName = 'chat';
              break;
            case 'Contacts':
              iconName = 'contacts';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: '#E5E5E5',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.secondary,
          elevation: 4,
          shadowOpacity: 0.3,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        },
        headerTintColor: COLORS.background,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Conversations" 
        component={ConversationsScreen}
        options={{
          title: 'Messages',
          headerTitle: 'ChatApp',
          tabBarBadge: undefined, // Sera mis à jour dynamiquement pour les messages non lus
        }}
      />
      
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{
          title: 'Contacts',
          headerTitle: 'Contacts',
        }}
      />
      
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
          headerTitle: 'Paramètres',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;