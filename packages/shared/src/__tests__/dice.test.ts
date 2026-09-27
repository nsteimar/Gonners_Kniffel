/**
 * Unit tests for dice logic
 */

import { describe, it, expect } from 'vitest';
import {
  rollSingleDie,
  initializeDice,
  toggleHoldDie,
  hasThreeOfAKind,
  hasFourOfAKind,
  hasFullHouse,
  hasSmallStraight,
  hasLargeStraight,
  hasYahtzee,
  sumDice,
  sumDiceByValue,
} from '../dice';
import { Dice } from '../types';

describe('Dice Logic', () => {
  describe('rollSingleDie', () => {
    it('should return a number between 1 and 6', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollSingleDie();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });

    it('should return an integer', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollSingleDie();
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('initializeDice', () => {
    it('should return 5 dice', () => {
      const dice = initializeDice();
      expect(dice).toHaveLength(5);
    });

    it('should initialize all dice as unheld', () => {
      const dice = initializeDice();
      dice.forEach((die: Dice) => {
        expect(die.held).toBe(false);
      });
    });

    it('should initialize all dice with values between 1-6', () => {
      const dice = initializeDice();
      dice.forEach((die: Dice) => {
        expect(die.value).toBeGreaterThanOrEqual(1);
        expect(die.value).toBeLessThanOrEqual(6);
      });
    });
  });

  describe('toggleHoldDie', () => {
    it('should toggle held status of a die', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
      ];

      const result = toggleHoldDie(dice, 0);
      expect(result[0].held).toBe(true);
      expect(result[1].held).toBe(false);
    });

    it('should toggle from held to unheld', () => {
      const dice: Dice[] = [{ value: 1, held: true }];
      const result = toggleHoldDie(dice, 0);
      expect(result[0].held).toBe(false);
    });
  });

  describe('Combination detection', () => {
    it('hasThreeOfAKind: should detect three of a kind', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 1, held: false },
        { value: 2, held: false },
      ];
      expect(hasThreeOfAKind(dice)).toBe(true);
    });

    it('hasThreeOfAKind: should not detect with only two of a kind', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 4, held: false },
      ];
      expect(hasThreeOfAKind(dice)).toBe(false);
    });

    it('hasFourOfAKind: should detect four of a kind', () => {
      const dice: Dice[] = [
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 5, held: false },
      ];
      expect(hasFourOfAKind(dice)).toBe(true);
    });

    it('hasFourOfAKind: should not detect with only three of a kind', () => {
      const dice: Dice[] = [
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 5, held: false },
        { value: 6, held: false },
      ];
      expect(hasFourOfAKind(dice)).toBe(false);
    });

    it('hasFullHouse: should detect full house (3+2)', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 5, held: false },
        { value: 5, held: false },
      ];
      expect(hasFullHouse(dice)).toBe(true);
    });

    it('hasFullHouse: should not detect without both groups', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 5, held: false },
        { value: 6, held: false },
      ];
      expect(hasFullHouse(dice)).toBe(false);
    });

    it('hasSmallStraight: should detect 1-2-3-4', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 6, held: false },
      ];
      expect(hasSmallStraight(dice)).toBe(true);
    });

    it('hasSmallStraight: should detect 2-3-4-5', () => {
      const dice: Dice[] = [
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
        { value: 1, held: false },
      ];
      expect(hasSmallStraight(dice)).toBe(true);
    });

    it('hasSmallStraight: should detect 3-4-5-6', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
        { value: 6, held: false },
        { value: 1, held: false },
      ];
      expect(hasSmallStraight(dice)).toBe(true);
    });

    it('hasLargeStraight: should detect 1-2-3-4-5', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      expect(hasLargeStraight(dice)).toBe(true);
    });

    it('hasLargeStraight: should detect 2-3-4-5-6', () => {
      const dice: Dice[] = [
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
        { value: 6, held: false },
      ];
      expect(hasLargeStraight(dice)).toBe(true);
    });

    it('hasYahtzee: should detect all same values', () => {
      const dice: Dice[] = [
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 4, held: false },
      ];
      expect(hasYahtzee(dice)).toBe(true);
    });

    it('hasYahtzee: should not detect with different values', () => {
      const dice: Dice[] = [
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      expect(hasYahtzee(dice)).toBe(false);
    });
  });

  describe('Dice summing', () => {
    it('sumDice: should sum all dice values', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      expect(sumDice(dice)).toBe(15);
    });

    it('sumDiceByValue: should sum only dice with specific value', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 1, held: false },
        { value: 2, held: false },
      ];
      expect(sumDiceByValue(dice, 3)).toBe(9);
    });

    it('sumDiceByValue: should return 0 if no dice match value', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      expect(sumDiceByValue(dice, 6)).toBe(0);
    });
  });
});
