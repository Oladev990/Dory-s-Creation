package com.friendly.app.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.friendly.app.data.model.User
import com.friendly.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour l'écran du profil
 * 
 * Ce ViewModel gère :
 * - Le chargement du profil utilisateur
 * - L'édition du profil
 * - La gestion des erreurs
 * 
 * @property authRepository Repository pour l'authentification
 */
@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()
    
    /**
     * Charge le profil de l'utilisateur
     */
    fun loadProfile() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = "") }
            
            try {
                val user = authRepository.getCurrentUserProfile()
                
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        user = user
                    )
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        errorMessage = "Erreur lors du chargement du profil"
                    )
                }
            }
        }
    }
    
    /**
     * Édite le profil
     */
    fun editProfile() {
        // TODO: Implémenter la navigation vers l'écran d'édition du profil
        // Navigation vers l'écran d'édition
    }
    
    /**
     * Met à jour le profil
     * 
     * @param user Nouvelles données utilisateur
     */
    fun updateProfile(user: User) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = "") }
            
            try {
                val result = authRepository.createOrUpdateUserProfile(user)
                
                result.fold(
                    onSuccess = {
                        _uiState.update { 
                            it.copy(
                                isLoading = false,
                                user = user,
                                successMessage = "Profil mis à jour avec succès"
                            )
                        }
                    },
                    onFailure = { exception ->
                        _uiState.update { 
                            it.copy(
                                isLoading = false,
                                errorMessage = "Erreur lors de la mise à jour du profil"
                            )
                        }
                    }
                )
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        errorMessage = "Erreur lors de la mise à jour du profil"
                    )
                }
            }
        }
    }
    
    /**
     * Met à jour le statut en ligne
     * 
     * @param isOnline Nouveau statut en ligne
     */
    fun updateOnlineStatus(isOnline: Boolean) {
        viewModelScope.launch {
            try {
                authRepository.updateOnlineStatus(isOnline)
            } catch (e: Exception) {
                // Gérer l'erreur silencieusement
            }
        }
    }
}

/**
 * État de l'interface utilisateur du profil
 * 
 * @property user Utilisateur actuel
 * @property isLoading État de chargement
 * @property errorMessage Message d'erreur
 * @property successMessage Message de succès
 */
data class ProfileUiState(
    val user: User? = null,
    val isLoading: Boolean = false,
    val errorMessage: String = "",
    val successMessage: String = ""
)