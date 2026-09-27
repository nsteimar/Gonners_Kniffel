import { useState } from 'react';
import { Category, getUpperSectionCategories, getLowerSectionCategories, Scorecard } from '@kniffel/shared';
import './ScorecardTabs.css';

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.ONES]: '1s',
  [Category.TWOS]: '2s',
  [Category.THREES]: '3s',
  [Category.FOURS]: '4s',
  [Category.FIVES]: '5s',
  [Category.SIXES]: '6s',
  [Category.THREE_OF_A_KIND]: '3er Pasch',
  [Category.FOUR_OF_A_KIND]: '4er Pasch',
  [Category.FULL_HOUSE]: 'Full House',
  [Category.SMALL_STRAIGHT]: 'Kleine Straße',
  [Category.LARGE_STRAIGHT]: 'Große Straße',
  [Category.YAHTZEE]: 'Yahtzee',
  [Category.CHANCE]: 'Chance',
};

interface ScorecardTabsProps {
  scoringPreview: Record<number, Record<string, number | null>>;
  selectedSheetIndex: number | null;
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
  onSelectCategoryForGame?: (category: Category, gameIndex: number) => void;
  playerScoreboards?: Scorecard[];
}

export default function ScorecardTabs({
  scoringPreview,
  selectedSheetIndex,
  selectedCategory,
  onSelectCategory,
  onSelectCategoryForGame,
  playerScoreboards = [],
}: ScorecardTabsProps) {
  const upperCategories = getUpperSectionCategories();
  const lowerCategories = getLowerSectionCategories();
  const allCategories = [...upperCategories, ...lowerCategories];
  const currentSheet = selectedSheetIndex !== null ? selectedSheetIndex : 0;

  // Berechne Zwischensummen für ein Spiel
  const calculateSums = (gameIndex: number) => {
    const scorecard = playerScoreboards[gameIndex];
    
    if (!scorecard) {
      return { upperSum: 0, bonus: 0, lowerSum: 0, total: 0 };
    }

    // Upper Section Summe
    let upperSum = 0;
    upperCategories.forEach((cat) => {
      const scoreEntry = scorecard.scores?.find((s: any) => s.category === cat);
      if (scoreEntry !== undefined && scoreEntry !== null) {
        upperSum += scoreEntry.points;
      }
    });

    // Bonus (35 Punkte wenn >= 63)
    const bonus = upperSum >= 63 ? 35 : 0;

    // Lower Section Summe
    let lowerSum = 0;
    lowerCategories.forEach((cat) => {
      const scoreEntry = scorecard.scores?.find((s: any) => s.category === cat);
      if (scoreEntry !== undefined && scoreEntry !== null) {
        lowerSum += scoreEntry.points;
      }
    });

    // Total
    const total = upperSum + bonus + lowerSum;

    return { upperSum, bonus, lowerSum, total };
  };

  const renderGameCell = (gameIndex: number, category: Category, value: number | null | string, isEditable: boolean) => {
    const isCurrent = gameIndex === currentSheet;
    
    // Hole den tatsächlichen eingetragenen Wert aus playerScoreboards
    const scorecard = playerScoreboards[gameIndex];
    
    // Scores ist jetzt ein Array statt Map - finde den Eintrag für diese Kategorie
    const scoreEntry = scorecard?.scores?.find((s: any) => s.category === category);
    
    // Wenn bereits ein Wert eingetragen ist, zeige diesen (schwarz, permanent)
    if (scoreEntry !== undefined && scoreEntry !== null) {
      return <span className="points-value permanent">{scoreEntry.points}</span>;
    }

    // Sonst zeige Preview (nur für aktuelles Spiel, gelb)
    if (typeof value === 'string') {
      return <span className={`points-value ${!isCurrent ? 'inactive' : ''}`}>{value}</span>;
    }

    if (!isCurrent) {
      return <span className="points-empty">—</span>;
    }

    return (
      <span className="points-value preview">
        {value !== null ? value : '—'}
      </span>
    );
  };

  return (
    <div className="scorecard-tabs">
      <table className="kniffel-table">
        <thead>
          <tr>
            <th className="category-name-header">Kategorie</th>
            {[1, 2, 3, 4, 5, 6].map((gameNum) => (
              <th key={gameNum} className="game-header">Spiel {gameNum}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* UPPER SECTION */}
          {upperCategories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <tr
                key={category}
                className={`category-row ${isSelected ? 'selected' : ''}`}
              >
                <td className="category-name">{CATEGORY_LABELS[category]}</td>
                {[0, 1, 2, 3, 4, 5].map((gameIndex) => {
                  const preview = scoringPreview[gameIndex]?.[category];
                  const isCurrent = gameIndex === currentSheet;
                  
                  return (
                    <td
                      key={gameIndex}
                      className={`game-cell ${isCurrent ? 'current-game' : 'other-game'} ${
                        isSelected && isCurrent ? 'selected-cell' : ''
                      }`}
                      onClick={() => {
                        if (onSelectCategoryForGame) {
                          onSelectCategoryForGame(category, gameIndex);
                        } else {
                          onSelectCategory(category);
                        }
                      }}
                    >
                      {renderGameCell(gameIndex, category, preview !== undefined ? preview : null, isCurrent)}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* Zwischensumme Upper Section */}
          <tr className="summary-row upper-sum">
            <td className="category-name">Zwischensumme</td>
            {[0, 1, 2, 3, 4, 5].map((gameIndex) => {
              const { upperSum } = calculateSums(gameIndex);
              const isCurrent = gameIndex === currentSheet;
              return (
                <td key={gameIndex} className={`game-cell summary-cell ${isCurrent ? 'current-game' : 'other-game'}`}>
                  <span className={`points-value ${!isCurrent ? 'inactive' : ''}`}>{upperSum}</span>
                  <div className="bonus-hint">({63 - upperSum} fehlt)</div>
                </td>
              );
            })}
          </tr>

          {/* Bonus 35 */}
          <tr className="summary-row bonus-row">
            <td className="category-name">Bonus 35</td>
            {[0, 1, 2, 3, 4, 5].map((gameIndex) => {
              const { bonus } = calculateSums(gameIndex);
              const isCurrent = gameIndex === currentSheet;
              return (
                <td key={gameIndex} className={`game-cell summary-cell ${isCurrent ? 'current-game' : 'other-game'}`}>
                  <span className={`points-value ${bonus > 0 ? 'bonus-active' : 'bonus-inactive'} ${!isCurrent ? 'inactive' : ''}`}>
                    {bonus > 0 ? bonus : '—'}
                  </span>
                </td>
              );
            })}
          </tr>

          {/* LOWER SECTION */}
          {lowerCategories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <tr
                key={category}
                className={`category-row ${isSelected ? 'selected' : ''}`}
              >
                <td className="category-name">{CATEGORY_LABELS[category]}</td>
                {[0, 1, 2, 3, 4, 5].map((gameIndex) => {
                  const preview = scoringPreview[gameIndex]?.[category];
                  const isCurrent = gameIndex === currentSheet;
                  
                  return (
                    <td
                      key={gameIndex}
                      className={`game-cell ${isCurrent ? 'current-game' : 'other-game'} ${
                        isSelected && isCurrent ? 'selected-cell' : ''
                      }`}
                      onClick={() => {
                        if (onSelectCategoryForGame) {
                          onSelectCategoryForGame(category, gameIndex);
                        } else {
                          onSelectCategory(category);
                        }
                      }}
                    >
                      {renderGameCell(gameIndex, category, preview !== undefined ? preview : null, isCurrent)}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* Total */}
          <tr className="total-row">
            <td className="category-name">GESAMT</td>
            {[0, 1, 2, 3, 4, 5].map((gameIndex) => {
              const { total } = calculateSums(gameIndex);
              const isCurrent = gameIndex === currentSheet;
              return (
                <td key={gameIndex} className={`game-cell total-cell ${isCurrent ? 'current-game' : 'other-game'}`}>
                  <span className={`points-value ${!isCurrent ? 'inactive' : ''}`}>{total}</span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
