import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';

// Services
import authService from './src/services/authService';
import { setupNotifications } from './src/services/notificationService';
import { requestPermissions } from './src/services/permissionService';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Types
import { RootStackParamList, User } from './src/types';

// Utils
import { AppProvider } from './src/context/AppContext';

// React Navigation Stack
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Composant principal de l'application
 * Gère l'authentification, la navigation et l'état global
 */
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  /**
   * Initialisation de l'application
   */
  useEffect(() => {
    initializeApp();
    setupAppStateListener();
    
    return () => {
      // Cleanup lors de la fermeture de l'app
      if (user) {
        authService.updateUserOnlineStatus(false);
      }
    };
  }, []);

  /**
   * Écouter les changements d'état de l'application
   */
  useEffect(() => {
    if (user) {
      handleAppStateChange(appState);
    }
  }, [appState, user]);

  /**
   * Initialise l'application avec les permissions et notifications
   */
  const initializeApp = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Demander les permissions nécessaires
      await requestPermissions();

      // Configuration des notifications
      await setupNotifications();

      // Vérifier l'état d'authentification actuel
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Écouter les changements d'authentification
      authService.auth.onAuthStateChanged((firebaseUser) => {
        const appUser = authService.getCurrentUser();
        setUser(appUser);
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert(
        'Erreur d\'initialisation',
        'Une erreur s\'est produite lors du démarrage de l\'application.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
    }
  };

  /**
   * Configure l'écouteur d'état de l'application
   */
  const setupAppStateListener = (): void => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  };

  /**
   * Gère les changements d'état de l'application (active/background)
   */
  const handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
    if (!user) return;

    try {
      if (nextAppState === 'active') {
        // App devient active - marquer l'utilisateur en ligne
        await authService.updateUserOnlineStatus(true);
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App passe en arrière-plan - marquer l'utilisateur hors ligne
        await authService.updateUserOnlineStatus(false);
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  /**
   * Gère les erreurs globales de l'application
   */
  const handleGlobalError = (error: Error, errorInfo: any): void => {
    console.error('Global error:', error, errorInfo);
    
    Alert.alert(
      'Erreur inattendue',
      'Une erreur inattendue s\'est produite. L\'application va redémarrer.',
      [
        {
          text: 'Redémarrer',
          onPress: () => {
            // Ici, vous pourriez implémenter une logique de redémarrage
            // ou de récupération d'erreur
          },
        },
      ]
    );
  };

  /**
   * Rendu conditionnel basé sur l'état d'authentification
   */
  const renderNavigator = () => {
    if (isLoading) {
      // Vous pourriez remplacer ceci par un écran de chargement personnalisé
      return null;
    }

    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {user ? (
          // Utilisateur connecté - afficher les écrans principaux
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                headerShown: true,
                headerTitle: 'Profil',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Paramètres',
                headerBackTitleVisible: false,
              }}
            />
          </>
        ) : (
          // Utilisateur non connecté - afficher l'écran d'authentification
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ gestureEnabled: false }}
          />
        )}
      </Stack.Navigator>
    );
  };

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#ffffff"
          translucent={false}
        />
        <NavigationContainer>
          {renderNavigator()}
        </NavigationContainer>
        
        {/* Message Flash global pour les notifications */}
        <FlashMessage position="top" />
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;