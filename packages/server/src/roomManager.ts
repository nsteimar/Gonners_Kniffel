/**
 * Room management for Kniffel game
 */

import { PlayerState, RoomState, Category, Dice, Scorecard, ScoreEntry } from '@kniffel/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a random room code (5 digits)
 */
export function generateRoomCode(): string {
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  return code;
}

/**
 * Create a new player state
 */
export function createPlayerState(playerId: string, playerName: string): PlayerState {
  return {
    id: playerId,
    name: playerName,
    currentDice: [],
    rollCount: 0,
    scorecards: Array.from({ length: 6 }, (_, index) =>
      createEmptyScorecard(playerId, index)
    ),
    isComplete: false,
    totalScore: 0,
  };
}

/**
 * Create an empty scorecard
 */
export function createEmptyScorecard(playerId: string, sheetIndex: number): Scorecard {
  return {
    playerId,
    sheetIndex,
    scores: new Map(),
    isComplete: false,
    totalScore: 0,
    upperSectionSum: 0,
    lowerSectionSum: 0,
    upperSectionBonus: 0,
  };
}

/**
 * Create a new room
 */
export function createRoom(creatorId: string, creatorName: string): RoomState {
  const roomCode = generateRoomCode();
  const creatorPlayer = createPlayerState(creatorId, creatorName);

  return {
    roomCode,
    players: new Map([[creatorId, creatorPlayer]]),
    isGameStarted: false,
    isGameEnded: false,
  };
}

/**
 * Add a player to an existing room
 */
export function addPlayerToRoom(room: RoomState, playerId: string, playerName: string): void {
  const player = createPlayerState(playerId, playerName);
  room.players.set(playerId, player);
}

/**
 * Remove a player from a room
 */
export function removePlayerFromRoom(room: RoomState, playerId: string): void {
  room.players.delete(playerId);
}

/**
 * Check if all players in the room have completed their game
 */
export function allPlayersComplete(room: RoomState): boolean {
  if (room.players.size === 0) return false;
  return Array.from(room.players.values()).every((player) => player.isComplete);
}

/**
 * Get player score summary
 */
export function getPlayerScoreSummary(player: PlayerState) {
  return {
    playerId: player.id,
    playerName: player.name,
    sheetsComplete: player.scorecards.filter((s) => s.isComplete).length,
    totalScore: player.totalScore,
    scorecards: player.scorecards.map((card) => ({
      playerId: card.playerId,
      sheetIndex: card.sheetIndex,
      isComplete: card.isComplete,
      totalScore: card.totalScore,
      upperSectionSum: card.upperSectionSum,
      lowerSectionSum: card.lowerSectionSum,
      upperSectionBonus: card.upperSectionBonus,
      // Convert Map to Array für JSON serialization
      scores: Array.from(card.scores.entries()).map(([category, entry]) => ({
        category,
        points: entry.points,
        yahtzeeBonusCount: entry.yahtzeeBonusCount,
      })),
    })),
  };
}

/**
 * Get room summary for broadcasting
 */
export function getRoomSummary(room: RoomState) {
  return {
    roomCode: room.roomCode,
    playerCount: room.players.size,
    isGameStarted: room.isGameStarted,
    isGameEnded: room.isGameEnded,
    players: Array.from(room.players.values()).map(getPlayerScoreSummary),
  };
}

/**
 * Calculate final scores and determine ranking
 */
export function calculateFinalScores(room: RoomState) {
  const scores: Array<{ playerId: string; playerName: string; totalScore: number }> = [];

  room.players.forEach((player) => {
    scores.push({
      playerId: player.id,
      playerName: player.name,
      totalScore: player.totalScore,
    });
  });

  // Sort by score descending
  scores.sort((a, b) => b.totalScore - a.totalScore);

  // Add ranking
  return scores.map((score, index) => ({
    ...score,
    rank: index + 1,
  }));
}
