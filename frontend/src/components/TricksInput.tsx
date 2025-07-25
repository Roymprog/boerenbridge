import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Casino as DealerIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useGame } from '../contexts';
import { useCurrentRound, useDealer, usePlayerOrder, useGamePhase } from '../hooks';

const TricksInput: React.FC = () => {
  const { submitTricks, validateTricks } = useGame();
  const { round, cardsCount } = useCurrentRound();
  const { dealer, isDealer } = useDealer();
  const { biddingOrder } = usePlayerOrder();
  const { setPhase } = useGamePhase();

  const [tricks, setTricks] = useState<Record<string, number>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize tricks from current round if they exist
  useEffect(() => {
    if (round?.tricksWon) {
      setTricks(round.tricksWon);
    }
  }, [round]);

  // Calculate current total of all tricks
  const totalTricks = useMemo(() => {
    return Object.values(tricks).reduce((sum, trick) => sum + (trick || 0), 0);
  }, [tricks]);

  // Check if current tricks state is valid
  const isValidTricksState = useMemo(() => {
    // All players must have tricks entered
    const allPlayersHaveTricks = biddingOrder.every(player => 
      tricks[player.id] !== undefined && tricks[player.id] >= 0
    );
    if (!allPlayersHaveTricks) return false;

    // Total must equal cards in round
    return totalTricks === cardsCount;
  }, [tricks, biddingOrder, totalTricks, cardsCount]);

  // Handle tricks change for a player
  const handleTricksChange = (playerId: string, value: string) => {
    const tricksValue = value === '' ? 0 : parseInt(value);
    
    if (isNaN(tricksValue) || tricksValue < 0) {
      return; // Invalid input, don't update
    }

    // Don't allow more tricks than cards in round
    if (tricksValue > cardsCount) {
      return;
    }

    setTricks(prev => ({ ...prev, [playerId]: tricksValue }));
    setValidationError(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValidTricksState) {
      const validation = validateTricks(tricks);
      setValidationError(validation.error || 'Ongeldige slagen verdeling');
      return;
    }

    setSubmitting(true);
    try {
      await submitTricks(tricks);
      setPhase('roundComplete');
    } catch (error) {
      setValidationError('Fout bij het opslaan van slagen');
    } finally {
      setSubmitting(false);
    }
  };

  if (!round || !dealer) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Geen actieve ronde gevonden
        </Typography>
      </Paper>
    );
  }

  const totalIsCorrect = totalTricks === cardsCount;
  const totalIsExcessive = totalTricks > cardsCount;

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Round Information Header */}
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
            <strong>Deler:</strong> {dealer.name}
          </Typography>
        </Box>
      </Box>

      {/* Bids Summary */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrophyIcon />
          Biedingen van deze ronde:
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          }, 
          gap: 1 
        }}>
          {biddingOrder.map((player) => (
            <Box key={player.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {player.name}:
              </Typography>
              <Chip 
                label={`${round.bids[player.id] || 0} slag${(round.bids[player.id] || 0) !== 1 ? 'en' : ''}`}
                size="small"
                color={isDealer(player.id) ? 'primary' : 'default'}
                variant={isDealer(player.id) ? 'filled' : 'outlined'}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Running Total Display */}
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        bgcolor: totalIsCorrect ? 'success.50' : totalIsExcessive ? 'error.50' : 'warning.50',
        borderRadius: 1,
        border: '2px solid',
        borderColor: totalIsCorrect ? 'success.main' : totalIsExcessive ? 'error.main' : 'warning.main'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CalculateIcon color={totalIsCorrect ? 'success' : totalIsExcessive ? 'error' : 'warning'} />
          <Typography 
            variant="h6" 
            color={totalIsCorrect ? 'success.main' : totalIsExcessive ? 'error.main' : 'warning.main'}
            fontWeight="bold"
          >
            Totaal slagen: {totalTricks} / {cardsCount}
          </Typography>
          {totalIsCorrect && <CheckIcon color="success" />}
          {totalIsExcessive && <WarningIcon color="error" />}
        </Box>
        
        <Typography 
          variant="body2" 
          textAlign="center" 
          color={totalIsCorrect ? 'success.dark' : totalIsExcessive ? 'error.dark' : 'warning.dark'}
          sx={{ mt: 1 }}
        >
          {totalIsCorrect 
            ? '✓ Perfect! Het totaal klopt.' 
            : totalIsExcessive 
              ? `⚠️ Te veel slagen! Verlaag met ${totalTricks - cardsCount}.`
              : `Nog ${cardsCount - totalTricks} slag${cardsCount - totalTricks !== 1 ? 'en' : ''} toe te voegen.`
          }
        </Typography>
      </Box>

      {/* Tricks Input Form */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrophyIcon />
          Hoeveel slagen heeft elke speler gewonnen?
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
          {biddingOrder.map((player) => {
            const playerTricks = tricks[player.id] || 0;
            const playerBid = round.bids[player.id] || 0;
            const isDealerPlayer = isDealer(player.id);
            const isCorrectBid = playerTricks === playerBid;
            
            return (
              <Paper 
                key={player.id}
                elevation={1} 
                sx={{ 
                  p: 2,
                  border: isDealerPlayer ? '2px solid' : '1px solid',
                  borderColor: isDealerPlayer ? 'primary.main' : 'divider',
                  backgroundColor: isDealerPlayer ? 'primary.50' : 'background.paper'
                }}
              >
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
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Bieding: {playerBid} slag{playerBid !== 1 ? 'en' : ''}
                </Typography>
                
                <TextField
                  type="number"
                  label="Slagen gewonnen"
                  value={playerTricks}
                  onChange={(e) => handleTricksChange(player.id, e.target.value)}
                  inputProps={{ 
                    min: 0, 
                    max: cardsCount,
                    step: 1 
                  }}
                  fullWidth
                  size="small"
                  helperText={
                    isCorrectBid 
                      ? `✓ Bieding gehaald!` 
                      : playerTricks > playerBid 
                        ? `+${playerTricks - playerBid} meer dan geboden`
                        : playerTricks < playerBid 
                          ? `${playerBid - playerTricks} minder dan geboden`
                          : 'Voer aantal slagen in'
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: isCorrectBid 
                        ? 'success.main' 
                        : playerTricks !== playerBid && playerTricks > 0 
                          ? 'warning.main' 
                          : 'text.secondary'
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: isCorrectBid ? 'success.main' : undefined,
                      },
                    },
                  }}
                />
              </Paper>
            );
          })}
        </Box>
      </Box>

      {/* Validation Messages */}
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}

      {!totalIsCorrect && totalTricks > 0 && (
        <Alert 
          severity={totalIsExcessive ? "error" : "warning"} 
          sx={{ mb: 2 }}
        >
          <strong>
            {totalIsExcessive ? "Te veel slagen:" : "Controle nodig:"}
          </strong> Het totaal aantal slagen moet exact {cardsCount} zijn. 
          Nu staat er {totalTricks} slagen ingevuld.
        </Alert>
      )}

      {/* Progress Information */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="textSecondary">
          <strong>Voortgang:</strong> {
            biddingOrder.filter(player => tricks[player.id] !== undefined && tricks[player.id] >= 0).length
          } van {biddingOrder.length} spelers hebben slagen ingevuld
        </Typography>
        {isValidTricksState && (
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            <CheckIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Alle slagen zijn ingevuld en het totaal klopt!
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!isValidTricksState || submitting}
          startIcon={submitting ? undefined : <CheckIcon />}
          color={totalIsCorrect ? 'success' : 'primary'}
        >
          {submitting ? 'Bezig met opslaan...' : 'Slagen Bevestigen'}
        </Button>
      </Box>
    </Paper>
  );
};

export default TricksInput;
