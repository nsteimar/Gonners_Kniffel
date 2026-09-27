/**
 * Main App component
 */

import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { initializeSocket } from './store/socketService';
import StartPage from './pages/StartPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import EndPage from './pages/EndPage';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'start' | 'lobby' | 'game' | 'end'>('start');
  const roomCode = useGameStore((state) => state.roomCode);
  const gameEnded = useGameStore((state) => state.gameEnded);

  useEffect(() => {
    // Initialize socket connection
    initializeSocket();
  }, []);

  useEffect(() => {
    // Update page based on game state
    if (gameEnded) {
      setCurrentPage('end');
    } else if (roomCode) {
      setCurrentPage('game');
    }
  }, [roomCode, gameEnded]);

  return (
    <div className="app">
      {currentPage === 'start' && <StartPage onNavigate={() => setCurrentPage('lobby')} />}
      {currentPage === 'lobby' && <LobbyPage onNavigate={() => setCurrentPage('game')} />}
      {currentPage === 'game' && <GamePage />}
      {currentPage === 'end' && <EndPage />}
    </div>
  );
}
