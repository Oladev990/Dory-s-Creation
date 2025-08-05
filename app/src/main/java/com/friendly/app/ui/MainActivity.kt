package com.friendly.app.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.friendly.app.R
import com.friendly.app.ui.auth.AuthScreen
import com.friendly.app.ui.games.GamesScreen
import com.friendly.app.ui.messages.MessagesScreen
import com.friendly.app.ui.profile.ProfileScreen
import com.friendly.app.ui.theme.FriendlyTheme
import com.friendly.app.ui.meetings.MeetingsScreen
import dagger.hilt.android.AndroidEntryPoint

/**
 * Activité principale de l'application Friendly
 * 
 * Cette activité gère :
 * - La navigation par onglets
 * - L'affichage des différents écrans
 * - L'état global de l'application
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FriendlyTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    FriendlyApp()
                }
            }
        }
    }
}

/**
 * Composant principal de l'application
 * 
 * Gère la navigation et l'affichage des écrans
 */
@Composable
fun FriendlyApp() {
    val navController = rememberNavController()
    
    // État pour gérer si l'utilisateur est connecté
    var isUserLoggedIn by remember { mutableStateOf(false) }
    
    // Navigation par onglets
    val screens = listOf(
        Screen.Meetings,
        Screen.Games,
        Screen.Messages,
        Screen.Profile
    )
    
    // Observer la destination actuelle
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    
    Scaffold(
        bottomBar = {
            // Barre de navigation en bas (onglets)
            NavigationBar {
                screens.forEach { screen ->
                    val selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true
                    
                    NavigationBarItem(
                        icon = {
                            Icon(
                                painter = painterResource(id = screen.iconResId),
                                contentDescription = stringResource(id = screen.titleResId)
                            )
                        },
                        label = {
                            Text(text = stringResource(id = screen.titleResId))
                        },
                        selected = selected,
                        onClick = {
                            navController.navigate(screen.route) {
                                // Pop up to the start destination of the graph to
                                // avoid building up a large stack of destinations
                                // on the back stack as users select items
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                // Avoid multiple copies of the same destination when
                                // reselecting the same item
                                launchSingleTop = true
                                // Restore state when reselecting a previously selected item
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Meetings.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            // Écran d'authentification
            composable(Screen.Auth.route) {
                AuthScreen(
                    onLoginSuccess = {
                        isUserLoggedIn = true
                        navController.navigate(Screen.Meetings.route) {
                            popUpTo(Screen.Auth.route) { inclusive = true }
                        }
                    }
                )
            }
            
            // Écran des rencontres
            composable(Screen.Meetings.route) {
                MeetingsScreen()
            }
            
            // Écran des jeux
            composable(Screen.Games.route) {
                GamesScreen()
            }
            
            // Écran des messages
            composable(Screen.Messages.route) {
                MessagesScreen()
            }
            
            // Écran du profil
            composable(Screen.Profile.route) {
                ProfileScreen(
                    onLogout = {
                        isUserLoggedIn = false
                        navController.navigate(Screen.Auth.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}

/**
 * Énumération des écrans de l'application
 * 
 * Chaque écran a :
 * - Une route unique
 * - Un titre pour l'affichage
 * - Une icône pour la navigation
 */
sealed class Screen(
    val route: String,
    val titleResId: Int,
    val iconResId: Int
) {
    object Auth : Screen("auth", R.string.login, R.drawable.ic_person)
    object Meetings : Screen("meetings", R.string.nav_meetings, R.drawable.ic_people)
    object Games : Screen("games", R.string.nav_games, R.drawable.ic_games)
    object Messages : Screen("messages", R.string.nav_messages, R.drawable.ic_chat)
    object Profile : Screen("profile", R.string.nav_profile, R.drawable.ic_person)
}