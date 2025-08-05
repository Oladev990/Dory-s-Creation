import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '@/context/AppContext';

// Types pour les modes d'authentification
type AuthMode = 'signin' | 'signup' | 'phone' | 'forgot';

const COLORS = {
  primary: '#25D366',
  secondary: '#075E54',
  background: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  error: '#E53E3E',
  border: '#E2E8F0',
  inputBackground: '#F7FAFC',
};

/**
 * Écran d'authentification
 * Gère la connexion, l'inscription et la récupération de mot de passe
 */
const AuthScreen: React.FC = () => {
  const { signIn, signUp, state } = useApp();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);

  // Champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  /**
   * Valide les champs du formulaire
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'phone') {
      if (!phoneNumber.trim()) {
        newErrors.phoneNumber = 'Le numéro de téléphone est requis';
      } else if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = 'Format de numéro invalide';
      }
    } else {
      if (!email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Format d\'email invalide';
      }

      if (mode !== 'forgot') {
        if (!password) {
          newErrors.password = 'Le mot de passe est requis';
        } else if (password.length < 6) {
          newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        if (mode === 'signup') {
          if (!displayName.trim()) {
            newErrors.displayName = 'Le nom d\'affichage est requis';
          }

          if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      switch (mode) {
        case 'signin':
          await signIn(email, password);
          break;
        
        case 'signup':
          await signUp(email, password, displayName);
          break;
        
        case 'phone':
          // TODO: Implémenter la connexion par téléphone
          Alert.alert('Info', 'Connexion par téléphone en cours de développement');
          break;
        
        case 'forgot':
          // TODO: Implémenter la récupération de mot de passe
          Alert.alert('Info', 'Email de récupération envoyé (simulation)');
          setMode('signin');
          break;
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur d\'authentification',
        error.message || 'Une erreur inattendue s\'est produite',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère la connexion avec Google
   */
  const handleGoogleSignIn = async (): Promise<void> => {
    setLoading(true);
    try {
      // TODO: Implémenter la connexion Google
      Alert.alert('Info', 'Connexion Google en cours de développement');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rendu du champ de saisie
   */
  const renderInput = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: any = 'default',
    secureTextEntry = false,
    iconName?: string
  ) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, errors[placeholder.toLowerCase()] && styles.inputError]}>
        {iconName && <Icon name={iconName} size={20} color={COLORS.textLight} style={styles.inputIcon} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {errors[placeholder.toLowerCase()] && (
        <Text style={styles.errorText}>{errors[placeholder.toLowerCase()]}</Text>
      )}
    </View>
  );

  /**
   * Rendu du bouton principal
   */
  const renderSubmitButton = () => {
    const getButtonText = () => {
      switch (mode) {
        case 'signin': return 'Se connecter';
        case 'signup': return 'S\'inscrire';
        case 'phone': return 'Envoyer le code';
        case 'forgot': return 'Réinitialiser';
        default: return 'Continuer';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.background} size="small" />
        ) : (
          <Text style={styles.submitButtonText}>{getButtonText()}</Text>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Rendu des boutons de mode
   */
  const renderModeButtons = () => (
    <View style={styles.modeButtons}>
      {mode === 'signin' && (
        <>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setMode('signup')}
          >
            <Text style={styles.linkText}>Pas de compte ? S'inscrire</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setMode('forgot')}
          >
            <Text style={styles.linkText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setMode('phone')}
          >
            <Text style={styles.linkText}>Se connecter par téléphone</Text>
          </TouchableOpacity>
        </>
      )}
      
      {mode === 'signup' && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setMode('signin')}
        >
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      )}
      
      {(mode === 'phone' || mode === 'forgot') && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setMode('signin')}
        >
          <Text style={styles.linkText}>Retour à la connexion</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Rendu du formulaire selon le mode
   */
  const renderForm = () => {
    switch (mode) {
      case 'signin':
        return (
          <>
            {renderInput('Email', email, setEmail, 'email-address', false, 'email')}
            {renderInput('Mot de passe', password, setPassword, 'default', true, 'lock')}
          </>
        );
      
      case 'signup':
        return (
          <>
            {renderInput('Nom d\'affichage', displayName, setDisplayName, 'default', false, 'person')}
            {renderInput('Email', email, setEmail, 'email-address', false, 'email')}
            {renderInput('Mot de passe', password, setPassword, 'default', true, 'lock')}
            {renderInput('Confirmer le mot de passe', confirmPassword, setConfirmPassword, 'default', true, 'lock')}
          </>
        );
      
      case 'phone':
        return (
          <>
            {renderInput('Numéro de téléphone', phoneNumber, setPhoneNumber, 'phone-pad', false, 'phone')}
          </>
        );
      
      case 'forgot':
        return (
          <>
            {renderInput('Email', email, setEmail, 'email-address', false, 'email')}
          </>
        );
      
      default:
        return null;
    }
  };

  const getTitleText = () => {
    switch (mode) {
      case 'signin': return 'Connexion';
      case 'signup': return 'Inscription';
      case 'phone': return 'Téléphone';
      case 'forgot': return 'Récupération';
      default: return 'ChatApp';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Icon name="chat" size={60} color={COLORS.primary} />
            <Text style={styles.title}>ChatApp</Text>
            <Text style={styles.subtitle}>{getTitleText()}</Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {renderForm()}
            {renderSubmitButton()}
          </View>

          {/* Bouton Google (seulement pour signin/signup) */}
          {(mode === 'signin' || mode === 'signup') && (
            <View style={styles.socialButtons}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <Icon name="account-circle" size={20} color={COLORS.text} />
                <Text style={styles.googleButtonText}>Continuer avec Google</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Boutons de navigation */}
          {renderModeButtons()}

          {/* Message d'erreur global */}
          {state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.globalErrorText}>{state.error.message}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    marginTop: 5,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    height: 50,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialButtons: {
    marginBottom: 30,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 15,
    color: COLORS.textLight,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
    paddingHorizontal: 15,
  },
  googleButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  modeButtons: {
    alignItems: 'center',
  },
  linkButton: {
    paddingVertical: 10,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FED7D7',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  globalErrorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AuthScreen;