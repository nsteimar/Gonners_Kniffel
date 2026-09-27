/**
 * End page component - shows final scores
 */

import { useGameStore } from '../store/gameStore';
import './EndPage.css';

export default function EndPage() {
  const finalScores = useGameStore((state) => state.finalScores);
  const roomCode = useGameStore((state) => state.roomCode);

  const handlePlayAgain = () => {
    useGameStore.setState({
      gameEnded: false,
      finalScores: null,
      roomCode: null,
      playerId: null,
      playerName: null,
      currentDice: [],
      rollCount: 0,
      selectedSheetIndex: null,
      selectedCategory: null,
    });
  };

  return (
    <div className="end-page">
      <div className="end-container">
        <h1>🎉 Game Over!</h1>

        <div className="final-scores">
          <h2>Final Scores</h2>
          <table className="scores-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {finalScores?.map((score: any) => (
                <tr key={score.playerId} className={`rank-${score.rank}`}>
                  <td className="rank">{score.rank}</td>
                  <td className="player-name">{score.playerName}</td>
                  <td className="score">{score.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="end-info">
          <p>Room Code: {roomCode}</p>
        </div>

        <button onClick={handlePlayAgain} className="btn-again">
          Play Again
        </button>
      </div>
    </div>
  );
}
