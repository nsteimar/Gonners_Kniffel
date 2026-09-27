/**
 * Main server file with Express and Socket.io
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { RoomState, SocketEvents, Category } from '@kniffel/shared';
import {
  createRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  getRoomSummary,
  allPlayersComplete,
  calculateFinalScores,
} from './roomManager.js';
import {
  processDiceRoll,
  processHoldDie,
  scoreCategoryForPlayer,
  getScoringPreviewForAllSheets,
} from './gameLogic.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Store rooms in memory
const rooms = new Map<string, RoomState>();

// Map socket IDs to player data for reconnection
const socketToPlayer = new Map<string, { roomCode: string; playerId: string }>();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Room: Create
  socket.on(SocketEvents.ROOM_CREATE, (data: { playerName: string }) => {
    try {
      const playerId = uuidv4();
      const room = createRoom(playerId, data.playerName);
      rooms.set(room.roomCode, room);

      socketToPlayer.set(socket.id, {
        roomCode: room.roomCode,
        playerId,
      });

      socket.join(room.roomCode);
      socket.emit(SocketEvents.GAME_STATE, {
        roomCode: room.roomCode,
        playerId,
        playerName: data.playerName,
        roomSummary: getRoomSummary(room),
      });

      io.to(room.roomCode).emit(SocketEvents.ROOM_STATE_UPDATE, getRoomSummary(room));
      console.log(`Room created: ${room.roomCode} by ${data.playerName}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: 'Failed to create room',
        error: (error as Error).message,
      });
    }
  });

  // Room: Join
  socket.on(SocketEvents.ROOM_JOIN, (data: { roomCode: string; playerName: string }) => {
    try {
      const room = rooms.get(data.roomCode);
      if (!room) {
        socket.emit(SocketEvents.ERROR, { message: 'Room not found' });
        return;
      }

      const playerId = uuidv4();
      addPlayerToRoom(room, playerId, data.playerName);

      socketToPlayer.set(socket.id, {
        roomCode: room.roomCode,
        playerId,
      });

      socket.join(room.roomCode);
      socket.emit(SocketEvents.GAME_STATE, {
        roomCode: room.roomCode,
        playerId,
        playerName: data.playerName,
        roomSummary: getRoomSummary(room),
      });

      io.to(room.roomCode).emit(SocketEvents.ROOM_STATE_UPDATE, getRoomSummary(room));
      console.log(`Player ${data.playerName} joined room ${room.roomCode}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: 'Failed to join room',
        error: (error as Error).message,
      });
    }
  });

  // Player: Roll Dice
  socket.on(SocketEvents.PLAYER_ROLL_DICE, (data: { roomCode: string; playerId: string }) => {
    try {
      const room = rooms.get(data.roomCode);
      if (!room) {
        socket.emit(SocketEvents.ERROR, { message: 'Room not found' });
        return;
      }

      const player = room.players.get(data.playerId);
      if (!player) {
        socket.emit(SocketEvents.ERROR, { message: 'Player not found' });
        return;
      }

      const dice = processDiceRoll(player);

      io.to(data.roomCode).emit(SocketEvents.GAME_STATE, {
        roomCode: data.roomCode,
        playerId: data.playerId,
        currentDice: dice,
        rollCount: player.rollCount,
        scoringPreview: getScoringPreviewForAllSheets(player),
        roomSummary: getRoomSummary(room),
      });
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: 'Failed to roll dice',
        error: (error as Error).message,
      });
    }
  });

  // Player: Hold Die
  socket.on(SocketEvents.PLAYER_HOLD_DIE, (data: { roomCode: string; playerId: string; dieIndex: number }) => {
    try {
      const room = rooms.get(data.roomCode);
      if (!room) {
        socket.emit(SocketEvents.ERROR, { message: 'Room not found' });
        return;
      }

      const player = room.players.get(data.playerId);
      if (!player) {
        socket.emit(SocketEvents.ERROR, { message: 'Player not found' });
        return;
      }

      const dice = processHoldDie(player, data.dieIndex);

      io.to(data.roomCode).emit(SocketEvents.GAME_STATE, {
        roomCode: data.roomCode,
        playerId: data.playerId,
        currentDice: dice,
        roomSummary: getRoomSummary(room),
      });
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: 'Failed to hold die',
        error: (error as Error).message,
      });
    }
  });

  // Player: Score Category
  socket.on(
    SocketEvents.PLAYER_SCORE_CATEGORY,
    (data: { roomCode: string; playerId: string; sheetIndex: number; category: Category }) => {
      try {
        const room = rooms.get(data.roomCode);
        if (!room) {
          socket.emit(SocketEvents.ERROR, { message: 'Room not found' });
          return;
        }

        const player = room.players.get(data.playerId);
        if (!player) {
          socket.emit(SocketEvents.ERROR, { message: 'Player not found' });
          return;
        }

        const result = scoreCategoryForPlayer(player, data.sheetIndex, data.category);

        if (!result.success) {
          socket.emit(SocketEvents.ERROR, { message: result.error });
          return;
        }

        // Broadcast updated game state
        io.to(data.roomCode).emit(SocketEvents.GAME_STATE, {
          roomCode: data.roomCode,
          playerId: data.playerId,
          currentDice: player.currentDice,
          rollCount: player.rollCount,
          roomSummary: getRoomSummary(room),
        });

        // Check if all players are complete
        if (allPlayersComplete(room)) {
          const finalScores = calculateFinalScores(room);
          room.isGameEnded = true;
          io.to(data.roomCode).emit(SocketEvents.GAME_ENDED, {
            finalScores,
          });
          console.log(`Game ended in room ${data.roomCode}`);
        }
      } catch (error) {
        socket.emit(SocketEvents.ERROR, {
          message: 'Failed to score category',
          error: (error as Error).message,
        });
      }
    }
  );

  // Room: Leave
  socket.on('disconnect', () => {
    const playerData = socketToPlayer.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomCode);
      if (room) {
        removePlayerFromRoom(room, playerData.playerId);
        io.to(playerData.roomCode).emit(SocketEvents.ROOM_STATE_UPDATE, getRoomSummary(room));

        // Clean up empty rooms
        if (room.players.size === 0) {
          rooms.delete(playerData.roomCode);
          console.log(`Room ${playerData.roomCode} deleted (empty)`);
        }
      }
      socketToPlayer.delete(socket.id);
      console.log(`Player ${playerData.playerId} disconnected from room ${playerData.roomCode}`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
