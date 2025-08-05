package com.friendly.app.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

/**
 * Modèle de données représentant un jeu Tic Tac Toe
 * 
 * Cette classe contient toutes les informations d'une partie :
 * - Joueurs et statut du jeu
 * - État du plateau de jeu
 * - Historique des coups
 * 
 * @property id Identifiant unique du jeu
 * @property player1Id ID du premier joueur (X)
 * @property player2Id ID du second joueur (O)
 * @property currentPlayerId ID du joueur actuel
 * @property board État du plateau de jeu (3x3)
 * @property status Statut du jeu
 * @property winnerId ID du gagnant (si applicable)
 * @property createdAt Timestamp de création
 * @property updatedAt Timestamp de dernière modification
 */
@Parcelize
data class Game(
    val id: String = "",
    val player1Id: String = "",
    val player2Id: String = "",
    val currentPlayerId: String = "",
    val board: List<List<CellState>> = List(3) { List(3) { CellState.EMPTY } },
    val status: GameStatus = GameStatus.WAITING,
    val winnerId: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) : Parcelable {
    
    /**
     * Vérifie si c'est le tour du joueur spécifié
     * 
     * @param playerId ID du joueur
     * @return true si c'est son tour
     */
    fun isPlayerTurn(playerId: String): Boolean {
        return currentPlayerId == playerId && status == GameStatus.PLAYING
    }
    
    /**
     * Vérifie si le joueur est participant au jeu
     * 
     * @param playerId ID du joueur
     * @return true si le joueur participe
     */
    fun isPlayerInGame(playerId: String): Boolean {
        return player1Id == playerId || player2Id == playerId
    }
    
    /**
     * Obtient le symbole du joueur (X ou O)
     * 
     * @param playerId ID du joueur
     * @return Symbole du joueur
     */
    fun getPlayerSymbol(playerId: String): CellState {
        return when (playerId) {
            player1Id -> CellState.X
            player2Id -> CellState.O
            else -> CellState.EMPTY
        }
    }
    
    /**
     * Vérifie si le jeu est terminé
     * 
     * @return true si le jeu est terminé
     */
    fun isGameOver(): Boolean {
        return status == GameStatus.FINISHED || status == GameStatus.DRAW
    }
    
    /**
     * Vérifie si le plateau est plein (match nul)
     * 
     * @return true si le plateau est plein
     */
    fun isBoardFull(): Boolean {
        return board.all { row -> row.all { it != CellState.EMPTY } }
    }
    
    /**
     * Vérifie s'il y a un gagnant
     * 
     * @return true s'il y a un gagnant
     */
    fun hasWinner(): Boolean {
        return checkWinner() != null
    }
    
    /**
     * Vérifie s'il y a un gagnant et retourne le symbole gagnant
     * 
     * @return Symbole gagnant ou null
     */
    fun checkWinner(): CellState? {
        // Vérifier les lignes horizontales
        for (row in board) {
            if (row[0] != CellState.EMPTY && row[0] == row[1] && row[1] == row[2]) {
                return row[0]
            }
        }
        
        // Vérifier les colonnes verticales
        for (col in 0..2) {
            if (board[0][col] != CellState.EMPTY && 
                board[0][col] == board[1][col] && 
                board[1][col] == board[2][col]) {
                return board[0][col]
            }
        }
        
        // Vérifier les diagonales
        if (board[0][0] != CellState.EMPTY && 
            board[0][0] == board[1][1] && 
            board[1][1] == board[2][2]) {
            return board[0][0]
        }
        
        if (board[0][2] != CellState.EMPTY && 
            board[0][2] == board[1][1] && 
            board[1][1] == board[2][0]) {
            return board[0][2]
        }
        
        return null
    }
}

/**
 * États possibles d'une cellule du plateau
 */
enum class CellState {
    EMPTY,  // Cellule vide
    X,      // Joueur X
    O       // Joueur O
}

/**
 * Statuts possibles d'un jeu
 */
enum class GameStatus {
    WAITING,    // En attente du second joueur
    PLAYING,    // En cours
    FINISHED,   // Terminé avec un gagnant
    DRAW,       // Match nul
    CANCELLED   // Annulé
}

/**
 * Modèle de données représentant un coup joué
 * 
 * @property gameId ID du jeu
 * @property playerId ID du joueur
 * @property row Ligne (0-2)
 * @property col Colonne (0-2)
 * @property timestamp Timestamp du coup
 */
@Parcelize
data class Move(
    val gameId: String = "",
    val playerId: String = "",
    val row: Int = 0,
    val col: Int = 0,
    val timestamp: Long = System.currentTimeMillis()
) : Parcelable {
    
    /**
     * Vérifie si le coup est valide
     * 
     * @return true si le coup est valide
     */
    fun isValid(): Boolean {
        return row in 0..2 && col in 0..2
    }
}