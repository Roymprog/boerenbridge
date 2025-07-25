import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useGame } from '../contexts';
import {
  useCurrentRound,
  useDealer,
  usePlayerOrder,
  useGamePhase,
  useGameProgress,
  useGameScores,
} from '../hooks';

interface GameStateDebugProps {
  showDetails?: boolean;
}

const GameStateDebug: React.FC<GameStateDebugProps> = ({ showDetails = false }) => {
  const { state } = useGame();
  const currentRound = useCurrentRound();
  const dealer = useDealer();
  const playerOrder = usePlayerOrder();
  const gamePhase = useGamePhase();
  const gameProgress = useGameProgress();
  const gameScores = useGameScores();

  if (!state.isGameActive && state.currentPhase === 'setup') {
    return (
      <Paper elevation={2} sx={{ p: 2, bgcolor: 'grey.100' }}>
        <Typography variant="caption" color="text.secondary">
          Game State Debug: No active game
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, bgcolor: 'info.50' }}>
      <Typography variant="subtitle2" gutterBottom color="info.main">
        🐛 Game State Debug
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip 
          label={`Round ${currentRound.roundNumber}/${gameProgress.totalRounds}`} 
          color="primary" 
          size="small" 
        />
        <Chip 
          label={`${currentRound.cardsCount} cards`} 
          color="secondary" 
          size="small" 
        />
        <Chip 
          label={gamePhase.currentPhase} 
          color={gamePhase.isBidding ? 'warning' : gamePhase.isTricks ? 'success' : 'default'} 
          size="small" 
        />
        <Chip 
          label={`Dealer: ${dealer.dealerName}`} 
          variant="outlined" 
          size="small" 
        />
      </Box>

      {showDetails && (
        <>
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Players ({state.players.length})
              </Typography>
              <List dense>
                {playerOrder.playerOrder.map((player, index) => (
                  <ListItem key={player.id} sx={{ py: 0 }}>
                    <ListItemText 
                      primary={player.name}
                      secondary={`Position ${player.position} | Score: ${gameScores.currentScores[player.id] || 0}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Bidding Order
              </Typography>
              <List dense>
                {playerOrder.biddingOrder.map((player, index) => (
                  <ListItem key={player.id} sx={{ py: 0 }}>
                    <ListItemText 
                      primary={`${index + 1}. ${player.name}`}
                      secondary={playerOrder.isLastBidder(player.id) ? 'Last bidder' : ''}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />
          
          <Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Current Round Data
            </Typography>
            <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
              {JSON.stringify(currentRound.round, null, 2)}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default GameStateDebug;
