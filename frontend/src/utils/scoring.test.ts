import { calculateRoundScore, calculateRunningTotal, calculateTotalRounds, calculateCardsForRound } from './scoring';

describe('Scoring Utils', () => {
  describe('calculateRoundScore', () => {
    test('correct bid returns 10 + 2 * tricks', () => {
      expect(calculateRoundScore(3, 3)).toBe(16); // 10 + (2 * 3)
      expect(calculateRoundScore(0, 0)).toBe(10); // 10 + (2 * 0)
      expect(calculateRoundScore(5, 5)).toBe(20); // 10 + (2 * 5)
    });

    test('incorrect bid returns -2 * difference', () => {
      expect(calculateRoundScore(3, 1)).toBe(-4); // -2 * |3 - 1|
      expect(calculateRoundScore(1, 3)).toBe(-4); // -2 * |1 - 3|
      expect(calculateRoundScore(5, 2)).toBe(-6); // -2 * |5 - 2|
    });
  });

  describe('calculateRunningTotal', () => {
    test('adds round score to previous total', () => {
      expect(calculateRunningTotal(10, 5)).toBe(15);
      expect(calculateRunningTotal(0, -4)).toBe(-4);
      expect(calculateRunningTotal(-5, 10)).toBe(5);
    });
  });

  describe('calculateTotalRounds', () => {
    test('returns correct total rounds', () => {
      expect(calculateTotalRounds(5)).toBe(9); // (5 * 2) - 1
      expect(calculateTotalRounds(8)).toBe(15); // (8 * 2) - 1
      expect(calculateTotalRounds(10)).toBe(19); // (10 * 2) - 1
    });
  });

  describe('calculateCardsForRound', () => {
    test('ascending phase returns round number', () => {
      expect(calculateCardsForRound(1, 5)).toBe(1);
      expect(calculateCardsForRound(3, 5)).toBe(3);
      expect(calculateCardsForRound(5, 5)).toBe(5);
    });

    test('descending phase returns correct count', () => {
      expect(calculateCardsForRound(6, 5)).toBe(4); // 5 - (6 - 5)
      expect(calculateCardsForRound(7, 5)).toBe(3); // 5 - (7 - 5)
      expect(calculateCardsForRound(9, 5)).toBe(1); // 5 - (9 - 5)
    });
  });
});

export {};