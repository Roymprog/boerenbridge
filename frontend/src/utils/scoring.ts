/**
 * Scoring utilities for Boerenbridge (Chinese Whist) game
 */

/**
 * Calculate score for a round based on bid and tricks won
 * 
 * Scoring rules:
 * - Correct bid: 10 points + (2 × tricks_won)
 * - Incorrect bid: -2 × |bid - tricks_won|
 * 
 * @param bid The player's bid for the round
 * @param tricksWon The actual number of tricks the player won
 * @returns The score for this round
 */
export const calculateRoundScore = (bid: number, tricksWon: number): number => {
  if (bid === tricksWon) {
    // Correct bid: 10 + (2 * tricks_won)
    return 10 + (2 * tricksWon);
  } else {
    // Incorrect bid: -2 * abs(bid - tricks_won)
    return -2 * Math.abs(bid - tricksWon);
  }
};

/**
 * Calculate running total for a player up to a specific round
 * 
 * @param scores Array of round scores for the player
 * @returns The cumulative total score
 */
export const calculateRunningTotal = (scores: number[]): number => {
  return scores.reduce((total, score) => total + score, 0);
};

/**
 * Calculate scores for all players in a round
 * 
 * @param bids Record of player bids (playerId -> bid)
 * @param tricksWon Record of tricks won (playerId -> tricks)
 * @returns Record of round scores (playerId -> score)
 */
export const calculateRoundScores = (
  bids: Record<string, number>, 
  tricksWon: Record<string, number>
): Record<string, number> => {
  const scores: Record<string, number> = {};
  
  Object.keys(bids).forEach(playerId => {
    const bid = bids[playerId] || 0;
    const tricks = tricksWon[playerId] || 0;
    scores[playerId] = calculateRoundScore(bid, tricks);
  });
  
  return scores;
};

/**
 * Calculate running totals for all players given their round scores
 * 
 * @param allRoundScores Array of round score records (one per round)
 * @param playerIds Array of player IDs
 * @returns Record of running totals (playerId -> total)
 */
export const calculateRunningTotals = (
  allRoundScores: Record<string, number>[],
  playerIds: string[]
): Record<string, number> => {
  const runningTotals: Record<string, number> = {};
  
  playerIds.forEach(playerId => {
    const playerScores = allRoundScores.map(roundScores => roundScores[playerId] || 0);
    runningTotals[playerId] = calculateRunningTotal(playerScores);
  });
  
  return runningTotals;
};

/**
 * Determine the winner based on final scores
 * 
 * @param finalScores Record of final scores (playerId -> total)
 * @returns The player ID of the winner, or null if tie or no scores
 */
export const determineWinner = (finalScores: Record<string, number>): string | null => {
  const entries = Object.entries(finalScores);
  
  if (entries.length === 0) {
    return null;
  }
  
  // Find the highest score
  const maxScore = Math.max(...entries.map(([, score]) => score));
  const winners = entries.filter(([, score]) => score === maxScore);
  
  // Return the first winner if there's only one, or null if there's a tie
  return winners.length === 1 ? winners[0][0] : null;
};

/**
 * Get player standings sorted by score (highest first)
 * 
 * @param scores Record of player scores (playerId -> score)
 * @returns Array of [playerId, score] tuples sorted by score descending
 */
export const getPlayerStandings = (scores: Record<string, number>): [string, number][] => {
  return Object.entries(scores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
};

/**
 * Calculate statistics for a player across all completed rounds
 * 
 * @param playerRounds Array of round data for the player: { bid, tricksWon, score }
 * @returns Player statistics
 */
export const calculatePlayerStats = (
  playerRounds: Array<{ bid: number; tricksWon: number; score: number }>
) => {
  const totalRounds = playerRounds.length;
  
  if (totalRounds === 0) {
    return {
      totalRounds: 0,
      correctBids: 0,
      accuracy: 0,
      totalScore: 0,
      averageScore: 0,
      bestRound: null,
      worstRound: null
    };
  }
  
  const correctBids = playerRounds.filter(round => round.bid === round.tricksWon).length;
  const accuracy = (correctBids / totalRounds) * 100;
  const totalScore = playerRounds.reduce((sum, round) => sum + round.score, 0);
  const averageScore = totalScore / totalRounds;
  const bestRound = Math.max(...playerRounds.map(round => round.score));
  const worstRound = Math.min(...playerRounds.map(round => round.score));
  
  return {
    totalRounds,
    correctBids,
    accuracy,
    totalScore,
    averageScore,
    bestRound,
    worstRound
  };
};

/**
 * Validate that bids and tricks are valid for scoring
 * 
 * @param bids Record of player bids
 * @param tricksWon Record of tricks won
 * @param expectedTotal Expected total number of tricks (should equal cards in round)
 * @returns Validation result
 */
export const validateRoundData = (
  bids: Record<string, number>,
  tricksWon: Record<string, number>,
  expectedTotal: number
): { isValid: boolean; error?: string } => {
  // Check that all players who bid also have tricks recorded
  const bidPlayerIds = Object.keys(bids);
  const tricksPlayerIds = Object.keys(tricksWon);
  
  if (bidPlayerIds.length !== tricksPlayerIds.length) {
    return { 
      isValid: false, 
      error: 'All players must have both bids and tricks recorded' 
    };
  }
  
  for (const playerId of bidPlayerIds) {
    if (!(playerId in tricksWon)) {
      return { 
        isValid: false, 
        error: `Player ${playerId} has bid but no tricks recorded` 
      };
    }
  }
  
  // Check that total tricks equals expected total
  const totalTricks = Object.values(tricksWon).reduce((sum, tricks) => sum + tricks, 0);
  if (totalTricks !== expectedTotal) {
    return { 
      isValid: false, 
      error: `Total tricks (${totalTricks}) must equal cards in round (${expectedTotal})` 
    };
  }
  
  // Check that all values are non-negative
  const allBids = Object.values(bids);
  const allTricks = Object.values(tricksWon);
  
  if (allBids.some(bid => bid < 0) || allTricks.some(tricks => tricks < 0)) {
    return { 
      isValid: false, 
      error: 'Bids and tricks must be non-negative numbers' 
    };
  }
  
  return { isValid: true };
};
