/**
 * Scoring logic for all Kniffel categories
 */

import { Category, Dice, ScoreEntry } from './types';
import {
  hasThreeOfAKind,
  hasFourOfAKind,
  hasFullHouse,
  hasSmallStraight,
  hasLargeStraight,
  hasYahtzee,
  sumDice,
  sumDiceByValue,
} from './dice';

export const UPPER_SECTION_BONUS = 35;
export const UPPER_SECTION_BONUS_THRESHOLD = 63;
export const FULL_HOUSE_POINTS = 25;
export const SMALL_STRAIGHT_POINTS = 30;
export const LARGE_STRAIGHT_POINTS = 40;
export const YAHTZEE_POINTS = 50;
export const BONUS_YAHTZEE_POINTS = 50;

/**
 * Calculate points for a given category and dice combination
 * Returns null if the dice don't qualify for the category
 */
export function calculateCategoryScore(
  category: Category,
  dice: Dice[],
  yahtzeeBonusCount: number = 0
): number | null {
  switch (category) {
    // Upper section: sum of specific values
    case Category.ONES:
      return sumDiceByValue(dice, 1);
    case Category.TWOS:
      return sumDiceByValue(dice, 2);
    case Category.THREES:
      return sumDiceByValue(dice, 3);
    case Category.FOURS:
      return sumDiceByValue(dice, 4);
    case Category.FIVES:
      return sumDiceByValue(dice, 5);
    case Category.SIXES:
      return sumDiceByValue(dice, 6);

    // Lower section: combinations
    case Category.THREE_OF_A_KIND:
      return hasThreeOfAKind(dice) ? sumDice(dice) : null;

    case Category.FOUR_OF_A_KIND:
      return hasFourOfAKind(dice) ? sumDice(dice) : null;

    case Category.FULL_HOUSE:
      return hasFullHouse(dice) ? FULL_HOUSE_POINTS : null;

    case Category.SMALL_STRAIGHT:
      return hasSmallStraight(dice) ? SMALL_STRAIGHT_POINTS : null;

    case Category.LARGE_STRAIGHT:
      return hasLargeStraight(dice) ? LARGE_STRAIGHT_POINTS : null;

    case Category.YAHTZEE:
      return hasYahtzee(dice) ? YAHTZEE_POINTS : null;

    case Category.CHANCE:
      return sumDice(dice);

    default:
      return null;
  }
}

/**
 * Get all valid categories for the current dice roll
 * Returns array of categories that can score > 0 with these dice
 */
export function getValidCategories(dice: Dice[]): Category[] {
  const valid: Category[] = [];

  // Upper section - all always valid
  valid.push(Category.ONES, Category.TWOS, Category.THREES, Category.FOURS, Category.FIVES, Category.SIXES);

  // Lower section - only if combination is met
  if (hasThreeOfAKind(dice)) valid.push(Category.THREE_OF_A_KIND);
  if (hasFourOfAKind(dice)) valid.push(Category.FOUR_OF_A_KIND);
  if (hasFullHouse(dice)) valid.push(Category.FULL_HOUSE);
  if (hasSmallStraight(dice)) valid.push(Category.SMALL_STRAIGHT);
  if (hasLargeStraight(dice)) valid.push(Category.LARGE_STRAIGHT);
  if (hasYahtzee(dice)) valid.push(Category.YAHTZEE);

  // Chance is always valid
  valid.push(Category.CHANCE);

  return valid;
}

/**
 * Get the upper section categories
 */
export function getUpperSectionCategories(): Category[] {
  return [
    Category.ONES,
    Category.TWOS,
    Category.THREES,
    Category.FOURS,
    Category.FIVES,
    Category.SIXES,
  ];
}

/**
 * Get the lower section categories
 */
export function getLowerSectionCategories(): Category[] {
  return [
    Category.THREE_OF_A_KIND,
    Category.FOUR_OF_A_KIND,
    Category.FULL_HOUSE,
    Category.SMALL_STRAIGHT,
    Category.LARGE_STRAIGHT,
    Category.YAHTZEE,
    Category.CHANCE,
  ];
}

/**
 * Calculate upper section sum from score entries
 */
export function calculateUpperSectionSum(scores: Map<Category, ScoreEntry>): number {
  let sum = 0;
  getUpperSectionCategories().forEach((category) => {
    const entry = scores.get(category);
    if (entry) {
      sum += entry.points;
    }
  });
  return sum;
}

/**
 * Calculate lower section sum (including bonus yahtzees)
 */
export function calculateLowerSectionSum(scores: Map<Category, ScoreEntry>): number {
  let sum = 0;
  getLowerSectionCategories().forEach((category) => {
    const entry = scores.get(category);
    if (entry) {
      sum += entry.points;
    }
  });

  // Add bonus yahtzee points (50 per bonus yahtzee)
  scores.forEach((entry) => {
    sum += entry.yahtzeeBonusCount * BONUS_YAHTZEE_POINTS;
  });

  return sum;
}

/**
 * Check if upper section qualifies for bonus
 */
export function checkUpperSectionBonus(upperSum: number): number {
  return upperSum >= UPPER_SECTION_BONUS_THRESHOLD ? UPPER_SECTION_BONUS : 0;
}

/**
 * Calculate total scorecard score
 */
export function calculateScorecardTotal(scores: Map<Category, ScoreEntry>): number {
  const upperSum = calculateUpperSectionSum(scores);
  const upperBonus = checkUpperSectionBonus(upperSum);
  const lowerSum = calculateLowerSectionSum(scores);

  return upperSum + upperBonus + lowerSum;
}

/**
 * Check if a yahtzee should qualify for bonus yahtzee
 * (i.e., if yahtzee category is already filled and a new yahtzee is rolled)
 */
export function isBonusYahtzee(
  dice: Dice[],
  yahtzeeCategoryEntry?: ScoreEntry
): boolean {
  if (!hasYahtzee(dice)) return false;
  if (!yahtzeeCategoryEntry) return false;
  return yahtzeeCategoryEntry.points === YAHTZEE_POINTS;
}
