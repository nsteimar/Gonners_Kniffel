/**
 * Dice rolling and utility functions
 */

import { Dice } from './types';

/**
 * Roll a single die (1-6)
 */
export function rollSingleDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Roll all dice that are not held
 */
export function rollDice(currentDice: Dice[]): Dice[] {
  return currentDice.map((die) => ({
    value: die.held ? die.value : rollSingleDie(),
    held: die.held,
  }));
}

/**
 * Initialize fresh dice set (all unheld, random values)
 */
export function initializeDice(): Dice[] {
  return Array.from({ length: 6 }, () => ({
    value: rollSingleDie(),
    held: false,
  }));
}

/**
 * Hold/unhold a single die
 */
export function toggleHoldDie(currentDice: Dice[], dieIndex: number): Dice[] {
  return currentDice.map((die, idx) =>
    idx === dieIndex ? { ...die, held: !die.held } : die
  );
}

/**
 * Check if dice form a three of a kind (at least 3 dice with same value)
 */
export function hasThreeOfAKind(dice: Dice[]): boolean {
  const counts = countDiceValues(dice);
  return Math.max(...Object.values(counts)) >= 3;
}

/**
 * Check if dice form a four of a kind (at least 4 dice with same value)
 */
export function hasFourOfAKind(dice: Dice[]): boolean {
  const counts = countDiceValues(dice);
  return Math.max(...Object.values(counts)) >= 4;
}

/**
 * Check if dice form a full house (3 of one value, 2 of another)
 */
export function hasFullHouse(dice: Dice[]): boolean {
  const counts = Object.values(countDiceValues(dice)).sort((a, b) => b - a);
  return counts[0] === 3 && counts[1] === 2;
}

/**
 * Check if dice form a small straight (4 consecutive values)
 * Valid small straights: 1-2-3-4, 2-3-4-5, 3-4-5-6
 */
export function hasSmallStraight(dice: Dice[]): boolean {
  const values = new Set(dice.map((d) => d.value));
  const straightPatterns = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
  ];

  return straightPatterns.some((pattern) =>
    pattern.every((value) => values.has(value))
  );
}

/**
 * Check if dice form a large straight (5 consecutive values)
 * Valid large straights: 1-2-3-4-5, 2-3-4-5-6
 */
export function hasLargeStraight(dice: Dice[]): boolean {
  const values = new Set(dice.map((d) => d.value));
  const largeStraightPatterns = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]];

  return largeStraightPatterns.some((pattern) =>
    pattern.every((value) => values.has(value))
  );
}

/**
 * Check if all 5 dice have the same value (yahtzee)
 */
export function hasYahtzee(dice: Dice[]): boolean {
  const firstValue = dice[0].value;
  return dice.every((die) => die.value === firstValue);
}

/**
 * Count how many times each value appears in dice
 */
function countDiceValues(dice: Dice[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  dice.forEach((die) => {
    counts[die.value]++;
  });
  return counts;
}

/**
 * Get sum of all dice values
 */
export function sumDice(dice: Dice[]): number {
  return dice.reduce((sum, die) => sum + die.value, 0);
}

/**
 * Get sum of dice with a specific value (for 1s, 2s, etc.)
 */
export function sumDiceByValue(dice: Dice[], value: number): number {
  return dice
    .filter((die) => die.value === value)
    .reduce((sum, die) => sum + die.value, 0);
}
