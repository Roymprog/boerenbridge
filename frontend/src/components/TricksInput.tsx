import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Casino as DealerIcon,
} from '@mui/icons-material';
import { useGame } from '../contexts';
import { useCurrentRound, useDealer, useGameValidation } from '../hooks';

const TricksInput: React.FC = () => {
  const { state, submitTricks } = useGame();
  const { round, cardsCount } = useCurrentRound();
  const { dealer, isDealer } = useDealer();
  const validation = useGameValidation();

  const [tricksWon, setTricksWon] = useState<Record<string, number>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset tricks when round changes
  useEffect(() => {
    if (round) {
      const initialTricks: Record<string, number> = {};
      state.players.forEach(player => {
        initialTricks[player.id] = round.tricksWon[player.id] ?? 0;
      });
      setTricksWon(initialTricks);
    }
  }, [round?.roundNumber, state.players, round]);

  // Calculate total tricks entered
  const totalTricks = Object.values(tricksWon).reduce((sum, tricks) => sum + tricks, 0);
  const isValidTotal = totalTricks === cardsCount;

  const handleTricksChange = (playerId: number, value: string) => {
    const tricksValue = Math.max(0, parseInt(value) || 0);
    setTricksWon(prev => ({
      ...prev,
      [playerId]: tricksValue,
    }));
  };

  const handleSubmit = () => {
    const tricksValidation = validation.validateCurrentTricks(tricksWon);
    
    if (!tricksValidation.isValid) {
      setValidationError(tricksValidation.error || 'Validation failed');
      return;
    }

    setValidationError(null);
    submitTricks(tricksWon);
  };

  const canSubmit = validation.checkAllPlayersHaveTricks(tricksWon) && isValidTotal;

  if (!round) {
    return (
      <Alert severity="error">
        Geen actieve ronde gevonden.
      </Alert>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ronde {round.roundNumber} - Slagen Invoeren
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          {cardsCount} {cardsCount === 1 ? 'kaart' : 'kaarten'}
        </Typography>
        
        {/* Dealer Information */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <DealerIcon color="primary" />
          <Typography variant="body1">
            <strong>Deler:</strong> {dealer?.name || 'Onbekend'}
          </Typography>
        </Box>

        {/* Total tricks validation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          {isValidTotal ? (
            <CheckIcon color="success" />
          ) : (
            <WarningIcon color="error" />
          )}
          <Typography 
            variant="body1" 
            color={isValidTotal ? 'success.main' : 'error.main'}
            fontWeight="bold"
          >
            Totaal slagen: {totalTricks} / {cardsCount}
            {!isValidTotal && ` (moet ${cardsCount} zijn)`}
          </Typography>
        </Box>
      </Box>

      {/* Tricks Input Form */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Voer het aantal geslagen slagen in per speler:
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: 2 
        }}>
          {state.players.map((player) => {
            const playerTricks = tricksWon[player.id] ?? 0;
            const playerBid = round.bids[player.id] ?? 0;
            const isDealerPlayer = isDealer(player.id);

            return (
              <Card 
                key={player.id}
                elevation={1}
                sx={{ 
                  border: isDealerPlayer ? '2px solid' : '1px solid',
                  borderColor: isDealerPlayer ? 'primary.main' : 'divider',
                  backgroundColor: isDealerPlayer ? 'primary.50' : 'background.paper'
                }}
              >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {player.name}
                      </Typography>
                      {isDealerPlayer && (
                        <Chip 
                          label="Deler" 
                          size="small" 
                          color="primary" 
                          icon={<DealerIcon />}
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Bod: <strong>{playerBid}</strong>
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Geslagen slagen"
                      type="number"
                      value={playerTricks}
                      onChange={(e) => handleTricksChange(player.id, e.target.value)}
                      inputProps={{
                        min: 0,
                        max: cardsCount,
                        step: 1,
                      }}
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        },
                      }}
                    />
                    
                    {/* Preview score calculation */}
                    {playerTricks !== undefined && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Preview score: {
                            playerBid === playerTricks 
                              ? `+${10 + (2 * playerTricks)}` 
                              : `-${2 * Math.abs(playerBid - playerTricks)}`
                          }
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
            );
          })}
        </Box>
      </Box>

      {/* Validation Error */}
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}

      {/* Total validation warning */}
      {!isValidTotal && totalTricks > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Het totaal aantal geslagen slagen ({totalTricks}) moet gelijk zijn aan het aantal kaarten in deze ronde ({cardsCount}).
        </Alert>
      )}

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!canSubmit}
          startIcon={canSubmit ? <CheckIcon /> : <WarningIcon />}
          sx={{ 
            minWidth: 200,
            py: 1.5,
          }}
        >
          {canSubmit ? 'Bevestig Slagen' : 'Voer alle slagen in'}
        </Button>
      </Box>

      {/* Help text */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Voer het aantal slagen in dat elke speler heeft gewonnen in deze ronde.
          Het totaal moet precies {cardsCount} zijn.
        </Typography>
      </Box>
    </Paper>
  );
};

export default TricksInput;