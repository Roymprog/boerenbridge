// Re-export all contexts for cleaner imports
export { GameProvider, useGame } from './GameContext';
export type { GameState, GameContextPlayer as Player, RoundData, GamePhase, GameAction } from './GameContext';

// Error handling contexts
export { ErrorProvider, useError } from './ErrorContext';
export type { ErrorNotification } from './ErrorContext';

// Loading contexts
export { LoadingProvider, useLoading } from './LoadingContext';

// Confirmation contexts
export { ConfirmationProvider, useConfirmation } from './ConfirmationContext';
export type { ConfirmationOptions } from './ConfirmationContext';

// This export ensures the file is treated as a module
export {};
