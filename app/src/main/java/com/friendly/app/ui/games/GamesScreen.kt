package com.friendly.app.ui.games

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
 * Écran des jeux de l'application Friendly
 * 
 * Cet écran affiche :
 * - La liste des jeux disponibles
 * - Le jeu Tic Tac Toe
 * - Les invitations de jeux
 * 
 * @param viewModel ViewModel pour la logique des jeux
 */
@Composable
fun GamesScreen(
    viewModel: GamesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Titre de l'écran
        Text(
            text = stringResource(R.string.nav_games),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        // Liste des jeux disponibles
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Jeu Tic Tac Toe
                GameCard(
                    title = stringResource(R.string.tic_tac_toe),
                    description = "Jouez au célèbre jeu du morpion avec vos amis",
                    onPlay = { viewModel.startTicTacToe() },
                    onInvite = { viewModel.inviteToPlay() }
                )
            }
            
            // Invitations de jeux en cours
            if (uiState.gameInvitations.isNotEmpty()) {
                item {
                    Text(
                        text = "Invitations en cours",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(vertical = 16.dp)
                    )
                }
                
                items(uiState.gameInvitations) { invitation ->
                    GameInvitationCard(
                        invitation = invitation,
                        onAccept = { viewModel.acceptInvitation(invitation.id) },
                        onDecline = { viewModel.declineInvitation(invitation.id) }
                    )
                }
            }
            
            // Parties en cours
            if (uiState.activeGames.isNotEmpty()) {
                item {
                    Text(
                        text = "Parties en cours",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(vertical = 16.dp)
                    )
                }
                
                items(uiState.activeGames) { game ->
                    ActiveGameCard(
                        game = game,
                        onJoin = { viewModel.joinGame(game.id) }
                    )
                }
            }
        }
    }
    
    // Charger les données au démarrage
    LaunchedEffect(Unit) {
        viewModel.loadGames()
    }
}

/**
 * Carte de jeu pour afficher un jeu disponible
 * 
 * @param title Titre du jeu
 * @param description Description du jeu
 * @param onPlay Callback pour jouer
 * @param onInvite Callback pour inviter
 */
@Composable
private fun GameCard(
    title: String,
    description: String,
    onPlay: () -> Unit,
    onInvite: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                OutlinedButton(
                    onClick = onInvite,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(stringResource(R.string.invite_friend))
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Button(
                    onClick = onPlay,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(stringResource(R.string.play_game))
                }
            }
        }
    }
}

/**
 * Carte d'invitation de jeu
 * 
 * @param invitation Invitation à afficher
 * @param onAccept Callback pour accepter
 * @param onDecline Callback pour refuser
 */
@Composable
private fun GameInvitationCard(
    invitation: GameInvitation,
    onAccept: () -> Unit,
    onDecline: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Invitation de ${invitation.fromUserName}",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = "Veut jouer au ${invitation.gameType}",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                OutlinedButton(
                    onClick = onDecline,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(stringResource(R.string.decline))
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Button(
                    onClick = onAccept,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(stringResource(R.string.accept))
                }
            }
        }
    }
}

/**
 * Carte de partie active
 * 
 * @param game Partie à afficher
 * @param onJoin Callback pour rejoindre
 */
@Composable
private fun ActiveGameCard(
    game: ActiveGame,
    onJoin: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = game.gameType,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = "Contre ${game.opponentName}",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = "Statut: ${game.status}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Button(
                onClick = onJoin,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            ) {
                Text("Rejoindre")
            }
        }
    }
}

/**
 * Modèle de données pour une invitation de jeu
 */
data class GameInvitation(
    val id: String,
    val fromUserId: String,
    val fromUserName: String,
    val gameType: String,
    val timestamp: Long
)

/**
 * Modèle de données pour une partie active
 */
data class ActiveGame(
    val id: String,
    val gameType: String,
    val opponentName: String,
    val status: String
)