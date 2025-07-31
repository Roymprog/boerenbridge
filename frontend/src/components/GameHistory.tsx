import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  Pagination,
  Stack,
  Tooltip,
  IconButton,
  Collapse,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Score as ScoreIcon,
  Visibility as ViewIcon,
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

import { getPlayers, getGameHistory } from '../services/api';
import { GameHistoryResponse, GameSummary, Player, GameHistoryFilters } from '../types/gameHistory';
import { useError, useLoading } from '../contexts';
import { GameHistorySkeleton } from './SkeletonLoaders';

interface SortConfig {
  key: 'date' | 'winner_score';
  direction: 'asc' | 'desc';
}

const GameHistory: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useError();

  // State management
  const [games, setGames] = useState<GameSummary[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [pageSize] = useState(20);

  // Filter state
  const [filters, setFilters] = useState<GameHistoryFilters>({
    selectedPlayers: [],
    startDate: null,
    endDate: null,
    minWinnerScore: 0,
    maxWinnerScore: 100,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc',
  });

  // Load players for filter dropdown
  const loadPlayers = useCallback(async () => {
    try {
      const playersData = await getPlayers();
      setAllPlayers(playersData);
    } catch (err) {
      console.error('Error loading players:', err);
      showError('Fout bij laden van spelers');
    }
  }, [showError]);

  // Load game history
  const loadGameHistory = useCallback(async () => {
    setLoading(true);

    try {
      const queryParams: any = {
        page: currentPage,
        page_size: pageSize,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
      };

      // Add filters if they have values
      if (filters.selectedPlayers.length > 0) {
        queryParams.player_ids = filters.selectedPlayers;
      }
      if (filters.startDate) {
        queryParams.start_date = filters.startDate;
      }
      if (filters.endDate) {
        queryParams.end_date = filters.endDate;
      }
      if (filters.minWinnerScore > 0) {
        queryParams.min_winner_score = filters.minWinnerScore;
      }
      if (filters.maxWinnerScore < 100) {
        queryParams.max_winner_score = filters.maxWinnerScore;
      }

      const historyData: GameHistoryResponse = await getGameHistory(queryParams);
      
      setGames(historyData.games);
      setTotalPages(historyData.total_pages);
            setTotalGames(historyData.total_games);
    } catch (err) {
      console.error('Error loading game history:', err);
      showError('Fout bij laden van spelgeschiedenis');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortConfig, filters, showError]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  useEffect(() => {
    loadGameHistory();
  }, [loadGameHistory]);

  // Event handlers
  const handleBack = () => {
    navigate('/');
  };

  const handleSort = (key: 'date' | 'winner_score') => {
    const direction = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleFilterChange = (newFilters: Partial<GameHistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      selectedPlayers: [],
      startDate: null,
      endDate: null,
      minWinnerScore: 0,
      maxWinnerScore: 100,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleGameClick = (gameId: number, gameStatus: string) => {
    if (gameStatus === 'active') {
      // Continue playing the active game
      navigate(`/game/${gameId}`);
    } else {
      // Show read-only game detail view for completed/abandoned games
      navigate(`/history/${gameId}`);
    }
  };

  // Helper functions
  const getWinnerName = (game: GameSummary): string => {
    if (!game.winner_id || !game.players) return '-';
    const winner = game.players.find(p => p.id === game.winner_id);
    return winner?.name || '-';
  };

  const getWinnerScore = (game: GameSummary): number | null => {
    if (!game.winner_id || !game.final_scores || !game.players) return null;
    const winnerIndex = game.players.findIndex(p => p.id === game.winner_id);
    return winnerIndex >= 0 ? game.final_scores[winnerIndex] : null;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getFilterCount = (): number => {
    let count = 0;
    if (filters.selectedPlayers.length > 0) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.minWinnerScore > 0 || filters.maxWinnerScore < 100) count++;
    return count;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Terug naar Hoofdmenu
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1">
              Spel Historie
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalGames} {totalGames === 1 ? 'spel' : 'spellen'} gevonden
            </Typography>
          </Box>
          <Badge badgeContent={getFilterCount()} color="primary">
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              Filters
            </Button>
          </Badge>
        </Box>

        {/* Filters Panel */}
        <Collapse in={showFilters}>
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters en Sortering
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Player Filter */}
                <Box sx={{ flex: 1 }}>
                  <Autocomplete
                    multiple
                    options={allPlayers}
                    getOptionLabel={(option) => option.name}
                    value={allPlayers.filter(p => filters.selectedPlayers.includes(p.id))}
                    onChange={(_, newValue) => {
                      handleFilterChange({ selectedPlayers: newValue.map(p => p.id) });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Filter op spelers"
                        placeholder="Selecteer spelers..."
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.id}
                          label={option.name}
                          size="small"
                        />
                      ))
                    }
                  />
                </Box>

                {/* Date Range Filter */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <TextField
                      label="Van datum"
                      type="date"
                      size="small"
                      value={filters.startDate || ''}
                      onChange={(e) => {
                        handleFilterChange({ startDate: e.target.value || null });
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Tot datum"
                      type="date"
                      size="small"
                      value={filters.endDate || ''}
                      onChange={(e) => {
                        handleFilterChange({ endDate: e.target.value || null });
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Box>
                </Box>

                {/* Winner Score Range */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <TextField
                      label="Min winnaar score"
                      type="number"
                      size="small"
                      value={filters.minWinnerScore}
                      onChange={(e) => {
                        handleFilterChange({ minWinnerScore: Number(e.target.value) || 0 });
                      }}
                    />
                    <TextField
                      label="Max winnaar score"
                      type="number"
                      size="small"
                      value={filters.maxWinnerScore}
                      onChange={(e) => {
                        handleFilterChange({ maxWinnerScore: Number(e.target.value) || 100 });
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Filter Actions */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={getFilterCount() === 0}
                >
                  Wis Filters
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Loading State */}
        {loading && (
          <GameHistorySkeleton />
        )}

        {/* Games Table */}
        {!loading && (
          <>
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'date'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('date')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" />
                          Datum
                        </Box>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        Spelers
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScoreIcon fontSize="small" />
                        Eindscores
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'winner_score'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('winner_score')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrophyIcon fontSize="small" />
                          Winnaar
                        </Box>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Acties</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {games.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Geen spellen gevonden met de huidige filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    games.map((game) => (
                      <TableRow
                        key={game.id}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onClick={() => handleGameClick(game.id, game.status)}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(game.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {game.players.map((player) => (
                              <Chip
                                key={player.id}
                                label={player.name}
                                size="small"
                                variant={game.winner_id === player.id ? 'filled' : 'outlined'}
                                color={game.winner_id === player.id ? 'primary' : 'default'}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {game.final_scores ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {game.final_scores.map((score, index) => {
                                const player = game.players[index];
                                const isWinner = game.winner_id === player?.id;
                                return (
                                  <Chip
                                    key={index}
                                    label={`${score}`}
                                    size="small"
                                    color={isWinner ? 'success' : 'default'}
                                    variant={isWinner ? 'filled' : 'outlined'}
                                  />
                                );
                              })}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {game.winner_id && (
                              <TrophyIcon fontSize="small" color="primary" />
                            )}
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {getWinnerName(game)}
                              </Typography>
                              {getWinnerScore(game) !== null && (
                                <Typography variant="caption" color="text.secondary">
                                  {getWinnerScore(game)} punten
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={game.status === 'completed' ? 'Voltooid' : 
                                  game.status === 'active' ? 'Actief' : 'Afgebroken'}
                            size="small"
                            color={game.status === 'completed' ? 'success' : 
                                   game.status === 'active' ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={game.status === 'active' ? 'Verder spelen' : 'Bekijk details'}>
                            <IconButton
                              size="small"
                              color={game.status === 'active' ? 'primary' : 'default'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGameClick(game.id, game.status);
                              }}
                            >
                              {game.status === 'active' ? <PlayArrowIcon /> : <ViewIcon />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Pagina {currentPage} van {totalPages} • {totalGames} totaal
                  </Typography>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default GameHistory;
