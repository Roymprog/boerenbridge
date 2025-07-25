import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { useGame } from '../contexts';
import {
  useCurrentRound,
  useDealer,
  usePlayerOrder,
  useGamePhase,
  useGameProgress,
  useGameValidation,
} from '../hooks';
import { BiddingPhase, TricksInput } from './index';

const GameStateTester: React.FC = () => {
  const { state, initializeGame, submitBids, submitTricks, nextRound, resetGame } = useGame();
  const currentRound = useCurrentRound();
  const dealer = useDealer();
  const playerOrder = usePlayerOrder();
  const gamePhase = useGamePhase();
  const gameProgress = useGameProgress();
  const validation = useGameValidation();

  const [testPlayers, setTestPlayers] = useState(['Alice', 'Bob', 'Charlie', 'David']);
  const [testMaxCards, setTestMaxCards] = useState(8);
  const [bids, setBids] = useState<Record<string, number>>({});
  const [tricks, setTricks] = useState<Record<string, number>>({});

  const handleInitGame = () => {
    initializeGame(testPlayers, testMaxCards);
    setBids({});
    setTricks({});
  };

  const handleSubmitBids = () => {
    const bidValidation = validation.validateCurrentBids(bids);
    if (bidValidation.isValid) {
      submitBids(bids);
      setTricks({});
    } else {
      alert(`Invalid bids: ${bidValidation.error}`);
    }
  };

  const handleSubmitTricks = () => {
    const tricksValidation = validation.validateCurrentTricks(tricks);
    if (tricksValidation.isValid) {
      submitTricks(tricks);
      setBids({});
      setTricks({});
    } else {
      alert(`Invalid tricks: ${tricksValidation.error}`);
    }
  };

  const handleNextRound = () => {
    nextRound();
    setBids({});
    setTricks({});
  };

  const updateBid = (playerId: string, bid: string) => {
    const bidValue = parseInt(bid) || 0;
    setBids(prev => ({ ...prev, [playerId]: bidValue }));
  };

  const updateTricks = (playerId: string, tricksWon: string) => {
    const tricksValue = parseInt(tricksWon) || 0;
    setTricks(prev => ({ ...prev, [playerId]: tricksValue }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        🧪 Game State Management Tester
      </Typography>

      {!state.isGameActive && state.currentPhase === 'setup' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Initialize Game
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <TextField
              label="Players (comma separated)"
              value={testPlayers.join(', ')}
              onChange={(e) => setTestPlayers(e.target.value.split(',').map(p => p.trim()))}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max Cards"
              type="number"
              value={testMaxCards}
              onChange={(e) => setTestMaxCards(parseInt(e.target.value) || 8)}
              size="small"
              sx={{ width: 100 }}
            />
            <Button variant="contained" onClick={handleInitGame}>
              Start Game
            </Button>
          </Box>
        </Box>
      )}

      {state.isGameActive && (
        <>
          {/* Game Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Game Status
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label={`Round ${currentRound.roundNumber}/${gameProgress.totalRounds}`} color="primary" />
              <Chip label={`${currentRound.cardsCount} cards`} color="secondary" />
              <Chip label={gamePhase.currentPhase} color="warning" />
              <Chip label={`Dealer: ${dealer.dealerName}`} variant="outlined" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Progress: {gameProgress.progressPercentage.toFixed(1)}%
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Bidding Phase */}
          {gamePhase.isBidding && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                🎯 Bidding Phase - {currentRound.cardsCount} cards this round
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {playerOrder.biddingOrder.map((player) => (
                  <Box key={player.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      {player.name}
                      {playerOrder.isLastBidder(player.id) && ' (Last)'}:
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={bids[player.id] || ''}
                      onChange={(e) => updateBid(player.id, e.target.value)}
                      sx={{ width: 60 }}
                      inputProps={{ min: 0, max: currentRound.cardsCount }}
                    />
                  </Box>
                ))}
              </Box>
              <Button
                variant="contained"
                onClick={handleSubmitBids}
                disabled={!validation.checkAllPlayersHaveBid(bids)}
              >
                Submit Bids
              </Button>
              {Object.keys(bids).length > 0 && (
                <Typography variant="caption" sx={{ ml: 2 }}>
                  Total bids: {Object.values(bids).reduce((sum, bid) => sum + bid, 0)}
                </Typography>
              )}
            </Box>
          )}

          {/* BiddingPhase Component Test */}
          {gamePhase.isBidding && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                🎯 BiddingPhase Component Test
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                This is the actual BiddingPhase component that will be used in the game:
              </Alert>
              <BiddingPhase />
            </Box>
          )}

          {/* Tricks Phase */}
          {gamePhase.isTricks && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                🏆 Tricks Phase - Enter tricks won
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {state.players.map((player) => (
                  <Box key={player.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      {player.name}
                      (bid: {currentRound.round?.bids[player.id] || 0}):
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={tricks[player.id] || ''}
                      onChange={(e) => updateTricks(player.id, e.target.value)}
                      sx={{ width: 60 }}
                      inputProps={{ min: 0, max: currentRound.cardsCount }}
                    />
                  </Box>
                ))}
              </Box>
              <Button
                variant="contained"
                onClick={handleSubmitTricks}
                disabled={!validation.checkAllPlayersHaveTricks(tricks)}
              >
                Submit Tricks
              </Button>
              {Object.keys(tricks).length > 0 && (
                <Typography variant="caption" sx={{ ml: 2 }}>
                  Total tricks: {Object.values(tricks).reduce((sum, t) => sum + t, 0)} / {currentRound.cardsCount}
                </Typography>
              )}
            </Box>
          )}

          {/* TricksInput Component Test */}
          {gamePhase.isTricks && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                🏆 TricksInput Component Test
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                This is the actual TricksInput component that will be used in the game:
              </Alert>
              <TricksInput />
            </Box>
          )}

          {/* Round Complete */}
          {gamePhase.isRoundComplete && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Round {currentRound.roundNumber} completed!
              </Alert>
              {gameProgress.canAdvance ? (
                <Button variant="contained" onClick={handleNextRound}>
                  Next Round
                </Button>
              ) : (
                <Alert severity="info">
                  Game Complete! Final scores available.
                </Alert>
              )}
            </Box>
          )}

          {/* Game Complete */}
          {gamePhase.isGameComplete && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                🎉 Game Complete!
              </Alert>
              <Button variant="outlined" onClick={resetGame}>
                Reset Game
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Current Scores */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Current Scores
            </Typography>
            <List dense>
              {state.players.map((player) => {
                const lastRound = state.rounds[state.rounds.length - 1];
                const score = lastRound?.runningTotals[player.id] || 0;
                return (
                  <ListItem key={player.id} sx={{ py: 0 }}>
                    <ListItemText
                      primary={player.name}
                      secondary={`Score: ${score}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default GameStateTester;
