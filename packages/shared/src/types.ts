/**
 * Shared types and interfaces for Kniffel multiplayer game
 */

export enum Category {
  ONES = 'ones',
  TWOS = 'twos',
  THREES = 'threes',
  FOURS = 'fours',
  FIVES = 'fives',
  SIXES = 'sixes',
  THREE_OF_A_KIND = 'threeOfAKind',
  FOUR_OF_A_KIND = 'fourOfAKind',
  FULL_HOUSE = 'fullHouse',
  SMALL_STRAIGHT = 'smallStraight',
  LARGE_STRAIGHT = 'largeStraight',
  YAHTZEE = 'yahtzee',
  CHANCE = 'chance',
}

export interface Dice {
  value: number; // 1-6
  held: boolean;
}

export interface ScoreEntry {
  category: Category;
  points: number;
  yahtzeeBonusCount: number; // Count of bonus yahtzees scored
}

export interface Scorecard {
  playerId: string;
  sheetIndex: number; // 0-5, representing one of the 6 scoresheets
  scores: Map<Category, ScoreEntry>;
  isComplete: boolean;
  totalScore: number; // Sum of all entries
  upperSectionSum: number;
  lowerSectionSum: number;
  upperSectionBonus: number; // 35 if sum >= 63, else 0
}

export interface PlayerState {
  id: string;
  name: string;
  currentDice: Dice[]; // 5 dice
  rollCount: number; // 0-3
  scorecards: Scorecard[]; // 6 scorecards
  isComplete: boolean; // true when all 6 scorecards are complete
  totalScore: number; // Sum of all 6 scorecard totals
}

export interface RoomState {
  roomCode: string;
  players: Map<string, PlayerState>;
  isGameStarted: boolean;
  gameStartedAt?: number;
  isGameEnded: boolean;
  finalScores?: Map<string, number>;
}

export interface SocketEventPayload {
  [key: string]: any;
}

export interface RollDicePayload {
  playerId: string;
  roomCode: string;
}

export interface HoldDiePayload {
  playerId: string;
  roomCode: string;
  dieIndex: number; // 0-4
}

export interface ScoreCategoryPayload {
  playerId: string;
  roomCode: string;
  sheetIndex: number; // 0-5
  category: Category;
}

export interface PlayerScores {
  playerId: string;
  playerName: string;
  sheetsComplete: number; // 0-6
  totalScore: number;
  scorecards: {
    sheetIndex: number;
    isComplete: boolean;
    score: number;
  }[];
}

export interface GameScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  rank: number;
}

// Socket.io event names
export const SocketEvents = {
  // Room events
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_STATE_UPDATE: 'room:stateUpdate',

  // Player events
  PLAYER_ROLL_DICE: 'player:rollDice',
  PLAYER_HOLD_DIE: 'player:holdDie',
  PLAYER_SCORE_CATEGORY: 'player:scoreCategory',
  PLAYER_BONUS_YAHTZEE: 'player:bonusYahtzee',
  PLAYER_NEW_GAME: 'player:newGame',

  // Game state events
  GAME_STATE: 'game:state',
  GAME_ENDED: 'game:ended',
  ERROR: 'error',
} as const;
