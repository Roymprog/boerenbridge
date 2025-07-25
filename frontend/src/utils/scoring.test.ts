import {
  calculateRoundScore,
  calculateRunningTotal,
  calculateRoundScores,
  calculateRunningTotals,
  determineWinner,
  getPlayerStandings,
  calculatePlayerStats,
  validateRoundData
} from './scoring';

describe('Scoring Utilities', () => {
  describe('calculateRoundScore', () => {
    test('correct bid scores: 10 + (2 * tricks_won)', () => {
      expect(calculateRoundScore(0, 0)).toBe(10); // 10 + (2 * 0)
      expect(calculateRoundScore(1, 1)).toBe(12); // 10 + (2 * 1)
      expect(calculateRoundScore(3, 3)).toBe(16); // 10 + (2 * 3)
      expect(calculateRoundScore(8, 8)).toBe(26); // 10 + (2 * 8)
    });

    test('incorrect bid scores: -2 * abs(bid - tricks_won)', () => {
      expect(calculateRoundScore(2, 1)).toBe(-2); // -2 * abs(2 - 1)
      expect(calculateRoundScore(1, 3)).toBe(-4); // -2 * abs(1 - 3)
      expect(calculateRoundScore(5, 0)).toBe(-10); // -2 * abs(5 - 0)
      expect(calculateRoundScore(0, 4)).toBe(-8); // -2 * abs(0 - 4)
    });

    test('edge cases', () => {
      // Maximum possible score scenario (if someone bids and gets 13 tricks)
      expect(calculateRoundScore(13, 13)).toBe(36); // 10 + (2 * 13)
      
      // Large difference scenario
      expect(calculateRoundScore(0, 13)).toBe(-26); // -2 * abs(0 - 13)
      expect(calculateRoundScore(13, 0)).toBe(-26); // -2 * abs(13 - 0)
    });
  });

  describe('calculateRunningTotal', () => {
    test('calculates cumulative sum correctly', () => {
      expect(calculateRunningTotal([])).toBe(0);
      expect(calculateRunningTotal([10])).toBe(10);
      expect(calculateRunningTotal([12, -4, 16])).toBe(24);
      expect(calculateRunningTotal([10, -2, -4, 18, -6])).toBe(16);
    });

    test('handles negative totals', () => {
      expect(calculateRunningTotal([-2, -4, -6])).toBe(-12);
      expect(calculateRunningTotal([10, -15, 2])).toBe(-3);
    });
  });

  describe('calculateRoundScores', () => {
    test('calculates scores for all players in a round', () => {
      const bids = { player1: 2, player2: 1, player3: 0 };
      const tricksWon = { player1: 2, player2: 3, player3: 0 };
      
      const result = calculateRoundScores(bids, tricksWon);
      
      expect(result).toEqual({
        player1: 14, // correct bid: 10 + (2 * 2)
        player2: -4, // incorrect: -2 * abs(1 - 3)
        player3: 10  // correct bid: 10 + (2 * 0)
      });
    });

    test('handles missing bids with defaults', () => {
      const bids = { player1: 2 };
      const tricksWon = { player1: 1, player2: 0 };
      
      const result = calculateRoundScores(bids, tricksWon);
      
      expect(result).toEqual({
        player1: -2, // -2 * abs(2 - 1)
        // player2 not included since no bid
      });
    });
  });

  describe('calculateRunningTotals', () => {
    test('calculates running totals for multiple players across rounds', () => {
      const allRoundScores = [
        { player1: 12, player2: 10, player3: -4 }, // Round 1
        { player1: -2, player2: 14, player3: 16 }, // Round 2
        { player1: 16, player2: -6, player3: 10 }  // Round 3
      ];
      const playerIds = ['player1', 'player2', 'player3'];
      
      const result = calculateRunningTotals(allRoundScores, playerIds);
      
      expect(result).toEqual({
        player1: 26, // 12 + (-2) + 16
        player2: 18, // 10 + 14 + (-6)
        player3: 22  // (-4) + 16 + 10
      });
    });

    test('handles players missing from some rounds', () => {
      const allRoundScores: Record<string, number>[] = [
        { player1: 12, player2: 10, player3: 0 },
        { player1: -2, player2: 0, player3: 16 }
      ];
      const playerIds = ['player1', 'player2', 'player3'];
      
      const result = calculateRunningTotals(allRoundScores, playerIds);
      
      expect(result).toEqual({
        player1: 10, // 12 + (-2)
        player2: 10, // 10 + 0
        player3: 16  // 0 + 16
      });
    });
  });

  describe('determineWinner', () => {
    test('returns winner with highest score', () => {
      const scores = { player1: 45, player2: 52, player3: 38 };
      expect(determineWinner(scores)).toBe('player2');
    });

    test('returns null for ties', () => {
      const scores = { player1: 45, player2: 45, player3: 38 };
      expect(determineWinner(scores)).toBe(null);
    });

    test('returns null for empty scores', () => {
      expect(determineWinner({})).toBe(null);
    });

    test('handles single player', () => {
      const scores = { player1: 25 };
      expect(determineWinner(scores)).toBe('player1');
    });

    test('handles negative scores', () => {
      const scores = { player1: -10, player2: -5, player3: -15 };
      expect(determineWinner(scores)).toBe('player2');
    });
  });

  describe('getPlayerStandings', () => {
    test('sorts players by score descending', () => {
      const scores = { player1: 25, player2: 45, player3: 15, player4: 35 };
      const result = getPlayerStandings(scores);
      
      expect(result).toEqual([
        ['player2', 45],
        ['player4', 35],
        ['player1', 25],
        ['player3', 15]
      ]);
    });

    test('maintains order for tied scores', () => {
      const scores = { player1: 25, player2: 25, player3: 30 };
      const result = getPlayerStandings(scores);
      
      expect(result).toEqual([
        ['player3', 30],
        ['player1', 25],
        ['player2', 25]
      ]);
    });

    test('handles empty scores', () => {
      expect(getPlayerStandings({})).toEqual([]);
    });
  });

  describe('calculatePlayerStats', () => {
    test('calculates comprehensive player statistics', () => {
      const playerRounds = [
        { bid: 2, tricksWon: 2, score: 14 }, // correct
        { bid: 1, tricksWon: 3, score: -4 }, // incorrect
        { bid: 0, tricksWon: 0, score: 10 }, // correct
        { bid: 3, tricksWon: 1, score: -4 }  // incorrect
      ];
      
      const result = calculatePlayerStats(playerRounds);
      
      expect(result).toEqual({
        totalRounds: 4,
        correctBids: 2,
        accuracy: 50,
        totalScore: 16,
        averageScore: 4,
        bestRound: 14,
        worstRound: -4
      });
    });

    test('handles empty rounds', () => {
      const result = calculatePlayerStats([]);
      
      expect(result).toEqual({
        totalRounds: 0,
        correctBids: 0,
        accuracy: 0,
        totalScore: 0,
        averageScore: 0,
        bestRound: null,
        worstRound: null
      });
    });

    test('handles single round', () => {
      const playerRounds = [
        { bid: 3, tricksWon: 3, score: 16 }
      ];
      
      const result = calculatePlayerStats(playerRounds);
      
      expect(result).toEqual({
        totalRounds: 1,
        correctBids: 1,
        accuracy: 100,
        totalScore: 16,
        averageScore: 16,
        bestRound: 16,
        worstRound: 16
      });
    });
  });

  describe('validateRoundData', () => {
    test('validates correct round data', () => {
      const bids = { player1: 2, player2: 1, player3: 0 };
      const tricksWon = { player1: 1, player2: 1, player3: 1 };
      
      const result = validateRoundData(bids, tricksWon, 3);
      
      expect(result).toEqual({ isValid: true });
    });

    test('detects missing tricks for players with bids', () => {
      const bids = { player1: 2, player2: 1 };
      const tricksWon = { player1: 1 };
      
      const result = validateRoundData(bids, tricksWon, 2);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('All players must have both bids and tricks recorded');
    });

    test('detects incorrect trick total', () => {
      const bids = { player1: 2, player2: 1 };
      const tricksWon = { player1: 2, player2: 2 };
      
      const result = validateRoundData(bids, tricksWon, 3);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Total tricks (4) must equal cards in round (3)');
    });

    test('detects negative values', () => {
      const bids = { player1: -1, player2: 1 };
      const tricksWon = { player1: 0, player2: 2 };
      
      const result = validateRoundData(bids, tricksWon, 2);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Bids and tricks must be non-negative numbers');
    });

    test('handles zero bids and tricks', () => {
      const bids = { player1: 0, player2: 0 };
      const tricksWon = { player1: 0, player2: 0 };
      
      const result = validateRoundData(bids, tricksWon, 0);
      
      expect(result).toEqual({ isValid: true });
    });
  });

  describe('integration scenarios', () => {
    test('complete game scenario with multiple rounds', () => {
      // Simulate a 3-round game with 3 players
      const playerIds = ['alice', 'bob', 'charlie'];
      
      // Round 1: 1 card
      const round1Bids = { alice: 1, bob: 0, charlie: 0 };
      const round1Tricks = { alice: 0, bob: 1, charlie: 0 };
      const round1Scores = calculateRoundScores(round1Bids, round1Tricks);
      
      // Round 2: 2 cards  
      const round2Bids = { alice: 1, bob: 1, charlie: 0 };
      const round2Tricks = { alice: 1, bob: 0, charlie: 1 };
      const round2Scores = calculateRoundScores(round2Bids, round2Tricks);
      
      // Round 3: 1 card
      const round3Bids = { alice: 0, bob: 1, charlie: 0 };
      const round3Tricks = { alice: 0, bob: 0, charlie: 1 };
      const round3Scores = calculateRoundScores(round3Bids, round3Tricks);
      
      // Calculate final standings
      const allRoundScores = [round1Scores, round2Scores, round3Scores];
      const finalTotals = calculateRunningTotals(allRoundScores, playerIds);
      const standings = getPlayerStandings(finalTotals);
      const winner = determineWinner(finalTotals);
      
      // Verify expected results
      expect(round1Scores).toEqual({
        alice: -2,  // bid 1, got 0: -2 * abs(1-0) = -2
        bob: -2,    // bid 0, got 1: -2 * abs(0-1) = -2  
        charlie: 10 // bid 0, got 0: 10 + (2*0) = 10
      });
      
      expect(finalTotals).toEqual({
        alice: 20,  // -2 + 12 + 10
        bob: -6,    // -2 + (-2) + (-2)
        charlie: 6  // 10 + (-2) + (-2)
      });
      
      expect(standings[0]).toEqual(['alice', 20]);
      expect(winner).toBe('alice');
    });
  });
});
