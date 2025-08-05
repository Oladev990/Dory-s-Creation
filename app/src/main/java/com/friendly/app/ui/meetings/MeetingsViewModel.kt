package com.friendly.app.ui.meetings

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
 * ViewModel pour l'écran des rencontres
 * 
 * Ce ViewModel gère :
 * - Le chargement des utilisateurs suggérés
 * - Les actions like/dislike
 * - La gestion des erreurs
 * 
 * @property authRepository Repository pour l'authentification
 */
@HiltViewModel
class MeetingsViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(MeetingsUiState())
    val uiState: StateFlow<MeetingsUiState> = _uiState.asStateFlow()
    
    /**
     * Charge les utilisateurs suggérés
     */
    fun loadSuggestedUsers() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = "") }
            
            try {
                // TODO: Implémenter la logique de récupération des suggestions
                // Pour l'instant, on utilise des données de test
                val suggestedUsers = getMockSuggestedUsers()
                
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        suggestedUsers = suggestedUsers
                    )
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        errorMessage = "Erreur lors du chargement des suggestions"
                    )
                }
            }
        }
    }
    
    /**
     * Like un utilisateur
     * 
     * @param userId ID de l'utilisateur à liker
     */
    fun likeUser(userId: String) {
        viewModelScope.launch {
            try {
                // TODO: Implémenter la logique de like
                // Pour l'instant, on retire juste l'utilisateur de la liste
                val currentUsers = _uiState.value.suggestedUsers.toMutableList()
                currentUsers.removeAll { it.id == userId }
                
                _uiState.update { 
                    it.copy(suggestedUsers = currentUsers)
                }
            } catch (e: Exception) {
                // Gérer l'erreur
            }
        }
    }
    
    /**
     * Dislike un utilisateur
     * 
     * @param userId ID de l'utilisateur à disliker
     */
    fun dislikeUser(userId: String) {
        viewModelScope.launch {
            try {
                // TODO: Implémenter la logique de dislike
                // Pour l'instant, on retire juste l'utilisateur de la liste
                val currentUsers = _uiState.value.suggestedUsers.toMutableList()
                currentUsers.removeAll { it.id == userId }
                
                _uiState.update { 
                    it.copy(suggestedUsers = currentUsers)
                }
            } catch (e: Exception) {
                // Gérer l'erreur
            }
        }
    }
    
    /**
     * Génère des utilisateurs de test pour le développement
     * 
     * @return Liste d'utilisateurs de test
     */
    private fun getMockSuggestedUsers(): List<User> {
        return listOf(
            User(
                id = "1",
                email = "sarah@example.com",
                name = "Sarah",
                age = 25,
                gender = com.friendly.app.data.model.Gender.FEMALE,
                bio = "J'aime voyager, lire et découvrir de nouvelles cultures. Passionnée de photographie et de cuisine.",
                photoUrl = "",
                isOnline = true
            ),
            User(
                id = "2",
                email = "thomas@example.com",
                name = "Thomas",
                age = 28,
                gender = com.friendly.app.data.model.Gender.MALE,
                bio = "Sportif et aventurier. J'aime l'escalade, la randonnée et les sports extrêmes.",
                photoUrl = "",
                isOnline = false
            ),
            User(
                id = "3",
                email = "emma@example.com",
                name = "Emma",
                age = 23,
                gender = com.friendly.app.data.model.Gender.FEMALE,
                bio = "Artiste et créative. Je peins, je dessine et j'aime exprimer ma créativité à travers l'art.",
                photoUrl = "",
                isOnline = true
            ),
            User(
                id = "4",
                email = "alex@example.com",
                name = "Alex",
                age = 26,
                gender = com.friendly.app.data.model.Gender.OTHER,
                bio = "Développeur passionné par la technologie et l'innovation. J'aime coder et créer de nouvelles solutions.",
                photoUrl = "",
                isOnline = true
            ),
            User(
                id = "5",
                email = "lisa@example.com",
                name = "Lisa",
                age = 27,
                gender = com.friendly.app.data.model.Gender.FEMALE,
                bio = "Professeure de yoga et passionnée de bien-être. J'aime partager ma passion pour un mode de vie sain.",
                photoUrl = "",
                isOnline = false
            )
        )
    }
}

/**
 * État de l'interface utilisateur des rencontres
 * 
 * @property suggestedUsers Liste des utilisateurs suggérés
 * @property isLoading État de chargement
 * @property errorMessage Message d'erreur
 */
data class MeetingsUiState(
    val suggestedUsers: List<User> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String = ""
)