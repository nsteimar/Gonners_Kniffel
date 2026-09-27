/**
 * Socket.io service for client
 */

import { io, Socket } from 'socket.io-client';
import { SocketEvents, Category } from '@kniffel/shared';
import { useGameStore } from './gameStore';

let socket: Socket | null = null;

const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export function initializeSocket() {
  if (socket) return socket;

  socket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Connected to server:', socket?.id);
    useGameStore.setState({ connected: true });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    useGameStore.setState({ connected: false });
  });

  socket.on(SocketEvents.GAME_STATE, (data) => {
    const store = useGameStore.getState();
    
    if (data.roomCode) useGameStore.setState({ roomCode: data.roomCode });
    if (data.playerId) useGameStore.setState({ playerId: data.playerId });
    if (data.playerName) useGameStore.setState({ playerName: data.playerName });
    if (data.currentDice) useGameStore.setState({ currentDice: data.currentDice });
    if (typeof data.rollCount !== 'undefined') {
      useGameStore.setState({ rollCount: data.rollCount });
    }
    if (data.scoringPreview) useGameStore.setState({ scoringPreview: data.scoringPreview });
    if (data.roomSummary) useGameStore.setState({ roomSummary: data.roomSummary });
  });

  socket.on(SocketEvents.ROOM_STATE_UPDATE, (data) => {
    useGameStore.setState({ roomSummary: data });
  });

  socket.on(SocketEvents.GAME_ENDED, (data) => {
    useGameStore.setState({
      gameEnded: true,
      finalScores: data.finalScores,
    });
  });

  socket.on(SocketEvents.ERROR, (data) => {
    console.error('Socket error:', data.message, data.error);
    alert(`Error: ${data.message}`);
  });

  useGameStore.setState({ socket });
  return socket;
}

export function getSocket() {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}

export function createRoom(playerName: string) {
  const socket = getSocket();
  socket.emit(SocketEvents.ROOM_CREATE, { playerName });
}

export function joinRoom(roomCode: string, playerName: string) {
  const socket = getSocket();
  socket.emit(SocketEvents.ROOM_JOIN, { roomCode, playerName });
}

export function rollDice(roomCode: string, playerId: string) {
  const socket = getSocket();
  socket.emit(SocketEvents.PLAYER_ROLL_DICE, { roomCode, playerId });
}

export function holdDie(roomCode: string, playerId: string, dieIndex: number) {
  const socket = getSocket();
  socket.emit(SocketEvents.PLAYER_HOLD_DIE, { roomCode, playerId, dieIndex });
}

export function scoreCategory(
  roomCode: string,
  playerId: string,
  sheetIndex: number,
  category: Category
) {
  const socket = getSocket();
  socket.emit(SocketEvents.PLAYER_SCORE_CATEGORY, {
    roomCode,
    playerId,
    sheetIndex,
    category,
  });
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
