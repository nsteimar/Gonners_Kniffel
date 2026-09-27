/**
 * Lobby page component
 */

import { useGameStore } from '../store/gameStore';
import './LobbyPage.css';

interface LobbyPageProps {
  onNavigate: () => void;
}

export default function LobbyPage({ onNavigate }: LobbyPageProps) {
  const roomCode = useGameStore((state) => state.roomCode);
  const roomSummary = useGameStore((state) => state.roomSummary);
  const playerName = useGameStore((state) => state.playerName);

  const playerCount = roomSummary?.playerCount || 0;
  const players = roomSummary?.players || [];

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        <h1>Lobby</h1>

        <div className="room-info">
          <div className="room-code-display">
            <label>Room Code:</label>
            <p className="code">{roomCode}</p>
          </div>

          <div className="player-info">
            <label>You:</label>
            <p>{playerName}</p>
          </div>
        </div>

        <div className="players-section">
          <h2>Players in Room ({playerCount})</h2>
          <div className="players-list">
            {players.map((player: any) => (
              <div key={player.playerId} className="player-item">
                <div className="player-name">{player.playerName}</div>
                <div className="player-status">
                  Score: {player.totalScore || 0} | Sheets: {player.sheetsComplete}/6
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lobby-info">
          <p>
            Welcome to the lobby! Other players can join using the room code shown above.
          </p>
          <p>The game will start when you begin rolling dice. No need to wait for everyone!</p>
        </div>

        <button onClick={onNavigate} className="btn-start">
          Ready to Play
        </button>
      </div>
    </div>
  );
}
