import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { useGame } from '../contexts';
import { useCurrentRound, useGameProgress, useGameScores } from '../hooks';
import { submitRound, createGame } from '../services/api';
import BiddingPhase from './BiddingPhase';
import TricksInput from './TricksInput';
import Scoreboard from './Scoreboard';

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, nextRound, completeGame, resetGame } = useGame();
  const { round } = useCurrentRound();
  const { isGameComplete, progress } = useGameProgress();
  const { winner } = useGameScores();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEndGameDialog, setShowEndGameDialog] = useState(false);
  const [gameId, setGameId] = useState<string | null>(state.gameId);
  const [submittingRound, setSubmittingRound] = useState(false);

  // Initialize game in backend when component mounts
  useEffect(() => {
    const initializeBackendGame = async () => {
      if (!gameId && state.players.length > 0 && state.isGameActive) {
        try {
          setLoading(true);
          const playerNames = state.players.map(p => p.name);
          const gameData = await createGame(playerNames, state.maxCards);
          setGameId(gameData.id);
          setError(null);
        } catch (err) {
          console.error('Failed to create game in backend:', err);
          setError('Failed to initialize game. You can continue playing, but data won\'t be saved.');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeBackendGame();
  }, [gameId, state.players, state.maxCards, state.isGameActive]);

  // Check for game completion
  useEffect(() => {
    if (isGameComplete && !showEndGameDialog) {
      setShowEndGameDialog(true);
    }
  }, [isGameComplete, showEndGameDialog]);

  // Handle round completion and data persistence
  const handleRoundComplete = async () => {
    if (!round || !round.isComplete) return;

    setSubmittingRound(true);
    setError(null);

    try {
      // Submit round data to backend if we have a gameId
      if (gameId) {
        const roundData = {
          round_number: round.roundNumber,
          cards_count: round.cardsCount,
          dealer_position: round.dealerPosition,
          player_data: state.players.map(player => ({
            player_name: player.name,
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
      setError('Failed to save round data. You can continue playing, but this round won\'t be saved.');
      
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
    resetGame();
    setGameId(null);
    setShowEndGameDialog(false);
    navigate('/new-game');
  };

  const handleMainMenu = () => {
    resetGame();
    setGameId(null);
    setShowEndGameDialog(false);
    navigate('/');
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

      {/* Error display */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
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

      {/* End Game Dialog */}
      <Dialog
        open={showEndGameDialog}
        onClose={() => {}}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <TrophyIcon sx={{ fontSize: 48, color: 'gold', mb: 1 }} />
          <Typography variant="h4" component="div">
            Spel Voltooid!
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {winner && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                🎉 Winnaar: {winner.name} 🎉
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Eindscore: {state.rounds[state.rounds.length - 1]?.runningTotals[winner.id] || 0} punten
              </Typography>
            </Box>
          )}
          
          <Scoreboard 
            showOnlyCompleted={true}
            highlightWinner={true}
            readOnly={true}
            maxHeight="400px"
          />
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
          <Button
            variant="outlined"
            onClick={handleMainMenu}
            startIcon={<HomeIcon />}
            size="large"
          >
            Hoofdmenu
          </Button>
          <Button
            variant="contained"
            onClick={handleNewGame}
            startIcon={<PlayIcon />}
            size="large"
          >
            Nieuw Spel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GameScreen;