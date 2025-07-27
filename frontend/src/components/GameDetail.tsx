import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Score as ScoreIcon,
  CardGiftcard as CardsIcon,
} from '@mui/icons-material';

import { gameAPI } from '../services/api';
import { GameSummary } from '../types/gameHistory';

interface RoundScore {
  player_id: number;
  player_name: string;
  bid: number;
  tricks_won: number;
  score: number;
  running_total: number;
}

interface Round {
  round_number: number;
  cards_count: number;
  dealer_position: number;
  scores: RoundScore[];
}

interface GameDetailData {
  game: GameSummary;
  rounds: Round[];
  scoreboard: {
    players: Array<{
      player_id: number;
      player_name: string;
      position: number;
      rounds: Array<{
        bid?: number;
        tricks_won?: number;
        score?: number;
        running_total?: number;
      }>;
      final_total: number;
    }>;
    is_complete: boolean;
    winner_id?: number;
  };
}

const GameDetail: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [gameData, setGameData] = useState<GameDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGameDetail = async () => {
      if (!gameId) return;

      setLoading(true);
      setError(null);

      try {
        // Load game details and scoreboard
        const [gameResponse, scoreboardResponse] = await Promise.all([
          gameAPI.getById(Number(gameId)),
          gameAPI.getScoreboard(gameId),
        ]);

        const gameDetail: GameDetailData = {
          game: gameResponse.data,
          rounds: [], // Will be extracted from scoreboard
          scoreboard: scoreboardResponse.data,
        };

        setGameData(gameDetail);
      } catch (err) {
        console.error('Error loading game details:', err);
        setError('Fout bij laden van speldetails');
      } finally {
        setLoading(false);
      }
    };

    loadGameDetail();
  }, [gameId]);

  const handleBack = () => {
    navigate('/history');
  };

  const handleHome = () => {
    navigate('/');
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getWinnerName = (): string => {
    if (!gameData?.scoreboard.winner_id) return '';
    const winner = gameData.scoreboard.players.find(p => p.player_id === gameData.scoreboard.winner_id);
    return winner?.player_name || '';
  };

  const getRoundTitle = (roundIndex: number, totalRounds: number, maxCards: number): string => {
    const roundNumber = roundIndex + 1;
    const midPoint = Math.ceil(totalRounds / 2);
    
    let cards: number;
    if (roundNumber <= midPoint) {
      cards = roundNumber;
    } else {
      cards = totalRounds - roundNumber + 1;
    }
    
    return `Ronde ${roundNumber} (${cards} kaart${cards !== 1 ? 'en' : ''})`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !gameData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Spel niet gevonden'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="contained"
          >
            Terug naar Historie
          </Button>
        </Paper>
      </Container>
    );
  }

  const { game, scoreboard } = gameData;
  const totalRounds = (game.max_cards * 2) - 1;

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <Link
              component="button"
              variant="body1"
              onClick={handleHome}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <HomeIcon fontSize="small" />
              Hoofdmenu
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={handleBack}
            >
              Historie
            </Link>
            <Typography color="text.primary">
              Spel #{game.id}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              variant="outlined"
            >
              Terug naar Historie
            </Button>
          </Box>
        </Box>

        {/* Game Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Spel Detail #{game.id}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Chip
              icon={<CalendarIcon />}
              label={formatDate(game.created_at)}
              variant="outlined"
            />
            <Chip
              icon={<PersonIcon />}
              label={`${scoreboard.players.length} spelers`}
              variant="outlined"
            />
            <Chip
              icon={<CardsIcon />}
              label={`Max ${game.max_cards} kaarten`}
              variant="outlined"
            />
            <Chip
              label={game.status === 'completed' ? 'Voltooid' : 
                    game.status === 'active' ? 'Actief' : 'Afgebroken'}
              color={game.status === 'completed' ? 'success' : 
                     game.status === 'active' ? 'warning' : 'error'}
            />
          </Box>
        </Box>

        {/* Winner Section */}
        {scoreboard.is_complete && scoreboard.winner_id && (
          <Card elevation={2} sx={{ mb: 4, bgcolor: 'success.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrophyIcon sx={{ fontSize: 48, color: 'success.main' }} />
                <Box>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    🎉 Winnaar: {getWinnerName()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Eindscore: {scoreboard.players.find(p => p.player_id === scoreboard.winner_id)?.final_total} punten
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Players Overview */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Spelers en Eindscores
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {scoreboard.players
                .sort((a, b) => b.final_total - a.final_total)
                .map((player, index) => (
                  <Box key={player.player_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{ 
                        bgcolor: index === 0 ? 'primary.main' : 'grey.400',
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem'
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {player.player_name}
                        {player.player_id === scoreboard.winner_id && (
                          <TrophyIcon sx={{ ml: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {player.final_total} punten
                      </Typography>
                    </Box>
                  </Box>
                ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Detailed Scoreboard */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScoreIcon />
              Gedetailleerd Scorebord
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>
                      Ronde
                    </TableCell>
                    {scoreboard.players.map((player) => (
                      <TableCell
                        key={player.player_id}
                        align="center"
                        sx={{ 
                          fontWeight: 'bold',
                          minWidth: 120,
                          backgroundColor: player.player_id === scoreboard.winner_id 
                            ? 'primary.50' 
                            : 'inherit'
                        }}
                      >
                        {player.player_name}
                        {player.player_id === scoreboard.winner_id && (
                          <TrophyIcon sx={{ ml: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scoreboard.players[0]?.rounds.map((_, roundIndex) => (
                    <TableRow
                      key={roundIndex}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        {getRoundTitle(roundIndex, totalRounds, game.max_cards)}
                      </TableCell>
                      {scoreboard.players.map((player) => {
                        const roundData = player.rounds[roundIndex];
                        if (!roundData || roundData.bid === undefined) {
                          return (
                            <TableCell key={player.player_id} align="center" sx={{ color: 'text.disabled' }}>
                              -
                            </TableCell>
                          );
                        }

                        const isCorrectBid = roundData.bid === roundData.tricks_won;
                        
                        return (
                          <TableCell
                            key={player.player_id}
                            align="center"
                            sx={{
                              backgroundColor: player.player_id === scoreboard.winner_id 
                                ? 'primary.50' 
                                : 'inherit'
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                V: {roundData.bid} | G: {roundData.tricks_won}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                fontWeight="medium"
                                color={isCorrectBid ? 'success.main' : 'error.main'}
                              >
                                {(roundData.score ?? 0) > 0 ? '+' : ''}{roundData.score ?? 0}
                              </Typography>
                              <Typography variant="caption" fontWeight="bold">
                                Tot: {roundData.running_total}
                              </Typography>
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  
                  {/* Final totals row */}
                  <TableRow sx={{ backgroundColor: 'primary.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      <Typography variant="subtitle2">
                        Eindtotaal
                      </Typography>
                    </TableCell>
                    {scoreboard.players.map((player) => (
                      <TableCell
                        key={player.player_id}
                        align="center"
                        sx={{
                          fontWeight: 'bold',
                          backgroundColor: player.player_id === scoreboard.winner_id 
                            ? 'success.100' 
                            : 'inherit'
                        }}
                      >
                        <Typography variant="h6" color="primary">
                          {player.final_total}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Legenda:</strong> V = Voorspelling (bid), G = Gehaald (tricks won), Tot = Running totaal
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default GameDetail;
