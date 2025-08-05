package com.friendly.app.ui.games

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel pour l'écran des jeux
 * 
 * Ce ViewModel gère :
 * - Le chargement des jeux disponibles
 * - Les invitations de jeux
 * - Les parties actives
 * - Les actions de jeu
 * 
 */
@HiltViewModel
class GamesViewModel @Inject constructor() : ViewModel() {
    
    private val _uiState = MutableStateFlow(GamesUiState())
    val uiState: StateFlow<GamesUiState> = _uiState.asStateFlow()
    
    /**
     * Charge les données des jeux
     */
    fun loadGames() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            
            try {
                // TODO: Implémenter la logique de récupération des jeux
                // Pour l'instant, on utilise des données de test
                val invitations = getMockGameInvitations()
                val activeGames = getMockActiveGames()
                
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        gameInvitations = invitations,
                        activeGames = activeGames
                    )
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        errorMessage = "Erreur lors du chargement des jeux"
                    )
                }
            }
        }
    }
    
    /**
     * Démarre une partie de Tic Tac Toe
     */
    fun startTicTacToe() {
        // TODO: Implémenter la logique de démarrage de partie
        // Navigation vers l'écran de jeu
    }
    
    /**
     * Invite un ami à jouer
     */
    fun inviteToPlay() {
        // TODO: Implémenter la logique d'invitation
        // Afficher une liste d'amis pour inviter
    }
    
    /**
     * Accepte une invitation de jeu
     * 
     * @param invitationId ID de l'invitation
     */
    fun acceptInvitation(invitationId: String) {
        viewModelScope.launch {
            try {
                // TODO: Implémenter la logique d'acceptation
                // Retirer l'invitation de la liste
                val currentInvitations = _uiState.value.gameInvitations.toMutableList()
                currentInvitations.removeAll { it.id == invitationId }
                
                _uiState.update { 
                    it.copy(gameInvitations = currentInvitations)
                }
            } catch (e: Exception) {
                // Gérer l'erreur
            }
        }
    }
    
    /**
     * Refuse une invitation de jeu
     * 
     * @param invitationId ID de l'invitation
     */
    fun declineInvitation(invitationId: String) {
        viewModelScope.launch {
            try {
                // TODO: Implémenter la logique de refus
                // Retirer l'invitation de la liste
                val currentInvitations = _uiState.value.gameInvitations.toMutableList()
                currentInvitations.removeAll { it.id == invitationId }
                
                _uiState.update { 
                    it.copy(gameInvitations = currentInvitations)
                }
            } catch (e: Exception) {
                // Gérer l'erreur
            }
        }
    }
    
    /**
     * Rejoint une partie active
     * 
     * @param gameId ID de la partie
     */
    fun joinGame(gameId: String) {
        // TODO: Implémenter la logique de rejoindre une partie
        // Navigation vers l'écran de jeu
    }
    
    /**
     * Génère des invitations de jeu de test
     * 
     * @return Liste d'invitations de test
     */
    private fun getMockGameInvitations(): List<GameInvitation> {
        return listOf(
            GameInvitation(
                id = "1",
                fromUserId = "user1",
                fromUserName = "Sarah",
                gameType = "Tic Tac Toe",
                timestamp = System.currentTimeMillis() - 300000 // 5 minutes ago
            ),
            GameInvitation(
                id = "2",
                fromUserId = "user2",
                fromUserName = "Thomas",
                gameType = "Tic Tac Toe",
                timestamp = System.currentTimeMillis() - 600000 // 10 minutes ago
            )
        )
    }
    
    /**
     * Génère des parties actives de test
     * 
     * @return Liste de parties actives de test
     */
    private fun getMockActiveGames(): List<ActiveGame> {
        return listOf(
            ActiveGame(
                id = "1",
                gameType = "Tic Tac Toe",
                opponentName = "Emma",
                status = "En cours"
            ),
            ActiveGame(
                id = "2",
                gameType = "Tic Tac Toe",
                opponentName = "Alex",
                status = "En attente"
            )
        )
    }
}

/**
 * État de l'interface utilisateur des jeux
 * 
 * @property gameInvitations Liste des invitations de jeux
 * @property activeGames Liste des parties actives
 * @property isLoading État de chargement
 * @property errorMessage Message d'erreur
 */
data class GamesUiState(
    val gameInvitations: List<GameInvitation> = emptyList(),
    val activeGames: List<ActiveGame> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String = ""
)