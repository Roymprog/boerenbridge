import { useGame } from '../contexts';
import { useMemo } from 'react';

// Custom hooks for common game state operations

/**
 * Hook for getting current round information
 */
export const useCurrentRound = () => {
  const { state, getCurrentRound, getCurrentCards } = useGame();
  
  return useMemo(() => {
    const currentRound = getCurrentRound();
    return {
      round: currentRound,
      roundNumber: state.currentRound,
      cardsCount: getCurrentCards(),
      isFirstRound: state.currentRound === 1,
      isLastRound: state.currentRound === state.totalRounds,
      roundsRemaining: state.totalRounds - state.currentRound,
    };
  }, [state.currentRound, state.totalRounds, getCurrentRound, getCurrentCards]);
};

/**
 * Hook for getting dealer information
 */
export const useDealer = () => {
  const { state, getDealerPlayer, getPlayerInPosition } = useGame();
  
  return useMemo(() => {
    const dealer = getDealerPlayer();
    return {
      dealer,
      dealerPosition: state.dealerPosition,
      dealerName: dealer?.name || '',
      isDealer: (playerId: number) => dealer?.id === playerId,
    };
  }, [state.dealerPosition, getDealerPlayer]);
};

/**
 * Hook for getting player order and bidding information
 */
export const usePlayerOrder = () => {
  const { getPlayerOrder, getBiddingOrder, isLastBidder } = useGame();
  
  return useMemo(() => {
    const playerOrder = getPlayerOrder();
    const biddingOrder = getBiddingOrder();
    
    return {
      playerOrder,
      biddingOrder,
      isLastBidder,
      getBiddingPosition: (playerId: number) => {
        return biddingOrder.findIndex(p => p.id === playerId);
      },
    };
  }, [getPlayerOrder, getBiddingOrder, isLastBidder]);
};

/**
 * Hook for game phase management
 */
export const useGamePhase = () => {
  const { state, setPhase, canProceedFromBidding, canProceedFromTricks } = useGame();
  
  return useMemo(() => ({
    currentPhase: state.currentPhase,
    isSetup: state.currentPhase === 'setup',
    isBidding: state.currentPhase === 'bidding',
    isTricks: state.currentPhase === 'tricks',
    isRoundComplete: state.currentPhase === 'roundComplete',
    isGameComplete: state.currentPhase === 'gameComplete',
    canProceedFromBidding: canProceedFromBidding(),
    canProceedFromTricks: canProceedFromTricks(),
    setPhase,
  }), [state.currentPhase, canProceedFromBidding, canProceedFromTricks, setPhase]);
};

/**
 * Hook for game progress and navigation
 */
export const useGameProgress = () => {
  const { state, nextRound, completeGame, resetGame } = useGame();
  
  return useMemo(() => {
    const progressPercentage = (state.currentRound / state.totalRounds) * 100;
    
    return {
      currentRound: state.currentRound,
      totalRounds: state.totalRounds,
      progress: progressPercentage,
      progressPercentage,
      isActive: state.isGameActive,
      isGameComplete: state.currentPhase === 'gameComplete',
      canAdvance: state.currentRound < state.totalRounds,
      nextRound,
      completeGame,
      resetGame,
    };
  }, [
    state.currentRound, 
    state.totalRounds, 
    state.isGameActive,
    state.currentPhase,
    nextRound, 
    completeGame, 
    resetGame
  ]);
};

/**
 * Hook for score calculations and winner determination
 */
export const useGameScores = () => {
  const { state, getWinner } = useGame();
  
  return useMemo(() => {
    const lastRound = state.rounds[state.rounds.length - 1];
    const currentScores = lastRound?.runningTotals || {};
    const winner = getWinner();
    
    // Calculate current standings
    const standings = state.players
      .map(player => ({
        player,
        score: currentScores[player.id] || 0,
        rank: 0, // Will be calculated below
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    
    return {
      currentScores,
      standings,
      winner,
      leader: standings[0]?.player || null,
      isGameDecided: state.currentPhase === 'gameComplete',
    };
  }, [state.players, state.rounds, state.currentPhase, getWinner]);
};

/**
 * Hook for validating game actions
 */
export const useGameValidation = () => {
  const { validateBids, validateTricks, state } = useGame();
  
  const validateCurrentBids = (bids: Record<string, number>) => {
    return validateBids(bids);
  };
  
  const validateCurrentTricks = (tricksWon: Record<string, number>) => {
    return validateTricks(tricksWon);
  };
  
  const checkAllPlayersHaveBid = (bids: Record<string, number>) => {
    return state.players.every(player => bids[player.id] !== undefined);
  };
  
  const checkAllPlayersHaveTricks = (tricksWon: Record<string, number>) => {
    return state.players.every(player => tricksWon[player.id] !== undefined);
  };
  
  return {
    validateCurrentBids,
    validateCurrentTricks,
    checkAllPlayersHaveBid,
    checkAllPlayersHaveTricks,
  };
};

/**
 * Hook for round history and statistics
 */
export const useRoundHistory = () => {
  const { state } = useGame();
  
  return useMemo(() => {
    const completedRounds = state.rounds.filter(round => round.isComplete);
    
    // Calculate player statistics
    const playerStats = state.players.map(player => {
      const correctBids = completedRounds.filter(round => 
        round.bids[player.id] === round.tricksWon[player.id]
      ).length;
      
      const totalRounds = completedRounds.length;
      const accuracy = totalRounds > 0 ? (correctBids / totalRounds) * 100 : 0;
      
      const currentScore = completedRounds.length > 0 
        ? completedRounds[completedRounds.length - 1].runningTotals[player.id] || 0
        : 0;
      
      return {
        player,
        correctBids,
        totalRounds,
        accuracy,
        currentScore,
      };
    });
    
    return {
      completedRounds,
      roundsPlayed: completedRounds.length,
      playerStats,
      allRounds: state.rounds,
    };
  }, [state.rounds, state.players]);
};
