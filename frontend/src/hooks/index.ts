// Re-export all hooks for cleaner imports
export {
  useCurrentRound,
  useDealer,
  usePlayerOrder,
  useGamePhase,
  useGameProgress,
  useGameScores,
  useGameValidation,
  useRoundHistory,
} from './useGameHooks';

// This export ensures the file is treated as a module
export {};
