/**
 * Zustand store for game state management
 */

import { create } from 'zustand';
import { Dice, PlayerState, RoomState, Category } from '@kniffel/shared';

export interface GameStore {
  // Connection state
  socket: any | null;
  connected: boolean;
  
  // Room and player data
  roomCode: string | null;
  playerId: string | null;
  playerName: string | null;
  
  // Game state
  currentDice: Dice[];
  rollCount: number;
  scoringPreview: Record<number, Record<string, number | null>>;
  
  // Player and room info
  playerState: PlayerState | null;
  roomSummary: any | null;
  gameEnded: boolean;
  finalScores: any[] | null;
  
  // UI state
  selectedSheetIndex: number | null;
  selectedCategory: Category | null;
  
  // Actions
  setSocket: (socket: any) => void;
  setConnected: (connected: boolean) => void;
  setRoomCode: (code: string | null) => void;
  setPlayerId: (id: string | null) => void;
  setPlayerName: (name: string | null) => void;
  setCurrentDice: (dice: Dice[]) => void;
  setRollCount: (count: number) => void;
  setScoringPreview: (preview: Record<number, Record<string, number | null>>) => void;
  setPlayerState: (state: PlayerState | null) => void;
  setRoomSummary: (summary: any) => void;
  setGameEnded: (ended: boolean) => void;
  setFinalScores: (scores: any[] | null) => void;
  setSelectedSheetIndex: (index: number | null) => void;
  setSelectedCategory: (category: Category | null) => void;
  reset: () => void;
}

const initialState = {
  socket: null,
  connected: false,
  roomCode: null,
  playerId: null,
  playerName: null,
  currentDice: [],
  rollCount: 0,
  scoringPreview: {},
  playerState: null,
  roomSummary: null,
  gameEnded: false,
  finalScores: null,
  selectedSheetIndex: null,
  selectedCategory: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected }),
  setRoomCode: (code) => set({ roomCode: code }),
  setPlayerId: (id) => set({ playerId: id }),
  setPlayerName: (name) => set({ playerName: name }),
  setCurrentDice: (dice) => set({ currentDice: dice }),
  setRollCount: (count) => set({ rollCount: count }),
  setScoringPreview: (preview) => set({ scoringPreview: preview }),
  setPlayerState: (state) => set({ playerState: state }),
  setRoomSummary: (summary) => set({ roomSummary: summary }),
  setGameEnded: (ended) => set({ gameEnded: ended }),
  setFinalScores: (scores) => set({ finalScores: scores }),
  setSelectedSheetIndex: (index) => set({ selectedSheetIndex: index }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  reset: () => set(initialState),
}));
