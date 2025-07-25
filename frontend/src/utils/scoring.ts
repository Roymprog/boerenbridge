/**
 * Scoring utilities for Boerenbridge game
 */

/**
 * Calculate score for a round based on bid and tricks won
 * @param bid - Player's bid for the round
 * @param tricksWon - Actual tricks won by the player
 * @returns Score for the round
 */
export const calculateRoundScore = (bid: number, tricksWon: number): number => {
  if (bid === tricksWon) {
    // Correct bid: 10 points + (2 * tricks_won)
    return 10 + (2 * tricksWon);
  } else {
    // Incorrect bid: -2 * abs(bid - tricks_won)
    return -2 * Math.abs(bid - tricksWon);
  }
};

/**
 * Calculate running total for a player
 * @param previousTotal - Previous running total
 * @param roundScore - Score for current round
 * @returns New running total
 */
export const calculateRunningTotal = (previousTotal: number, roundScore: number): number => {
  return previousTotal + roundScore;
};

/**
 * Calculate total rounds for a game
 * @param maxCards - Maximum cards in peak round
 * @returns Total number of rounds
 */
export const calculateTotalRounds = (maxCards: number): number => {
  return (maxCards * 2) - 1;
};

/**
 * Calculate cards for a specific round
 * @param roundNumber - Round number (1-based)
 * @param maxCards - Maximum cards in peak round
 * @returns Number of cards for the round
 */
export const calculateCardsForRound = (roundNumber: number, maxCards: number): number => {
  if (roundNumber <= maxCards) {
    return roundNumber;
  } else {
    return maxCards - (roundNumber - maxCards);
  }
};

export {};