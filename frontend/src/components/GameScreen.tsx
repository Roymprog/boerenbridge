import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Home as HomeIcon,
  PlayArrow as PlayIcon,
  RestartAlt as RestartIcon,
  EmojiEvents as TrophyIcon,
  NavigateNext as NextIcon,
  Casino as DealerIcon,
} from '@mui/icons-material';
import { useGame, useError, useConfirmation } from '../contexts';
import { useCurrentRound, useGameProgress } from '../hooks';
import { submitRound, createGame, getGameDetails } from '../services/api';
import { GameContextPlayer, RoundData, GamePhase } from '../contexts/GameContext';
import BiddingPhase from './BiddingPhase';
import TricksInput from './TricksInput';
import Scoreboard from './Scoreboard';
import EndGame from './EndGame';

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const { state, loadExistingGame, nextRound, completeGame, resetGame } = useGame();
  const { showError, showSuccess } = useError();
  const { confirm } = useConfirmation();
  const { round } = useCurrentRound();
  const { isGameComplete, progress } = useGameProgress();
  
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState<string | null>(state.gameId || paramGameId || null);
  const [submittingRound, setSubmittingRound] = useState(false);

  // Initialize game in backend or load existing game when component mounts
  useEffect(() => {
    const initializeOrLoadGame = async () => {
      if (paramGameId && !state.isGameActive) {
        // Load existing game from backend
        try {
          setLoading(true);
          const gameData = await getGameDetails(paramGameId);
          
          // Convert backend data to frontend format
          const players: GameContextPlayer[] = gameData.players.map((player: any, index: number) => ({
            id: player.id,
            name: player.name,
            position: index,
          }));

          const rounds: RoundData[] = gameData.rounds.map((round: any) => {
            const bids: Record<string, number> = {};
            const tricksWon: Record<string, number> = {};
            const scores: Record<string, number> = {};
            const runningTotals: Record<string, number> = {};

            round.round_scores.forEach((score: any, _: number) => {
              const playerId = score.player.id;
              bids[playerId] = score.bid;
              tricksWon[playerId] = score.tricks_won;
              scores[playerId] = score.score;
              runningTotals[playerId] = score.running_total;
            });

            return {
              roundNumber: round.round_number,
              cardsCount: round.cards_count,
              dealerPosition: round.dealer_position,
              bids,
              tricksWon,
              scores,
              runningTotals,
              isComplete: true,
            };
          });

          // Determine current game state
          let currentPhase: GamePhase;
          let currentRound: number;
          let dealerPosition: number;
          let isGameActive: boolean;

          if (gameData.status === 'completed') {
            currentPhase = 'gameComplete';
            currentRound = rounds.length;
            dealerPosition = rounds[rounds.length - 1]?.dealerPosition || 0;
            isGameActive = false;
          } else if (gameData.status === 'active') {
            // Determine if we need to continue current round or start next
            const totalRounds = (gameData.max_cards * 2) - 1;
            
            if (rounds.length < totalRounds) {
              // Need to start next round
              currentRound = rounds.length + 1;
              currentPhase = 'bidding';
              dealerPosition = rounds.length > 0 ? (rounds[rounds.length - 1].dealerPosition + 1) % players.length : 0;
              
              // Add next round data
              const nextRoundCards = currentRound <= gameData.max_cards ? currentRound : gameData.max_cards - (currentRound - gameData.max_cards);
              rounds.push({
                roundNumber: currentRound,
                cardsCount: nextRoundCards,
                dealerPosition,
                bids: {},
                tricksWon: {},
                scores: {},
                runningTotals: {},
                isComplete: false,
              });
            } else {
              // Game should be completed
              currentPhase = 'gameComplete';
              currentRound = rounds.length;
              dealerPosition = rounds[rounds.length - 1]?.dealerPosition || 0;
            }
            isGameActive = currentPhase !== 'gameComplete';
          } else {
            // Abandoned game - treat as read-only
            currentPhase = 'gameComplete';
            currentRound = rounds.length;
            dealerPosition = rounds[rounds.length - 1]?.dealerPosition || 0;
            isGameActive = false;
          }

          loadExistingGame(
            paramGameId,
            players,
            gameData.max_cards,
            rounds,
            currentRound,
            currentPhase,
            dealerPosition,
            isGameActive
          );
          
          setGameId(paramGameId);
        } catch (err) {
          console.error('Failed to load existing game:', err);
          showError('Failed to load game. Redirecting to main menu.');
          navigate('/');
        } finally {
          setLoading(false);
        }
      } else if (!gameId && state.players.length > 0 && state.isGameActive) {
        // Create new game in backend
        try {
          setLoading(true);
          const playerNames = state.players.map(p => p.name);
          const gameData = await createGame(playerNames, state.maxCards);
          setGameId(gameData.id);
        } catch (err) {
          console.error('Failed to create game in backend:', err);
          showError('Failed to initialize game. You can continue playing, but data won\'t be saved.');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeOrLoadGame();
  }, [paramGameId, gameId, state.players, state.maxCards, state.isGameActive, showError, navigate, loadExistingGame]);

  // Handle round completion and data persistence
  const handleRoundComplete = async () => {
    if (!round || !round.isComplete) return;

    setSubmittingRound(true);

    try {
      // Submit round data to backend if we have a gameId
      if (gameId) {
        const roundData = {
          round_number: round.roundNumber,
          cards_count: round.cardsCount,
          dealer_position: round.dealerPosition,
          scores: state.players.map(player => ({
            player_id: player.id,
            bid: round.bids[player.id] || 0,
            tricks_won: round.tricksWon[player.id] || 0,
            score: round.scores[player.id] || 0,
            running_total: round.runningTotals[player.id] || 0,
          })),
        };

        await submitRound(gameId, roundData);
      }

      // Progress to next round or complete game
      if (state.currentRound >= state.totalRounds) {
        completeGame();
      } else {
        nextRound();
      }
    } catch (err) {
      console.error('Failed to submit round data:', err);
      showError('Failed to save round data. You can continue playing, but this round won\'t be saved.');
      
      // Still progress the game even if backend submission fails
      if (state.currentRound >= state.totalRounds) {
        completeGame();
      } else {
        nextRound();
      }
    } finally {
      setSubmittingRound(false);
    }
  };

  const handleNextRound = () => {
    handleRoundComplete();
  };

  const handleNewGame = () => {
    confirm({
      title: 'Nieuw spel starten',
      message: 'Weet je zeker dat je een nieuw spel wilt starten?',
      severity: 'warning',
      confirmText: 'Nieuw Spel',
      confirmColor: 'warning',
      onConfirm: () => {
        resetGame();
        setGameId(null);
        navigate('/new-game');
        showSuccess('Nieuw spel gestart');
      }
    });
  };

  const handleMainMenu = () => {
    confirm({
      title: 'Naar hoofdmenu',
      message: 'Weet je zeker dat je naar het hoofdmenu wilt?',
      severity: 'warning',
      confirmText: 'Hoofdmenu',
      confirmColor: 'warning',
      onConfirm: () => {
        resetGame();
        setGameId(null);
        navigate('/');
        showSuccess('Terug naar hoofdmenu');
      }
    });
  };

  const getCurrentPhaseComponent = () => {
    switch (state.currentPhase) {
      case 'bidding':
        return <BiddingPhase />;
      case 'tricks':
        return <TricksInput />;
      case 'roundComplete':
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Ronde {state.currentRound} Voltooid!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {state.currentRound < state.totalRounds 
                  ? `Ronde ${state.currentRound + 1} van ${state.totalRounds} is als volgende.`
                  : 'Dit was de laatste ronde van het spel!'
                }
              </Typography>
              <Button
                variant="contained"
                onClick={handleNextRound}
                startIcon={state.currentRound < state.totalRounds ? <NextIcon /> : <TrophyIcon />}
                disabled={submittingRound}
                size="large"
              >
                {submittingRound ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    Opslaan...
                  </Box>
                ) : state.currentRound < state.totalRounds ? (
                  'Volgende Ronde'
                ) : (
                  'Spel Voltooien'
                )}
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const getCurrentStepIndex = () => {
    switch (state.currentPhase) {
      case 'bidding': return 0;
      case 'tricks': return 1;
      case 'roundComplete': return 2;
      default: return 0;
    }
  };

  if (!state.isGameActive && !isGameComplete) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Geen Actief Spel
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Er is geen actief spel gevonden. Start een nieuw spel om te beginnen.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/new-game')}
            startIcon={<PlayIcon />}
            size="large"
          >
            Nieuw Spel Starten
          </Button>
        </Paper>
      </Container>
    );
  }

  // Show EndGame component when game is complete
  if (isGameComplete) {
    return <EndGame />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1">
              Boerenbridge Spel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Spelers: {state.players.map(p => p.name).join(', ')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleMainMenu}
              startIcon={<HomeIcon />}
              disabled={submittingRound}
            >
              Hoofdmenu
            </Button>
            <Button
              onClick={handleNewGame}
              startIcon={<RestartIcon />}
              disabled={submittingRound}
            >
              Nieuw Spel
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Spel initialiseren...
          </Typography>
        </Box>
      )}

      {/* Game Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Ronde {state.currentRound} van {state.totalRounds}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DealerIcon color="primary" />
              <Typography variant="body2">
                Deler: {state.players[state.dealerPosition]?.name}
              </Typography>
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ mb: 1, height: 8, borderRadius: 4 }}
          />
          
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {round && `${round.cardsCount} kaart${round.cardsCount !== 1 ? 'en' : ''} deze ronde`}
          </Typography>
        </CardContent>
      </Card>

      {/* Round Phase Steps */}
      {round && !isGameComplete && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={getCurrentStepIndex()} alternativeLabel>
              <Step>
                <StepLabel>Voorspellingen</StepLabel>
              </Step>
              <Step>
                <StepLabel>Slagen Tellen</StepLabel>
              </Step>
              <Step>
                <StepLabel>Ronde Voltooid</StepLabel>
              </Step>
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* Main Game Content */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Left Column - Game Phase */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {getCurrentPhaseComponent()}
        </Box>

        {/* Right Column - Scoreboard */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Scoreboard 
            maxHeight="70vh"
            hideCurrentRoundInfo={true}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default GameScreen;