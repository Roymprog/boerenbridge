import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Casino as DealerIcon,
  Gavel as BidIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useGame } from '../contexts';
import { useCurrentRound, useDealer, usePlayerOrder, useGamePhase } from '../hooks';

const BiddingPhase: React.FC = () => {
  const { submitBids, validateBids } = useGame();
  const { round, cardsCount } = useCurrentRound();
  const { dealer, isDealer } = useDealer();
  const { biddingOrder, isLastBidder } = usePlayerOrder();
  const { setPhase } = useGamePhase();

  const [bids, setBids] = useState<Record<number, number>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize bids from current round if they exist, otherwise set to zero
  useEffect(() => {
    if (round?.bids) {
      // Initialize all players with their existing bids or zero if no bid exists
      const initialBids: Record<string, number> = {};
      biddingOrder.forEach(player => {
        initialBids[player.id] = round.bids[player.id] ?? 0;
      });
      setBids(initialBids);
    }
  }, [round, biddingOrder]);

  // Generate valid bid options (0 to cards count)
  const bidOptions = useMemo(() => {
    return Array.from({ length: cardsCount + 1 }, (_, i) => i);
  }, [cardsCount]);

  // Calculate current total of all bids
  const totalBids = useMemo(() => {
    return Object.values(bids).reduce((sum, bid) => sum + (bid || 0), 0);
  }, [bids]);

  // Check if current bid state is valid
  const isValidBidState = useMemo(() => {
    // All players must have a bid
    const allPlayersBid = biddingOrder.every(player => bids[player.id] !== undefined);
    if (!allPlayersBid) return false;

    // Validate using game context validation
    const validation = validateBids(bids);
    return validation.isValid;
  }, [bids, biddingOrder, validateBids]);

  // Get filtered bid options for a specific player (considering last bidder rule)
  const getFilteredBidOptions = (playerId: number): number[] => {
    if (!isLastBidder(playerId)) {
      return bidOptions;
    }

    // For last bidder, exclude bids that would make total equal to cards count
    const otherPlayersTotal = Object.entries(bids)
      .filter(([id]) => id !== playerId.toString())
      .reduce((sum, [, bid]) => sum + (bid || 0), 0);

    return bidOptions.filter(bid => otherPlayersTotal + bid !== cardsCount);
  };

  // Handle bid change for a player
  const handleBidChange = (playerId: number, bid: number | null) => {
    if (bid === null) {
      const newBids = { ...bids };
      delete newBids[playerId];
      setBids(newBids);
    } else {
      setBids(prev => ({ ...prev, [playerId]: bid }));
    }
    setValidationError(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValidBidState) {
      const validation = validateBids(bids);
      setValidationError(validation.error || 'Ongeldige biedingen');
      return;
    }

    setSubmitting(true);
    try {
      await submitBids(bids);
      setPhase('tricks');
    } catch (error) {
      setValidationError('Fout bij het opslaan van biedingen');
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

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Round Information Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ronde {round.roundNumber} - Biedingen
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

        {/* Bid Total Information */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <BidIcon />
          <Typography 
            variant="body1" 
            color={totalBids === cardsCount ? 'error' : 'textPrimary'}
          >
            Totaal geboden: <strong>{totalBids}</strong> / {cardsCount} kaarten
          </Typography>
          {totalBids === cardsCount && (
            <WarningIcon color="error" fontSize="small" />
          )}
        </Box>
      </Box>

      {/* Bidding Form */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BidIcon />
          Volgorde van bieden (vanaf links van deler):
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
          {biddingOrder.map((player, index) => {
            const playerBid = bids[player.id];
            const isDealerPlayer = isDealer(player.id);
            const isLastPlayer = isLastBidder(player.id);
            const filteredOptions = getFilteredBidOptions(player.id);
            
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
                    {index + 1}. {player.name}
                  </Typography>
                  {isDealerPlayer && (
                    <Chip 
                      label="Deler" 
                      size="small" 
                      color="primary" 
                      icon={<DealerIcon />}
                    />
                  )}
                  {isLastPlayer && (
                    <Chip 
                      label="Laatste bieder" 
                      size="small" 
                      color="warning"
                      icon={<WarningIcon />}
                    />
                  )}
                </Box>
                
                <Autocomplete
                  value={playerBid ?? null}
                  onChange={(event, newValue) => {
                    const numValue = typeof newValue === 'string' ? parseInt(newValue) : newValue;
                    handleBidChange(player.id, numValue);
                  }}
                  options={filteredOptions}
                  getOptionLabel={(option) => option.toString()}
                  getOptionDisabled={(option) => !filteredOptions.includes(option)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Bieding"
                      placeholder="Kies bieding"
                      error={isLastPlayer && playerBid !== undefined && 
                             Object.values(bids).reduce((sum, b) => sum + (b || 0), 0) === cardsCount}
                      helperText={
                        isLastPlayer 
                          ? `Mag niet ${cardsCount - Object.entries(bids)
                              .filter(([id]) => id !== player.id.toString())
                              .reduce((sum, [, bid]) => sum + (bid || 0), 0)} bieden`
                          : `0 tot ${cardsCount} slagen`
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            {playerBid !== undefined && (
                              <CheckIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                            )}
                          </>
                        ),
                      }}
                    />
                  )}
                  fullWidth
                  freeSolo
                  onInputChange={(event, newInputValue) => {
                    const numValue = parseInt(newInputValue);
                    if (!isNaN(numValue) && filteredOptions.includes(numValue)) {
                      handleBidChange(player.id, numValue);
                    }
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

      {totalBids === cardsCount && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Let op:</strong> Het totaal aantal biedingen mag niet gelijk zijn aan het aantal kaarten ({cardsCount}). 
          De laatste bieder moet een andere bieding kiezen.
        </Alert>
      )}

      {/* Progress Information */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="textSecondary">
          <strong>Voortgang:</strong> {Object.keys(bids).length} van {biddingOrder.length} spelers hebben geboden
        </Typography>
        {Object.keys(bids).length === biddingOrder.length && isValidBidState && (
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            <CheckIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Alle biedingen zijn geldig!
          </Typography>
        )}
      </Box>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!isValidBidState || submitting}
          startIcon={submitting ? undefined : <CheckIcon />}
        >
          {submitting ? 'Bezig met opslaan...' : 'Biedingen Bevestigen'}
        </Button>
      </Box>
    </Paper>
  );
};

export default BiddingPhase;
