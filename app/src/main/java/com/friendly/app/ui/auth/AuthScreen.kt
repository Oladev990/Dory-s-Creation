package com.friendly.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.friendly.app.R

/**
 * Écran d'authentification de l'application Friendly
 * 
 * Cet écran permet aux utilisateurs de :
 * - Se connecter avec email et mot de passe
 * - S'inscrire avec un nouveau compte
 * - Réinitialiser leur mot de passe
 * 
 * @param onLoginSuccess Callback appelé lors d'une connexion réussie
 * @param viewModel ViewModel pour la logique d'authentification
 */
@Composable
fun AuthScreen(
    onLoginSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    // Observer les changements d'état
    LaunchedEffect(uiState.isLoggedIn) {
        if (uiState.isLoggedIn) {
            onLoginSuccess()
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Titre de l'application
        Text(
            text = stringResource(R.string.app_name),
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.primary,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 32.dp)
        )
        
        // Sélecteur de mode (Connexion/Inscription)
        var isLoginMode by remember { mutableStateOf(true) }
        
        TabRow(
            selectedTabIndex = if (isLoginMode) 0 else 1,
            modifier = Modifier.padding(bottom = 24.dp)
        ) {
            Tab(
                selected = isLoginMode,
                onClick = { isLoginMode = true },
                text = { Text(stringResource(R.string.login)) }
            )
            Tab(
                selected = !isLoginMode,
                onClick = { isLoginMode = false },
                text = { Text(stringResource(R.string.register)) }
            )
        }
        
        // Formulaire d'authentification
        AuthForm(
            isLoginMode = isLoginMode,
            uiState = uiState,
            onEmailChange = viewModel::updateEmail,
            onPasswordChange = viewModel::updatePassword,
            onConfirmPasswordChange = viewModel::updateConfirmPassword,
            onSubmit = {
                if (isLoginMode) {
                    viewModel.login()
                } else {
                    viewModel.register()
                }
            },
            onForgotPassword = viewModel::sendPasswordReset
        )
        
        // Messages d'erreur
        if (uiState.errorMessage.isNotEmpty()) {
            Text(
                text = uiState.errorMessage,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 16.dp)
            )
        }
        
        // Messages de succès
        if (uiState.successMessage.isNotEmpty()) {
            Text(
                text = uiState.successMessage,
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 16.dp)
            )
        }
    }
}

/**
 * Formulaire d'authentification
 * 
 * @param isLoginMode Mode de connexion ou d'inscription
 * @param uiState État de l'interface utilisateur
 * @param onEmailChange Callback pour le changement d'email
 * @param onPasswordChange Callback pour le changement de mot de passe
 * @param onConfirmPasswordChange Callback pour le changement de confirmation
 * @param onSubmit Callback pour la soumission du formulaire
 * @param onForgotPassword Callback pour la réinitialisation du mot de passe
 */
@Composable
private fun AuthForm(
    isLoginMode: Boolean,
    uiState: AuthUiState,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onConfirmPasswordChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onForgotPassword: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Champ email
        OutlinedTextField(
            value = uiState.email,
            onValueChange = onEmailChange,
            label = { Text(stringResource(R.string.email)) },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            ),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            isError = uiState.emailError.isNotEmpty()
        )
        
        if (uiState.emailError.isNotEmpty()) {
            Text(
                text = uiState.emailError,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(start = 16.dp, bottom = 8.dp)
            )
        }
        
        // Champ mot de passe
        OutlinedTextField(
            value = uiState.password,
            onValueChange = onPasswordChange,
            label = { Text(stringResource(R.string.password)) },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = if (isLoginMode) ImeAction.Done else ImeAction.Next
            ),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            isError = uiState.passwordError.isNotEmpty()
        )
        
        if (uiState.passwordError.isNotEmpty()) {
            Text(
                text = uiState.passwordError,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(start = 16.dp, bottom = 8.dp)
            )
        }
        
        // Champ confirmation de mot de passe (inscription uniquement)
        if (!isLoginMode) {
            OutlinedTextField(
                value = uiState.confirmPassword,
                onValueChange = onConfirmPasswordChange,
                label = { Text(stringResource(R.string.confirm_password)) },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                isError = uiState.confirmPasswordError.isNotEmpty()
            )
            
            if (uiState.confirmPasswordError.isNotEmpty()) {
                Text(
                    text = uiState.confirmPasswordError,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(start = 16.dp, bottom = 8.dp)
                )
            }
        }
        
        // Bouton de soumission
        Button(
            onClick = onSubmit,
            enabled = !uiState.isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text(
                    text = if (isLoginMode) stringResource(R.string.login) else stringResource(R.string.register)
                )
            }
        }
        
        // Lien "Mot de passe oublié" (connexion uniquement)
        if (isLoginMode) {
            TextButton(
                onClick = onForgotPassword,
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Text(stringResource(R.string.forgot_password))
            }
        }
    }
}