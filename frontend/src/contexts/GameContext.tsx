import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {GameSetupPlayer} from '../components/GameSetup';

// Types for game state
export interface GameContextPlayer {
  id: number;
  name: string;
  position: number;
}

export interface RoundData {
  roundNumber: number;
  cardsCount: number;
  dealerPosition: number;
  bids: Record<string, number>; // playerId -> bid
  tricksWon: Record<string, number>; // playerId -> tricks won
  scores: Record<string, number>; // playerId -> round score
  runningTotals: Record<string, number>; // playerId -> running total
  isComplete: boolean;
}

export type GamePhase = 'setup' | 'bidding' | 'tricks' | 'roundComplete' | 'gameComplete';

export interface GameState {
  gameId: string | null;
  players: GameContextPlayer[];
  maxCards: number;
  currentRound: number;
  currentPhase: GamePhase;
  dealerPosition: number;
  rounds: RoundData[];
  isGameActive: boolean;
  totalRounds: number;
}

// Action types
export type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { players: GameContextPlayer[]; maxCards: number; gameId?: string } }
  | { type: 'LOAD_EXISTING_GAME'; payload: { gameId: string; players: GameContextPlayer[]; maxCards: number; rounds: RoundData[]; currentRound: number; currentPhase: GamePhase; dealerPosition: number; isGameActive: boolean } }
  | { type: 'START_ROUND'; payload: { roundNumber: number } }
  | { type: 'SET_PHASE'; payload: { phase: GamePhase } }
  | { type: 'SUBMIT_BIDS'; payload: { bids: Record<string, number> } }
  | { type: 'SUBMIT_TRICKS'; payload: { tricksWon: Record<string, number> } }
  | { type: 'COMPLETE_ROUND' }
  | { type: 'NEXT_ROUND' }
  | { type: 'COMPLETE_GAME' }
  | { type: 'RESET_GAME' };

// Initial state
const initialState: GameState = {
  gameId: null,
  players: [],
  maxCards: 0,
  currentRound: 0,
  currentPhase: 'setup',
  dealerPosition: 0,
  rounds: [],
  isGameActive: false,
  totalRounds: 0,
};

// Utility functions
const calculateTotalRounds = (maxCards: number): number => {
  return (maxCards * 2) - 1;
};

const calculateCardsForRound = (roundNumber: number, maxCards: number): number => {
  if (roundNumber <= maxCards) {
    return roundNumber;
  } else {
    return maxCards - (roundNumber - maxCards);
  }
};

const calculateRoundScore = (bid: number, tricksWon: number): number => {
  if (bid === tricksWon) {
    return 10 + (2 * tricksWon);
  } else {
    return -2 * Math.abs(bid - tricksWon);
  }
};

const getNextDealerPosition = (currentDealer: number, playerCount: number): number => {
  return (currentDealer + 1) % playerCount;
};

// Reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      const { players, maxCards, gameId } = action.payload;
      const totalRounds = calculateTotalRounds(maxCards);
      const cardsCount = calculateCardsForRound(1, maxCards);
      
      // Create the first round immediately
      const firstRound: RoundData = {
        roundNumber: 1,
        cardsCount,
        dealerPosition: 0,
        bids: {},
        tricksWon: {},
        scores: {},
        runningTotals: {},
        isComplete: false,
      };
      
      return {
        ...state,
        gameId: gameId || null,
        players: players.map((player, index) => ({
          ...player,
          position: index
        })),
        maxCards,
        totalRounds,
        currentRound: 1,
        currentPhase: 'bidding',
        dealerPosition: 0,
        rounds: [firstRound],
        isGameActive: true,
      };
    }

    case 'LOAD_EXISTING_GAME': {
      const { gameId, players, maxCards, rounds, currentRound, currentPhase, dealerPosition, isGameActive } = action.payload;
      const totalRounds = calculateTotalRounds(maxCards);

      return {
        ...state,
        gameId,
        players,
        maxCards,
        totalRounds,
        currentRound,
        currentPhase,
        dealerPosition,
        rounds,
        isGameActive,
      };
    }

    case 'START_ROUND': {
      const { roundNumber } = action.payload;
      const cardsCount = calculateCardsForRound(roundNumber, state.maxCards);
      
      const newRound: RoundData = {
        roundNumber,
        cardsCount,
        dealerPosition: state.dealerPosition,
        bids: {},
        tricksWon: {},
        scores: {},
        runningTotals: {},
        isComplete: false,
      };

      return {
        ...state,
        currentRound: roundNumber,
        currentPhase: 'bidding',
        rounds: [...state.rounds, newRound],
      };
    }

    case 'SET_PHASE': {
      return {
        ...state,
        currentPhase: action.payload.phase,
      };
    }

    case 'SUBMIT_BIDS': {
      const { bids } = action.payload;
      const updatedRounds = state.rounds.map((round, index) => {
        if (index === state.rounds.length - 1) {
          return {
            ...round,
            bids,
          };
        }
        return round;
      });

      return {
        ...state,
        rounds: updatedRounds,
        currentPhase: 'tricks',
      };
    }

    case 'SUBMIT_TRICKS': {
      const { tricksWon } = action.payload;
      const currentRoundIndex = state.rounds.length - 1;
      const currentRound = state.rounds[currentRoundIndex];
      
      // Calculate scores for this round
      const scores: Record<string, number> = {};
      const runningTotals: Record<string, number> = {};
      
      state.players.forEach(player => {
        const bid = currentRound.bids[player.id] || 0;
        const tricks = tricksWon[player.id] || 0;
        const roundScore = calculateRoundScore(bid, tricks);
        
        scores[player.id] = roundScore;
        
        // Calculate running total
        const previousTotal = currentRoundIndex > 0 
          ? state.rounds[currentRoundIndex - 1].runningTotals[player.id] || 0 
          : 0;
        runningTotals[player.id] = previousTotal + roundScore;
      });

      const updatedRounds = state.rounds.map((round, index) => {
        if (index === currentRoundIndex) {
          return {
            ...round,
            tricksWon,
            scores,
            runningTotals,
            isComplete: true,
          };
        }
        return round;
      });

      return {
        ...state,
        rounds: updatedRounds,
        currentPhase: 'roundComplete',
      };
    }

    case 'COMPLETE_ROUND': {
      return {
        ...state,
        currentPhase: 'roundComplete',
      };
    }

    case 'NEXT_ROUND': {
      const nextRoundNumber = state.currentRound + 1;
      const nextDealerPosition = getNextDealerPosition(state.dealerPosition, state.players.length);
      
      if (nextRoundNumber > state.totalRounds) {
        return {
          ...state,
          currentPhase: 'gameComplete',
          isGameActive: false,
        };
      }

      const cardsCount = calculateCardsForRound(nextRoundNumber, state.maxCards);
      
      const newRound: RoundData = {
        roundNumber: nextRoundNumber,
        cardsCount,
        dealerPosition: nextDealerPosition,
        bids: {},
        tricksWon: {},
        scores: {},
        runningTotals: {},
        isComplete: false,
      };

      return {
        ...state,
        currentRound: nextRoundNumber,
        currentPhase: 'bidding',
        dealerPosition: nextDealerPosition,
        rounds: [...state.rounds, newRound],
      };
    }

    case 'COMPLETE_GAME': {
      return {
        ...state,
        currentPhase: 'gameComplete',
        isGameActive: false,
      };
    }

    case 'RESET_GAME': {
      return initialState;
    }

    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Helper functions
  initializeGame: (players: GameSetupPlayer[], maxCards: number, gameId?: string) => void;
  loadExistingGame: (gameId: string, players: GameContextPlayer[], maxCards: number, rounds: RoundData[], currentRound: number, currentPhase: GamePhase, dealerPosition: number, isGameActive: boolean) => void;
  startRound: (roundNumber: number) => void;
  setPhase: (phase: GamePhase) => void;
  submitBids: (bids: Record<string, number>) => void;
  submitTricks: (tricksWon: Record<string, number>) => void;
  nextRound: () => void;
  completeGame: () => void;
  resetGame: () => void;
  // Computed values
  getCurrentRound: () => RoundData | null;
  getPlayerInPosition: (position: number) => GameContextPlayer | null;
  getDealerPlayer: () => GameContextPlayer | null;
  getCurrentCards: () => number;
  getPlayerOrder: () => GameContextPlayer[];
  getBiddingOrder: () => GameContextPlayer[];
  getWinner: () => GameContextPlayer | null;
  isLastBidder: (playerId: number) => boolean;
  canProceedFromBidding: () => boolean;
  canProceedFromTricks: () => boolean;
  validateBids: (bids: Record<string, number>) => { isValid: boolean; error?: string };
  validateTricks: (tricksWon: Record<string, number>) => { isValid: boolean; error?: string };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Helper functions
  const initializeGame = (gameSetupPlayers: GameSetupPlayer[], maxCards: number, gameId?: string) => {
    const players: GameContextPlayer[] = gameSetupPlayers.map((player, index) => ({
      id: player.id,
      name: player.name,
      position: index,
    }));

    dispatch({
      type: 'INITIALIZE_GAME',
      payload: { players, maxCards, gameId },
    });
  };

  const loadExistingGame = (gameId: string, players: GameContextPlayer[], maxCards: number, rounds: RoundData[], currentRound: number, currentPhase: GamePhase, dealerPosition: number, isGameActive: boolean) => {
    dispatch({
      type: 'LOAD_EXISTING_GAME',
      payload: { gameId, players, maxCards, rounds, currentRound, currentPhase, dealerPosition, isGameActive },
    });
  };

  const startRound = (roundNumber: number) => {
    dispatch({ type: 'START_ROUND', payload: { roundNumber } });
  };

  const setPhase = (phase: GamePhase) => {
    dispatch({ type: 'SET_PHASE', payload: { phase } });
  };

  const submitBids = (bids: Record<string, number>) => {
    dispatch({ type: 'SUBMIT_BIDS', payload: { bids } });
  };

  const submitTricks = (tricksWon: Record<string, number>) => {
    dispatch({ type: 'SUBMIT_TRICKS', payload: { tricksWon } });
  };

  const nextRound = () => {
    dispatch({ type: 'NEXT_ROUND' });
  };

  const completeGame = () => {
    dispatch({ type: 'COMPLETE_GAME' });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  // Computed values
  const getCurrentRound = (): RoundData | null => {
    return state.rounds[state.rounds.length - 1] || null;
  };

  const getPlayerInPosition = (position: number): GameContextPlayer | null => {
    return state.players.find(p => p.position === position) || null;
  };

  const getDealerPlayer = (): GameContextPlayer | null => {
    return getPlayerInPosition(state.dealerPosition);
  };

  const getCurrentCards = (): number => {
    const currentRound = getCurrentRound();
    return currentRound ? currentRound.cardsCount : 0;
  };

  const getPlayerOrder = (): GameContextPlayer[] => {
    return [...state.players].sort((a, b) => a.position - b.position);
  };

  const getBiddingOrder = (): GameContextPlayer[] => {
    const players = getPlayerOrder();
    const dealerIndex = state.dealerPosition;
    
    // Bidding starts with player to the left of dealer
    const startIndex = (dealerIndex + 1) % players.length;
    const orderedPlayers = [
      ...players.slice(startIndex),
      ...players.slice(0, startIndex)
    ];
    
    return orderedPlayers;
  };

  const getWinner = (): GameContextPlayer | null => {
    if (state.currentPhase !== 'gameComplete' || state.rounds.length === 0) {
      return null;
    }

    const lastRound = state.rounds[state.rounds.length - 1];
    let highestScore = -Infinity;
    let winnerId = 0;

    Object.entries(lastRound.runningTotals).forEach(([playerId, score]) => {
      if (score > highestScore) {
        highestScore = score;
        winnerId = parseInt(playerId);
      }
    });

    return state.players.find(p => p.id === winnerId) || null;
  };

  const isLastBidder = (playerId: number): boolean => {
    const biddingOrder = getBiddingOrder();
    return biddingOrder[biddingOrder.length - 1]?.id === playerId;
  };

  const canProceedFromBidding = (): boolean => {
    const currentRound = getCurrentRound();
    if (!currentRound) return false;

    // Check if all players have bid
    const allBidsSubmitted = state.players.every(player => 
      currentRound.bids[player.id] !== undefined
    );

    return allBidsSubmitted;
  };

  const canProceedFromTricks = (): boolean => {
    const currentRound = getCurrentRound();
    if (!currentRound) return false;

    // Check if all players have tricks recorded
    const allTricksSubmitted = state.players.every(player => 
      currentRound.tricksWon[player.id] !== undefined
    );

    return allTricksSubmitted;
  };

  const validateBids = (bids: Record<string, number>): { isValid: boolean; error?: string } => {
    const currentRound = getCurrentRound();
    if (!currentRound) {
      return { isValid: false, error: 'No active round' };
    }

    const totalBids = Object.values(bids).reduce((sum, bid) => sum + bid, 0);
    const cardsInRound = currentRound.cardsCount;

    // Last bidder cannot make total bids equal to cards in round
    if (totalBids === cardsInRound) {
      return { 
        isValid: false, 
        error: `De laatste bieder mag niet bieden zodat het totaal gelijk is aan ${cardsInRound}` 
      };
    }

    return { isValid: true };
  };

  const validateTricks = (tricksWon: Record<string, number>): { isValid: boolean; error?: string } => {
    const currentRound = getCurrentRound();
    if (!currentRound) {
      return { isValid: false, error: 'No active round' };
    }

    const totalTricks = Object.values(tricksWon).reduce((sum, tricks) => sum + tricks, 0);
    const cardsInRound = currentRound.cardsCount;

    if (totalTricks !== cardsInRound) {
      return { 
        isValid: false, 
        error: `Totaal aantal geslagen slagen moet ${cardsInRound} zijn, maar is ${totalTricks}` 
      };
    }

    return { isValid: true };
  };

  const contextValue: GameContextType = {
    state,
    dispatch,
    initializeGame,
    loadExistingGame,
    startRound,
    setPhase,
    submitBids,
    submitTricks,
    nextRound,
    completeGame,
    resetGame,
    getCurrentRound,
    getPlayerInPosition,
    getDealerPlayer,
    getCurrentCards,
    getPlayerOrder,
    getBiddingOrder,
    getWinner,
    isLastBidder,
    canProceedFromBidding,
    canProceedFromTricks,
    validateBids,
    validateTricks,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
