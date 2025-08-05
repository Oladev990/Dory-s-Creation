package com.friendly.app.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
 * Écran du profil utilisateur de l'application Friendly
 * 
 * Cet écran affiche :
 * - Les informations du profil utilisateur
 * - Les paramètres de l'application
 * - Les options de déconnexion
 * 
 * @param onLogout Callback pour la déconnexion
 * @param viewModel ViewModel pour la logique du profil
 */
@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Titre de l'écran
        Text(
            text = stringResource(R.string.nav_profile),
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
                            onClick = { viewModel.loadProfile() }
                        ) {
                            Text(stringResource(R.string.retry))
                        }
                    }
                }
            }
            
            else -> {
                // Contenu du profil
                ProfileContent(
                    user = uiState.user,
                    onEditProfile = { viewModel.editProfile() },
                    onLogout = onLogout
                )
            }
        }
    }
    
    // Charger le profil au démarrage
    LaunchedEffect(Unit) {
        viewModel.loadProfile()
    }
}

/**
 * Contenu principal du profil
 * 
 * @param user Utilisateur à afficher
 * @param onEditProfile Callback pour éditer le profil
 * @param onLogout Callback pour se déconnecter
 */
@Composable
private fun ProfileContent(
    user: com.friendly.app.data.model.User?,
    onEditProfile: () -> Unit,
    onLogout: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        // Photo de profil
        ProfilePhotoSection(
            photoUrl = user?.photoUrl,
            onEditPhoto = { /* TODO: Implémenter l'édition de photo */ }
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Informations du profil
        ProfileInfoSection(user = user)
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Actions du profil
        ProfileActionsSection(
            onEditProfile = onEditProfile,
            onLogout = onLogout
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Paramètres
        SettingsSection()
    }
}

/**
 * Section de la photo de profil
 * 
 * @param photoUrl URL de la photo
 * @param onEditPhoto Callback pour éditer la photo
 */
@Composable
private fun ProfilePhotoSection(
    photoUrl: String?,
    onEditPhoto: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
    ) {
        // Photo de profil (placeholder pour l'instant)
        Surface(
            modifier = Modifier.size(120.dp),
            shape = MaterialTheme.shapes.circular,
            color = MaterialTheme.colorScheme.surfaceVariant
        ) {
            Box(contentAlignment = Alignment.Center) {
                if (photoUrl?.isNotEmpty() == true) {
                    // TODO: Charger l'image avec Coil
                    Text(
                        text = "Photo",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                } else {
                    Text(
                        text = "Ajouter\nphoto",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        TextButton(onClick = onEditPhoto) {
            Text(stringResource(R.string.take_photo))
        }
    }
}

/**
 * Section des informations du profil
 * 
 * @param user Utilisateur à afficher
 */
@Composable
private fun ProfileInfoSection(
    user: com.friendly.app.data.model.User?
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Informations personnelles",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            ProfileInfoRow(
                label = stringResource(R.string.name),
                value = user?.name ?: "Non renseigné"
            )
            
            ProfileInfoRow(
                label = stringResource(R.string.age),
                value = if (user?.age != null && user.age > 0) "${user.age} ans" else "Non renseigné"
            )
            
            ProfileInfoRow(
                label = stringResource(R.string.gender),
                value = when (user?.gender) {
                    com.friendly.app.data.model.Gender.MALE -> stringResource(R.string.male)
                    com.friendly.app.data.model.Gender.FEMALE -> stringResource(R.string.female)
                    com.friendly.app.data.model.Gender.OTHER -> stringResource(R.string.other)
                    else -> "Non renseigné"
                }
            )
            
            if (!user?.bio.isNullOrEmpty()) {
                ProfileInfoRow(
                    label = stringResource(R.string.bio),
                    value = user?.bio ?: "",
                    isMultiline = true
                )
            }
        }
    }
}

/**
 * Ligne d'information du profil
 * 
 * @param label Label de l'information
 * @param value Valeur de l'information
 * @param isMultiline Si la valeur peut être sur plusieurs lignes
 */
@Composable
private fun ProfileInfoRow(
    label: String,
    value: String,
    isMultiline: Boolean = false
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(top = 2.dp)
        )
    }
}

/**
 * Section des actions du profil
 * 
 * @param onEditProfile Callback pour éditer le profil
 * @param onLogout Callback pour se déconnecter
 */
@Composable
private fun ProfileActionsSection(
    onEditProfile: () -> Unit,
    onLogout: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Actions",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Button(
                onClick = onEditProfile,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(stringResource(R.string.edit_profile))
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(stringResource(R.string.logout))
            }
        }
    }
}

/**
 * Section des paramètres
 */
@Composable
private fun SettingsSection() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Paramètres",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            // TODO: Ajouter les paramètres (notifications, confidentialité, etc.)
            Text(
                text = "Paramètres à venir...",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}