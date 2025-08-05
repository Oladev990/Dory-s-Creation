package com.friendly.app.ui.meetings

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
 * Écran des rencontres de l'application Friendly
 * 
 * Cet écran affiche :
 * - La liste des utilisateurs suggérés
 * - Les profils à proximité
 * - Les fonctionnalités de recherche
 * 
 * @param viewModel ViewModel pour la logique des rencontres
 */
@Composable
fun MeetingsScreen(
    viewModel: MeetingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Titre de l'écran
        Text(
            text = stringResource(R.string.nav_meetings),
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
                            onClick = { viewModel.loadSuggestedUsers() }
                        ) {
                            Text(stringResource(R.string.retry))
                        }
                    }
                }
            }
            
            uiState.suggestedUsers.isEmpty() -> {
                // État vide
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Aucune suggestion pour le moment",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center
                        )
                        
                        Text(
                            text = "Complétez votre profil pour recevoir des suggestions",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
            }
            
            else -> {
                // Liste des utilisateurs suggérés
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(uiState.suggestedUsers) { user ->
                        UserCard(
                            user = user,
                            onLike = { viewModel.likeUser(user.id) },
                            onDislike = { viewModel.dislikeUser(user.id) },
                            onViewProfile = { /* TODO: Navigation vers le profil */ }
                        )
                    }
                }
            }
        }
    }
    
    // Charger les suggestions au démarrage
    LaunchedEffect(Unit) {
        viewModel.loadSuggestedUsers()
    }
}

/**
 * Carte utilisateur pour l'affichage des suggestions
 * 
 * @param user Utilisateur à afficher
 * @param onLike Callback pour liker l'utilisateur
 * @param onDislike Callback pour disliker l'utilisateur
 * @param onViewProfile Callback pour voir le profil
 */
@Composable
private fun UserCard(
    user: com.friendly.app.data.model.User,
    onLike: () -> Unit,
    onDislike: () -> Unit,
    onViewProfile: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Photo de profil (placeholder pour l'instant)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .padding(bottom = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = MaterialTheme.shapes.medium
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "Photo de profil",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            
            // Informations utilisateur
            Text(
                text = user.name,
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(bottom = 4.dp)
            )
            
            Text(
                text = "${user.age} ans",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            if (user.bio.isNotEmpty()) {
                Text(
                    text = user.bio,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }
            
            // Boutons d'action
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // Bouton dislike
                OutlinedButton(
                    onClick = onDislike,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Passer")
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                // Bouton like
                Button(
                    onClick = onLike,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("J'aime")
                }
            }
            
            // Bouton voir le profil
            TextButton(
                onClick = onViewProfile,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            ) {
                Text("Voir le profil")
            }
        }
    }
}