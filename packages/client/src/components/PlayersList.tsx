/**
 * Players list component
 */

import './PlayersList.css';

interface Player {
  playerId: string;
  playerName: string;
  totalScore: number;
  sheetsComplete: number;
}

interface PlayersListProps {
  players: Player[];
  currentPlayerId: string | null;
}

export default function PlayersList({ players, currentPlayerId }: PlayersListProps) {
  return (
    <div className="players-list">
      {players.length === 0 ? (
        <div className="no-players">No players yet</div>
      ) : (
        <div className="players-items">
          {players.map((player) => (
            <div
              key={player.playerId}
              className={`player-item ${player.playerId === currentPlayerId ? 'current' : ''}`}
            >
              <div className="player-header">
                <div className="player-info">
                  <span className="player-name">{player.playerName}</span>
                  {player.playerId === currentPlayerId && (
                    <span className="current-badge">You</span>
                  )}
                </div>
              </div>
              <div className="player-stats">
                <div className="stat">
                  <span className="stat-label">Score</span>
                  <span className="stat-value">{player.totalScore}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Progress</span>
                  <span className="stat-value">{player.sheetsComplete}/6</span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(player.sheetsComplete / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
