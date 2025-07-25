import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Casino as DealerIcon,
  EmojiEvents as WinnerIcon,
  Visibility as BidIcon,
  Scoreboard as ScoreIcon,
} from '@mui/icons-material';
import { useGame } from '../contexts';
import { useGameScores, useGameProgress } from '../hooks';

interface ScoreboardProps {
  /** Optional prop to show only completed rounds */
  showOnlyCompleted?: boolean;
  /** Optional prop to highlight the winner */
  highlightWinner?: boolean;
  /** Optional prop to make it read-only (for historical games) */
  readOnly?: boolean;
  /** Optional prop to customize the height */
  maxHeight?: number | string;
  /** Optional prop to hide current round info */
  hideCurrentRoundInfo?: boolean;
}

interface CellData {
  bid?: number;
  tricksWon?: number;
  score?: number;
  runningTotal?: number;
  isComplete: boolean;
  isCurrentRound: boolean;
  dealerPosition?: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  showOnlyCompleted = false,
  highlightWinner = false,
  readOnly = false,
  maxHeight = 600,
  hideCurrentRoundInfo = false,
}) => {
  const theme = useTheme();
  const { state, getDealerPlayer } = useGame();
  const gameScores = useGameScores();
  const gameProgress = useGameProgress();

  // Prepare scoreboard data
  const scoreboardData = useMemo(() => {
    if (!state.isGameActive && state.rounds.length === 0) {
      return { rounds: [], players: [], hasData: false };
    }

    const rounds = showOnlyCompleted 
      ? state.rounds.filter(round => round.isComplete)
      : state.rounds;

    // Create a matrix of data for each player and round
    const playerRoundData: Record<string, Record<number, CellData>> = {};
    
    state.players.forEach(player => {
      playerRoundData[player.id] = {};
      
      rounds.forEach(round => {
        const isCurrentRound = round.roundNumber === state.currentRound && !round.isComplete;
        
        playerRoundData[player.id][round.roundNumber] = {
          bid: round.bids[player.id],
          tricksWon: round.tricksWon[player.id],
          score: round.scores[player.id],
          runningTotal: round.runningTotals[player.id],
          isComplete: round.isComplete,
          isCurrentRound,
          dealerPosition: round.dealerPosition,
        };
      });
    });

    return {
      rounds,
      players: state.players,
      playerRoundData,
      hasData: rounds.length > 0,
    };
  }, [state, showOnlyCompleted]);

  const getCurrentRoundHeader = () => {
    if (hideCurrentRoundInfo || !state.isGameActive) return null;
    
    const currentRound = state.rounds[state.rounds.length - 1];
    if (!currentRound) return null;

    const dealer = getDealerPlayer();
    const phase = currentRound.isComplete ? 'Voltooid' : 
                 state.currentPhase === 'bidding' ? 'Bieden' :
                 state.currentPhase === 'tricks' ? 'Slagen invoeren' : '';

    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ScoreIcon color="primary" />
          Scorebord - Ronde {currentRound.roundNumber} van {state.totalRounds}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            icon={<BidIcon />}
            label={`${currentRound.cardsCount} ${currentRound.cardsCount === 1 ? 'kaart' : 'kaarten'}`}
            color="secondary"
            size="small"
          />
          {dealer && (
            <Chip 
              icon={<DealerIcon />}
              label={`Deler: ${dealer.name}`}
              color="primary"
              size="small"
            />
          )}
          {phase && (
            <Chip 
              label={phase}
              color={currentRound.isComplete ? 'success' : 'warning'}
              size="small"
            />
          )}
          <Chip 
            label={`${gameProgress.progressPercentage.toFixed(0)}% voltooid`}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>
    );
  };

  const getPlayerHeaderColor = (player: any) => {
    if (highlightWinner && gameScores.winner?.id === player.id) {
      return theme.palette.success.main;
    }
    return theme.palette.primary.main;
  };

  const getRoundHeaderText = (round: any) => {
    const cardText = round.cardsCount === 1 ? 'kaart' : 'kaarten';
    return `Ronde ${round.roundNumber} (${round.cardsCount} ${cardText})`;
  };

  const formatCellValue = (value: number | undefined, type: 'bid' | 'tricks' | 'score' | 'total') => {
    if (value === undefined) return '—';
    
    if (type === 'score' && value < 0) {
      return value.toString();
    }
    if (type === 'score' && value > 0) {
      return `+${value}`;
    }
    
    return value.toString();
  };

  const getCellColor = (cellData: CellData, type: 'bid' | 'tricks' | 'score' | 'total') => {
    if (!cellData.isComplete) {
      return type === 'bid' && cellData.bid !== undefined ? alpha(theme.palette.warning.main, 0.1) : 'transparent';
    }
    
    if (type === 'score') {
      if (cellData.score === undefined) return 'transparent';
      return cellData.score >= 0 
        ? alpha(theme.palette.success.main, 0.1)
        : alpha(theme.palette.error.main, 0.1);
    }
    
    return 'transparent';
  };

  if (!scoreboardData.hasData) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <ScoreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nog geen scores beschikbaar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {state.isGameActive 
            ? 'Start met bieden om de eerste scores te zien.'
            : 'Start een nieuw spel om scores bij te houden.'
          }
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {getCurrentRoundHeader()}
      
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <TableContainer 
          sx={{ 
            maxHeight,
            '& .MuiTableCell-root': {
              borderRight: `1px solid ${theme.palette.divider}`,
            },
            '& .MuiTableCell-head': {
              position: 'sticky',
              top: 0,
              backgroundColor: theme.palette.background.paper,
              zIndex: 2,
              fontWeight: 'bold',
            },
            '& .round-header': {
              position: 'sticky',
              left: 0,
              backgroundColor: theme.palette.background.paper,
              zIndex: 1,
              minWidth: 160,
              fontWeight: 'bold',
            },
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {/* Round header column */}
                <TableCell 
                  className="round-header"
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScoreIcon fontSize="small" />
                    Ronde
                  </Typography>
                </TableCell>
                
                {/* Player columns */}
                {scoreboardData.players.map((player) => (
                  <TableCell 
                    key={player.id}
                    align="center"
                    sx={{ 
                      minWidth: 120,
                      backgroundColor: alpha(getPlayerHeaderColor(player), 0.05),
                      borderBottom: `2px solid ${getPlayerHeaderColor(player)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {highlightWinner && gameScores.winner?.id === player.id && (
                        <WinnerIcon fontSize="small" color="success" />
                      )}
                      <Typography variant="subtitle2" fontWeight="bold">
                        {player.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Score: {gameScores.currentScores[player.id] || 0}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            
            <TableBody>
              {scoreboardData.rounds.map((round) => (
                <TableRow 
                  key={round.roundNumber}
                  sx={{
                    '&:nth-of-type(even)': { 
                      backgroundColor: alpha(theme.palette.action.hover, 0.3),
                    },
                    ...(round.roundNumber === state.currentRound && !round.isComplete && {
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      '& .MuiTableCell-root': {
                        borderBottom: `2px solid ${theme.palette.warning.main}`,
                      }
                    }),
                  }}
                >
                  {/* Round header cell */}
                  <TableCell 
                    className="round-header"
                    sx={{ 
                      backgroundColor: round.roundNumber === state.currentRound && !round.isComplete
                        ? alpha(theme.palette.warning.main, 0.1)
                        : alpha(theme.palette.action.hover, 0.3),
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {getRoundHeaderText(round)}
                    </Typography>
                    {round.dealerPosition !== undefined && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <DealerIcon fontSize="small" />
                        Deler: {scoreboardData.players[round.dealerPosition]?.name}
                      </Typography>
                    )}
                  </TableCell>
                  
                  {/* Player score cells */}
                  {scoreboardData.players.map((player) => {
                    const cellData = scoreboardData.playerRoundData?.[player.id]?.[round.roundNumber];
                    
                    return (
                      <TableCell 
                        key={player.id}
                        align="center"
                        sx={{ 
                          p: 1,
                          verticalAlign: 'top',
                          backgroundColor: cellData?.isCurrentRound 
                            ? alpha(theme.palette.warning.main, 0.05)
                            : 'transparent',
                        }}
                      >
                        {cellData ? (
                          <Box sx={{ minHeight: 80, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {/* Bid */}
                            <Box 
                              sx={{ 
                                p: 0.5, 
                                borderRadius: 0.5,
                                backgroundColor: getCellColor(cellData, 'bid'),
                              }}
                            >
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                                Bod
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatCellValue(cellData.bid, 'bid')}
                              </Typography>
                            </Box>
                            
                            {/* Tricks Won */}
                            <Box 
                              sx={{ 
                                p: 0.5, 
                                borderRadius: 0.5,
                                backgroundColor: getCellColor(cellData, 'tricks'),
                              }}
                            >
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                                Gehaald
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatCellValue(cellData.tricksWon, 'tricks')}
                              </Typography>
                            </Box>
                            
                            {/* Round Score */}
                            <Box 
                              sx={{ 
                                p: 0.5, 
                                borderRadius: 0.5,
                                backgroundColor: getCellColor(cellData, 'score'),
                              }}
                            >
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                                Score
                              </Typography>
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                color={
                                  cellData.score === undefined ? 'text.primary' :
                                  cellData.score >= 0 ? 'success.main' : 'error.main'
                                }
                              >
                                {formatCellValue(cellData.score, 'score')}
                              </Typography>
                            </Box>
                            
                            {/* Running Total */}
                            <Divider sx={{ my: 0.5 }} />
                            <Box 
                              sx={{ 
                                p: 0.5, 
                                borderRadius: 0.5,
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              }}
                            >
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                                Totaal
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" color="primary">
                                {formatCellValue(cellData.runningTotal, 'total')}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Footer with game summary */}
        {state.isGameActive && (
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.action.hover, 0.1), borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Voortgang: {scoreboardData.rounds.filter(r => r.isComplete).length} van {state.totalRounds} rondes voltooid
              </Typography>
              
              {gameScores.leader && (
                <Typography variant="body2" color="text.secondary">
                  Huidige leider: <strong>{gameScores.leader.name}</strong> ({gameScores.currentScores[gameScores.leader.id] || 0} punten)
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Scoreboard;
