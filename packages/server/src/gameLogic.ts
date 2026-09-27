/**
 * Game logic handler for server
 */

import {
  PlayerState,
  Scorecard,
  Category,
  Dice,
  ScoreEntry,
  rollDice,
  initializeDice,
  toggleHoldDie,
  calculateCategoryScore,
  calculateScorecardTotal,
  checkUpperSectionBonus,
  calculateUpperSectionSum,
  calculateLowerSectionSum,
  isBonusYahtzee,
  YAHTZEE_POINTS,
  BONUS_YAHTZEE_POINTS,
  getUpperSectionCategories,
  getLowerSectionCategories,
} from '@kniffel/shared';

/**
 * Process dice roll for a player
 */
export function processDiceRoll(player: PlayerState): Dice[] {
  if (player.rollCount >= 3) {
    throw new Error('Maximum rolls (3) exceeded');
  }

  if (player.rollCount === 0) {
    // First roll - initialize new dice
    player.currentDice = initializeDice();
  } else {
    // Subsequent rolls - roll only unheld dice
    player.currentDice = rollDice(player.currentDice);
  }

  player.rollCount++;
  return player.currentDice;
}

/**
 * Process holding/unholdling a die
 */
export function processHoldDie(player: PlayerState, dieIndex: number): Dice[] {
  if (dieIndex < 0 || dieIndex >= 6) {
    throw new Error('Invalid die index');
  }

  if (player.rollCount === 0) {
    throw new Error('Cannot hold dice before first roll');
  }

  player.currentDice = toggleHoldDie(player.currentDice, dieIndex);
  return player.currentDice;
}

/**
 * Score a category for a player in a specific scorecard
 */
export function scoreCategoryForPlayer(
  player: PlayerState,
  sheetIndex: number,
  category: Category
): { success: boolean; error?: string; scorecard?: Scorecard } {
  if (sheetIndex < 0 || sheetIndex >= 6) {
    return { success: false, error: 'Invalid sheet index' };
  }

  const scorecard = player.scorecards[sheetIndex];
  if (scorecard.isComplete) {
    return { success: false, error: 'Scorecard is complete' };
  }

  if (scorecard.scores.has(category)) {
    return { success: false, error: 'Category already scored' };
  }

  if (player.rollCount === 0) {
    return { success: false, error: 'Must roll dice first' };
  }

  const points = calculateCategoryScore(category, player.currentDice);

  // Special handling for bonus yahtzee
  if (category === Category.YAHTZEE && isBonusYahtzee(player.currentDice, scorecard.scores.get(Category.YAHTZEE))) {
    // Don't overwrite yahtzee category, instead add to bonus count
    const yahtzeEntry = scorecard.scores.get(Category.YAHTZEE)!;
    yahtzeEntry.yahtzeeBonusCount++;
    scorecard.lowerSectionSum += BONUS_YAHTZEE_POINTS;
  } else {
    // Regular scoring
    const pointsValue = points !== null ? points : 0;
    scorecard.scores.set(category, {
      category,
      points: pointsValue,
      yahtzeeBonusCount: 0,
    });

    // Update section sums
    if (getUpperSectionCategories().includes(category)) {
      scorecard.upperSectionSum = calculateUpperSectionSum(scorecard.scores);
      scorecard.upperSectionBonus = checkUpperSectionBonus(scorecard.upperSectionSum);
    } else {
      scorecard.lowerSectionSum = calculateLowerSectionSum(scorecard.scores);
    }
  }

  // Check if all 13 categories are filled
  const allCategoriesFilled = scorecard.scores.size === 13;
  if (allCategoriesFilled) {
    scorecard.isComplete = true;
    scorecard.totalScore = calculateScorecardTotal(scorecard.scores);
  }

  // Reset roll state
  player.currentDice = [];
  player.rollCount = 0;

  // Check if all 6 scorecards are complete
  const allScorecardsComplete = player.scorecards.every((s) => s.isComplete);
  if (allScorecardsComplete) {
    player.isComplete = true;
    player.totalScore = player.scorecards.reduce((sum, card) => sum + card.totalScore, 0);
  }

  return { success: true, scorecard };
}

/**
 * Get available categories for current dice roll
 */
export function getAvailableCategoriesForSheet(
  scorecard: Scorecard,
  player: PlayerState
): Category[] {
  if (player.rollCount === 0) {
    return [];
  }

  const allCategories = [...getUpperSectionCategories(), ...getLowerSectionCategories()];
  return allCategories.filter((category) => !scorecard.scores.has(category));
}

/**
 * Get scoring preview for all available sheets
 */
export function getScoringPreviewForAllSheets(player: PlayerState) {
  if (player.rollCount === 0) {
    return {};
  }

  const preview: Record<number, Record<string, number | null>> = {};

  player.scorecards.forEach((scorecard) => {
    const sheetPreview: Record<string, number | null> = {};

    const allCategories = [
      ...getUpperSectionCategories(),
      ...getLowerSectionCategories(),
    ];

    allCategories.forEach((category) => {
      if (!scorecard.scores.has(category)) {
        sheetPreview[category] = calculateCategoryScore(category, player.currentDice);
      }
    });

    preview[scorecard.sheetIndex] = sheetPreview;
  });

  return preview;
}
