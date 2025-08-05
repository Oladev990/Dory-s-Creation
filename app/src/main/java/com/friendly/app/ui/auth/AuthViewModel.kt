package com.friendly.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.friendly.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour l'authentification
 * 
 * Ce ViewModel gère :
 * - L'état de l'interface utilisateur d'authentification
 * - La validation des champs
 * - Les appels au repository d'authentification
 * - La gestion des erreurs et succès
 * 
 * @property authRepository Repository pour l'authentification
 */
@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    /**
     * Met à jour l'email
     * 
     * @param email Nouvel email
     */
    fun updateEmail(email: String) {
        _uiState.update { it.copy(email = email, emailError = "") }
    }
    
    /**
     * Met à jour le mot de passe
     * 
     * @param password Nouveau mot de passe
     */
    fun updatePassword(password: String) {
        _uiState.update { it.copy(password = password, passwordError = "") }
    }
    
    /**
     * Met à jour la confirmation du mot de passe
     * 
     * @param confirmPassword Nouvelle confirmation
     */
    fun updateConfirmPassword(confirmPassword: String) {
        _uiState.update { it.copy(confirmPassword = confirmPassword, confirmPasswordError = "") }
    }
    
    /**
     * Connecte l'utilisateur
     */
    fun login() {
        if (!validateLoginForm()) return
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = "", successMessage = "") }
            
            val result = authRepository.loginUser(
                email = uiState.value.email,
                password = uiState.value.password
            )
            
            result.fold(
                onSuccess = { user ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            isLoggedIn = true,
                            successMessage = "Connexion réussie !"
                        )
                    }
                },
                onFailure = { exception ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            errorMessage = getErrorMessage(exception)
                        )
                    }
                }
            )
        }
    }
    
    /**
     * Inscrit un nouvel utilisateur
     */
    fun register() {
        if (!validateRegisterForm()) return
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = "", successMessage = "") }
            
            val result = authRepository.registerUser(
                email = uiState.value.email,
                password = uiState.value.password
            )
            
            result.fold(
                onSuccess = { user ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            isLoggedIn = true,
                            successMessage = "Inscription réussie !"
                        )
                    }
                },
                onFailure = { exception ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            errorMessage = getErrorMessage(exception)
                        )
                    }
                }
            )
        }
    }
    
    /**
     * Envoie un email de réinitialisation de mot de passe
     */
    fun sendPasswordReset() {
        if (!validateEmail()) return
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = "", successMessage = "") }
            
            val result = authRepository.sendPasswordResetEmail(uiState.value.email)
            
            result.fold(
                onSuccess = {
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            successMessage = "Email de réinitialisation envoyé !"
                        )
                    }
                },
                onFailure = { exception ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            errorMessage = getErrorMessage(exception)
                        )
                    }
                }
            )
        }
    }
    
    /**
     * Valide le formulaire de connexion
     * 
     * @return true si le formulaire est valide
     */
    private fun validateLoginForm(): Boolean {
        var isValid = true
        
        if (!validateEmail()) isValid = false
        if (!validatePassword()) isValid = false
        
        return isValid
    }
    
    /**
     * Valide le formulaire d'inscription
     * 
     * @return true si le formulaire est valide
     */
    private fun validateRegisterForm(): Boolean {
        var isValid = true
        
        if (!validateEmail()) isValid = false
        if (!validatePassword()) isValid = false
        if (!validateConfirmPassword()) isValid = false
        
        return isValid
    }
    
    /**
     * Valide l'email
     * 
     * @return true si l'email est valide
     */
    private fun validateEmail(): Boolean {
        val email = uiState.value.email.trim()
        
        if (email.isEmpty()) {
            _uiState.update { it.copy(emailError = "L'email est requis") }
            return false
        }
        
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.update { it.copy(emailError = "Format d'email invalide") }
            return false
        }
        
        return true
    }
    
    /**
     * Valide le mot de passe
     * 
     * @return true si le mot de passe est valide
     */
    private fun validatePassword(): Boolean {
        val password = uiState.value.password
        
        if (password.isEmpty()) {
            _uiState.update { it.copy(passwordError = "Le mot de passe est requis") }
            return false
        }
        
        if (password.length < 6) {
            _uiState.update { it.copy(passwordError = "Le mot de passe doit contenir au moins 6 caractères") }
            return false
        }
        
        return true
    }
    
    /**
     * Valide la confirmation du mot de passe
     * 
     * @return true si la confirmation est valide
     */
    private fun validateConfirmPassword(): Boolean {
        val password = uiState.value.password
        val confirmPassword = uiState.value.confirmPassword
        
        if (confirmPassword.isEmpty()) {
            _uiState.update { it.copy(confirmPasswordError = "La confirmation est requise") }
            return false
        }
        
        if (password != confirmPassword) {
            _uiState.update { it.copy(confirmPasswordError = "Les mots de passe ne correspondent pas") }
            return false
        }
        
        return true
    }
    
    /**
     * Obtient un message d'erreur lisible à partir d'une exception
     * 
     * @param exception Exception à traiter
     * @return Message d'erreur lisible
     */
    private fun getErrorMessage(exception: Throwable): String {
        return when (exception.message) {
            "The email address is badly formatted." -> "Format d'email invalide"
            "The password is invalid or the user does not have a password." -> "Mot de passe incorrect"
            "There is no user record corresponding to this identifier. The user may have been deleted." -> "Aucun compte trouvé avec cet email"
            "The email address is already in use by another account." -> "Cet email est déjà utilisé"
            "The given password is invalid. [ Password should be at least 6 characters ]" -> "Le mot de passe doit contenir au moins 6 caractères"
            "A network error (such as timeout, interrupted connection or unreachable host) has occurred." -> "Erreur de connexion réseau"
            else -> "Une erreur inconnue s'est produite"
        }
    }
}

/**
 * État de l'interface utilisateur d'authentification
 * 
 * @property email Email saisi
 * @property password Mot de passe saisi
 * @property confirmPassword Confirmation du mot de passe
 * @property isLoading État de chargement
 * @property isLoggedIn État de connexion
 * @property emailError Erreur de validation de l'email
 * @property passwordError Erreur de validation du mot de passe
 * @property confirmPasswordError Erreur de validation de la confirmation
 * @property errorMessage Message d'erreur général
 * @property successMessage Message de succès
 */
data class AuthUiState(
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val emailError: String = "",
    val passwordError: String = "",
    val confirmPasswordError: String = "",
    val errorMessage: String = "",
    val successMessage: String = ""
)