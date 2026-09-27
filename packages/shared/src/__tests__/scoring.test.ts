/**
 * Unit tests for scoring logic
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCategoryScore,
  getValidCategories,
  calculateUpperSectionSum,
  calculateLowerSectionSum,
  calculateScorecardTotal,
  checkUpperSectionBonus,
  isBonusYahtzee,
  UPPER_SECTION_BONUS,
  UPPER_SECTION_BONUS_THRESHOLD,
  FULL_HOUSE_POINTS,
  SMALL_STRAIGHT_POINTS,
  LARGE_STRAIGHT_POINTS,
  YAHTZEE_POINTS,
  BONUS_YAHTZEE_POINTS,
} from '../scoring';
import { Category, Dice, ScoreEntry } from '../types';

describe('Scoring Logic', () => {
  describe('calculateCategoryScore - Upper Section', () => {
    it('should calculate ONES correctly', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 1, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      expect(calculateCategoryScore(Category.ONES, dice)).toBe(2);
    });

    it('should calculate TWOS correctly', () => {
      const dice: Dice[] = [
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      expect(calculateCategoryScore(Category.TWOS, dice)).toBe(6);
    });

    it('should calculate SIXES correctly', () => {
      const dice: Dice[] = [
        { value: 6, held: false },
        { value: 6, held: false },
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
      ];
      expect(calculateCategoryScore(Category.SIXES, dice)).toBe(12);
    });
  });

  describe('calculateCategoryScore - Lower Section', () => {
    it('should score THREE_OF_A_KIND', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 1, held: false },
        { value: 2, held: false },
      ];
      expect(calculateCategoryScore(Category.THREE_OF_A_KIND, dice)).toBe(12);
    });

    it('should return null for THREE_OF_A_KIND if not qualified', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 4, held: false },
      ];
      expect(calculateCategoryScore(Category.THREE_OF_A_KIND, dice)).toBeNull();
    });

    it('should score FOUR_OF_A_KIND', () => {
      const dice: Dice[] = [
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 5, held: false },
      ];
      expect(calculateCategoryScore(Category.FOUR_OF_A_KIND, dice)).toBe(13);
    });

    it('should score FULL_HOUSE as fixed 25 points', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 5, held: false },
        { value: 5, held: false },
      ];
      expect(calculateCategoryScore(Category.FULL_HOUSE, dice)).toBe(FULL_HOUSE_POINTS);
    });

    it('should score SMALL_STRAIGHT as fixed 30 points', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 6, held: false },
      ];
      expect(calculateCategoryScore(Category.SMALL_STRAIGHT, dice)).toBe(SMALL_STRAIGHT_POINTS);
    });

    it('should score LARGE_STRAIGHT as fixed 40 points', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      expect(calculateCategoryScore(Category.LARGE_STRAIGHT, dice)).toBe(LARGE_STRAIGHT_POINTS);
    });

    it('should score YAHTZEE as fixed 50 points', () => {
      const dice: Dice[] = [
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 4, held: false },
        { value: 4, held: false },
      ];
      expect(calculateCategoryScore(Category.YAHTZEE, dice)).toBe(YAHTZEE_POINTS);
    });

    it('should score CHANCE as sum of all dice', () => {
      const dice: Dice[] = [
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
        { value: 6, held: false },
      ];
      expect(calculateCategoryScore(Category.CHANCE, dice)).toBe(20);
    });
  });

  describe('getValidCategories', () => {
    it('should include all upper section categories (always valid)', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      const valid = getValidCategories(dice);
      expect(valid).toContain(Category.ONES);
      expect(valid).toContain(Category.TWOS);
      expect(valid).toContain(Category.SIXES);
    });

    it('should include CHANCE (always valid)', () => {
      const dice: Dice[] = [
        { value: 1, held: false },
        { value: 2, held: false },
        { value: 3, held: false },
        { value: 4, held: false },
        { value: 5, held: false },
      ];
      const valid = getValidCategories(dice);
      expect(valid).toContain(Category.CHANCE);
    });

    it('should include THREE_OF_A_KIND when qualified', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 1, held: false },
        { value: 2, held: false },
      ];
      const valid = getValidCategories(dice);
      expect(valid).toContain(Category.THREE_OF_A_KIND);
    });

    it('should include YAHTZEE when all dice are same', () => {
      const dice: Dice[] = [
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
        { value: 2, held: false },
      ];
      const valid = getValidCategories(dice);
      expect(valid).toContain(Category.YAHTZEE);
    });
  });

  describe('Bonus calculations', () => {
    it('checkUpperSectionBonus: should grant 35 when sum >= 63', () => {
      expect(checkUpperSectionBonus(63)).toBe(UPPER_SECTION_BONUS);
      expect(checkUpperSectionBonus(70)).toBe(UPPER_SECTION_BONUS);
    });

    it('checkUpperSectionBonus: should not grant when sum < 63', () => {
      expect(checkUpperSectionBonus(62)).toBe(0);
      expect(checkUpperSectionBonus(50)).toBe(0);
    });
  });

  describe('Scorecard total calculation', () => {
    it('should calculate total with upper and lower sections', () => {
      const scores = new Map<Category, ScoreEntry>([
        [Category.ONES, { category: Category.ONES, points: 5, yahtzeeBonusCount: 0 }],
        [Category.TWOS, { category: Category.TWOS, points: 10, yahtzeeBonusCount: 0 }],
        [Category.THREES, { category: Category.THREES, points: 12, yahtzeeBonusCount: 0 }],
        [Category.FOURS, { category: Category.FOURS, points: 8, yahtzeeBonusCount: 0 }],
        [Category.FIVES, { category: Category.FIVES, points: 10, yahtzeeBonusCount: 0 }],
        [Category.SIXES, { category: Category.SIXES, points: 12, yahtzeeBonusCount: 0 }],
        // Upper sum: 57 (no bonus)
        [Category.THREE_OF_A_KIND, { category: Category.THREE_OF_A_KIND, points: 15, yahtzeeBonusCount: 0 }],
        [Category.FOUR_OF_A_KIND, { category: Category.FOUR_OF_A_KIND, points: 18, yahtzeeBonusCount: 0 }],
        [Category.FULL_HOUSE, { category: Category.FULL_HOUSE, points: 25, yahtzeeBonusCount: 0 }],
        [Category.SMALL_STRAIGHT, { category: Category.SMALL_STRAIGHT, points: 30, yahtzeeBonusCount: 0 }],
        [Category.LARGE_STRAIGHT, { category: Category.LARGE_STRAIGHT, points: 40, yahtzeeBonusCount: 0 }],
        [Category.YAHTZEE, { category: Category.YAHTZEE, points: 50, yahtzeeBonusCount: 0 }],
        [Category.CHANCE, { category: Category.CHANCE, points: 20, yahtzeeBonusCount: 0 }],
      ]);

      const total = calculateScorecardTotal(scores);
      // Upper: 57, Lower: 198, Total: 255
      expect(total).toBe(57 + 198);
    });

    it('should include upper section bonus when applicable', () => {
      const scores = new Map<Category, ScoreEntry>([
        [Category.ONES, { category: Category.ONES, points: 10, yahtzeeBonusCount: 0 }],
        [Category.TWOS, { category: Category.TWOS, points: 12, yahtzeeBonusCount: 0 }],
        [Category.THREES, { category: Category.THREES, points: 12, yahtzeeBonusCount: 0 }],
        [Category.FOURS, { category: Category.FOURS, points: 12, yahtzeeBonusCount: 0 }],
        [Category.FIVES, { category: Category.FIVES, points: 10, yahtzeeBonusCount: 0 }],
        [Category.SIXES, { category: Category.SIXES, points: 12, yahtzeeBonusCount: 0 }],
        // Upper sum: 68 (qualifies for bonus)
        [Category.CHANCE, { category: Category.CHANCE, points: 20, yahtzeeBonusCount: 0 }],
      ]);

      const total = calculateScorecardTotal(scores);
      // Upper: 68, Bonus: 35, Lower: 20, Total: 123
      expect(total).toBe(68 + UPPER_SECTION_BONUS + 20);
    });

    it('should include bonus yahtzee points', () => {
      const scores = new Map<Category, ScoreEntry>([
        [Category.ONES, { category: Category.ONES, points: 5, yahtzeeBonusCount: 0 }],
        [Category.YAHTZEE, { category: Category.YAHTZEE, points: 50, yahtzeeBonusCount: 2 }], // 2 bonus yahtzees
      ]);

      const total = calculateScorecardTotal(scores);
      // Upper: 5, Lower: 50 + (2 * 50), Total: 155
      expect(total).toBe(5 + 50 + 2 * BONUS_YAHTZEE_POINTS);
    });
  });

  describe('Bonus yahtzee detection', () => {
    it('should detect bonus yahtzee', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
      ];
      const yahtzeeCategoryEntry: ScoreEntry = {
        category: Category.YAHTZEE,
        points: YAHTZEE_POINTS,
        yahtzeeBonusCount: 0,
      };

      expect(isBonusYahtzee(dice, yahtzeeCategoryEntry)).toBe(true);
    });

    it('should not detect bonus yahtzee if category is empty', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
      ];

      expect(isBonusYahtzee(dice, undefined)).toBe(false);
    });

    it('should not detect bonus yahtzee if dice do not match', () => {
      const dice: Dice[] = [
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 3, held: false },
        { value: 2, held: false },
      ];
      const yahtzeeCategoryEntry: ScoreEntry = {
        category: Category.YAHTZEE,
        points: YAHTZEE_POINTS,
        yahtzeeBonusCount: 0,
      };

      expect(isBonusYahtzee(dice, yahtzeeCategoryEntry)).toBe(false);
    });
  });
});
