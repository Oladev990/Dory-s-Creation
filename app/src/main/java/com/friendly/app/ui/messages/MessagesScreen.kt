package com.friendly.app.ui.messages

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.friendly.app.R

/**
 * Écran des messages de l'application Friendly
 * 
 * Cet écran affiche :
 * - La liste des conversations
 * - Les messages non lus
 * - Les statuts en ligne des utilisateurs
 * 
 * @param viewModel ViewModel pour la logique des messages
 */
@Composable
fun MessagesScreen(
    viewModel: MessagesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Titre de l'écran
        Text(
            text = stringResource(R.string.nav_messages),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        when {
            uiState.isLoading -> {
                // État de chargement
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            
            uiState.errorMessage.isNotEmpty() -> {
                // État d'erreur
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = uiState.errorMessage,
                            color = MaterialTheme.colorScheme.error,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        
                        Button(
                            onClick = { viewModel.loadConversations() }
                        ) {
                            Text(stringResource(R.string.retry))
                        }
                    }
                }
            }
            
            uiState.conversations.isEmpty() -> {
                // État vide
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Aucune conversation",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center
                        )
                        
                        Text(
                            text = "Commencez à discuter avec vos amis !",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
            }
            
            else -> {
                // Liste des conversations
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(uiState.conversations) { conversation ->
                        ConversationCard(
                            conversation = conversation,
                            onConversationClick = { viewModel.openConversation(conversation.id) }
                        )
                    }
                }
            }
        }
    }
    
    // Charger les conversations au démarrage
    LaunchedEffect(Unit) {
        viewModel.loadConversations()
    }
}

/**
 * Carte de conversation pour l'affichage de la liste
 * 
 * @param conversation Conversation à afficher
 * @param onConversationClick Callback pour ouvrir la conversation
 */
@Composable
private fun ConversationCard(
    conversation: Conversation,
    onConversationClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        onClick = onConversationClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar de l'utilisateur
            Surface(
                modifier = Modifier.size(48.dp),
                shape = MaterialTheme.shapes.circular,
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = conversation.userName.first().uppercase(),
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Informations de la conversation
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = conversation.userName,
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.weight(1f)
                    )
                    
                    // Indicateur de statut en ligne
                    if (conversation.isOnline) {
                        Surface(
                            modifier = Modifier.size(8.dp),
                            shape = MaterialTheme.shapes.circular,
                            color = MaterialTheme.colorScheme.primary
                        ) {}
                    }
                }
                
                if (conversation.lastMessage.isNotEmpty()) {
                    Text(
                        text = conversation.lastMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1
                    )
                }
                
                Text(
                    text = conversation.lastMessageTime,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Indicateur de messages non lus
            if (conversation.unreadCount > 0) {
                Spacer(modifier = Modifier.width(8.dp))
                
                Surface(
                    modifier = Modifier.size(20.dp),
                    shape = MaterialTheme.shapes.circular,
                    color = MaterialTheme.colorScheme.primary
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = if (conversation.unreadCount > 99) "99+" else conversation.unreadCount.toString(),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                }
            }
        }
    }
}

/**
 * Modèle de données pour une conversation
 */
data class Conversation(
    val id: String,
    val userId: String,
    val userName: String,
    val lastMessage: String,
    val lastMessageTime: String,
    val unreadCount: Int,
    val isOnline: Boolean
)