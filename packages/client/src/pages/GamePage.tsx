/**
 * Game page component
 */

import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { rollDice, holdDie, scoreCategory } from '../store/socketService';
import { Category } from '@kniffel/shared';
import DiceDisplay from '../components/DiceDisplay';
import ScorecardTabs from '../components/ScorecardTabs';
import PlayersList from '../components/PlayersList';
import './GamePage.css';

export default function GamePage() {
  const roomCode = useGameStore((state) => state.roomCode);
  const playerId = useGameStore((state) => state.playerId);
  const playerName = useGameStore((state) => state.playerName);
  const currentDice = useGameStore((state) => state.currentDice);
  const rollCount = useGameStore((state) => state.rollCount);
  const selectedSheetIndex = useGameStore((state) => state.selectedSheetIndex);
  const selectedCategory = useGameStore((state) => state.selectedCategory);
  const roomSummary = useGameStore((state) => state.roomSummary);
  const scoringPreview = useGameStore((state) => state.scoringPreview);

  const [rolling, setRolling] = useState(false);

  const handleRollDice = async () => {
    if (!roomCode || !playerId || rollCount >= 3) return;
    setRolling(true);
    rollDice(roomCode, playerId);
    setTimeout(() => setRolling(false), 500);
  };

  const handleHoldDie = (dieIndex: number) => {
    if (!roomCode || !playerId) return;
    holdDie(roomCode, playerId, dieIndex);
  };

  const handleScoreCategory = () => {
    if (!roomCode || !playerId || selectedSheetIndex === null || !selectedCategory) return;
    scoreCategory(roomCode, playerId, selectedSheetIndex, selectedCategory);
    // Reset selection
    useGameStore.setState({ selectedSheetIndex: null, selectedCategory: null });
  };

  const players = roomSummary?.players || [];
  const canRoll = rollCount < 3;
  const hasDice = currentDice.length > 0;

  // Auto-set selectedSheetIndex to current player's sheet index
  const playerSheetIndex = players.findIndex((p: any) => p.playerId === playerId);
  if (selectedSheetIndex === null && playerSheetIndex !== -1) {
    useGameStore.setState({ selectedSheetIndex: playerSheetIndex });
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <h1>🎲 Kniffel Game</h1>
        <div className="game-info">
          <span>Room: {roomCode}</span>
          <span>Player: {playerName}</span>
        </div>
      </div>

      <div className="game-content">
        {/* LEFT: Dice */}
        <div className="game-left">
          <div className="dice-section">
            <h2>Würfel</h2>
            <DiceDisplay dice={currentDice} onHoldDie={handleHoldDie} isRolling={rolling} />
            <div className="roll-controls">
              <button
                onClick={handleRollDice}
                disabled={!canRoll || rolling}
                className="btn-roll"
              >
                {rolling ? 'Rolling...' : `Roll (${rollCount}/3)`}
              </button>
              <p className="roll-info">
                {rollCount === 0 && 'Start'}
                {rollCount > 0 && rollCount < 3 && 'Hold & Roll'}
                {rollCount === 3 && 'Score!'}
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: Scorecard */}
        <div className="game-center">
          <div className="scorecard-section">
            <h2>Kniffelblatt</h2>
            <ScorecardTabs
              scoringPreview={scoringPreview}
              selectedSheetIndex={selectedSheetIndex}
              selectedCategory={selectedCategory}
              onSelectCategory={(category) =>
                useGameStore.setState({ selectedCategory: category })
              }
              onSelectCategoryForGame={(category, gameIndex) => {
                useGameStore.setState({
                  selectedSheetIndex: gameIndex,
                  selectedCategory: category,
                });
              }}
              playerScoreboards={
                players[playerSheetIndex]?.scorecards || []
              }
            />
            {hasDice && (
              <button
                onClick={handleScoreCategory}
                disabled={selectedSheetIndex === null || !selectedCategory}
                className="btn-score"
              >
                Score Selected
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Players */}
        <div className="game-right">
          <div className="players-sidebar">
            <h2>Spieler</h2>
            <PlayersList players={players} currentPlayerId={playerId} />
          </div>
        </div>
      </div>
    </div>
  );
}
