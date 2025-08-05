package com.friendly.app.ui.messages

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
 * ViewModel pour l'écran des messages
 * 
 * Ce ViewModel gère :
 * - Le chargement des conversations
 * - L'ouverture des conversations
 * - La gestion des messages non lus
 * 
 */
@HiltViewModel
class MessagesViewModel @Inject constructor() : ViewModel() {
    
    private val _uiState = MutableStateFlow(MessagesUiState())
    val uiState: StateFlow<MessagesUiState> = _uiState.asStateFlow()
    
    /**
     * Charge les conversations
     */
    fun loadConversations() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = "") }
            
            try {
                // TODO: Implémenter la logique de récupération des conversations
                // Pour l'instant, on utilise des données de test
                val conversations = getMockConversations()
                
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        conversations = conversations
                    )
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        errorMessage = "Erreur lors du chargement des conversations"
                    )
                }
            }
        }
    }
    
    /**
     * Ouvre une conversation
     * 
     * @param conversationId ID de la conversation
     */
    fun openConversation(conversationId: String) {
        // TODO: Implémenter la navigation vers l'écran de chat
        // Navigation vers l'écran de conversation
    }
    
    /**
     * Génère des conversations de test
     * 
     * @return Liste de conversations de test
     */
    private fun getMockConversations(): List<Conversation> {
        return listOf(
            Conversation(
                id = "1",
                userId = "user1",
                userName = "Sarah",
                lastMessage = "Salut ! Comment ça va ?",
                lastMessageTime = "À l'instant",
                unreadCount = 2,
                isOnline = true
            ),
            Conversation(
                id = "2",
                userId = "user2",
                userName = "Thomas",
                lastMessage = "On se voit ce soir ?",
                lastMessageTime = "5 min",
                unreadCount = 0,
                isOnline = false
            ),
            Conversation(
                id = "3",
                userId = "user3",
                userName = "Emma",
                lastMessage = "Merci pour hier !",
                lastMessageTime = "1 h",
                unreadCount = 1,
                isOnline = true
            ),
            Conversation(
                id = "4",
                userId = "user4",
                userName = "Alex",
                lastMessage = "Tu as vu le nouveau film ?",
                lastMessageTime = "2 h",
                unreadCount = 0,
                isOnline = false
            ),
            Conversation(
                id = "5",
                userId = "user5",
                userName = "Lisa",
                lastMessage = "Bonne journée !",
                lastMessageTime = "Hier",
                unreadCount = 0,
                isOnline = true
            )
        )
    }
}

/**
 * État de l'interface utilisateur des messages
 * 
 * @property conversations Liste des conversations
 * @property isLoading État de chargement
 * @property errorMessage Message d'erreur
 */
data class MessagesUiState(
    val conversations: List<Conversation> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String = ""
)