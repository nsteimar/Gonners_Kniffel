/**
 * Start page component
 */

import { useState } from 'react';
import { createRoom, joinRoom, initializeSocket } from '../store/socketService';
import './StartPage.css';

interface StartPageProps {
  onNavigate: () => void;
}

export default function StartPage({ onNavigate }: StartPageProps) {
  const [playerName, setPlayerName] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    initializeSocket();
    createRoom(playerName);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    initializeSocket();
    joinRoom(roomCode, playerName);
  };

  return (
    <div className="start-page">
      <div className="start-container">
        <h1>🎲 Kniffel Online</h1>
        <p className="subtitle">Play Yahtzee with friends in real-time</p>

        <div className="input-section">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && mode === 'create') handleCreateRoom();
              if (e.key === 'Enter' && mode === 'join') handleJoinRoom();
            }}
          />
        </div>

        {!mode && (
          <div className="button-group">
            <button onClick={() => setMode('create')} className="btn-primary">
              Create Room
            </button>
            <button onClick={() => setMode('join')} className="btn-secondary">
              Join Room
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="action-section">
            <p>Creating a new room...</p>
            <button onClick={handleCreateRoom} className="btn-primary">
              Create
            </button>
            <button onClick={() => setMode(null)} className="btn-secondary">
              Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="action-section">
            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={5}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleJoinRoom();
              }}
            />
            <button onClick={handleJoinRoom} className="btn-primary">
              Join
            </button>
            <button onClick={() => setMode(null)} className="btn-secondary">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
