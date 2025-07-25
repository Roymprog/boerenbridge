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
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Home as HomeIcon,
  PlayArrow as PlayIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Score as ScoreIcon,
} from '@mui/icons-material';
import { useGame } from '../contexts';
import { useGameScores } from '../hooks';
import Scoreboard from './Scoreboard';

interface WinnerInfo {
  player: { id: string; name: string; position: number };
  score: number;
  isTie: boolean;
  tiedPlayers?: { id: string; name: string; position: number; score: number }[];
}

const EndGame: React.FC = () => {
  const navigate = useNavigate();
  const { state, resetGame } = useGame();
  const { standings } = useGameScores();
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);

  // Determine winner with tie-breaking logic
  useEffect(() => {
    if (state.currentPhase === 'gameComplete' && standings.length > 0 && state.rounds.length > 0) {
      const topScore = standings[0].score;
      const tiedPlayers = standings.filter(s => s.score === topScore);
      
      if (tiedPlayers.length === 1) {
        // Single winner
        setWinnerInfo({
          player: tiedPlayers[0].player,
          score: topScore,
          isTie: false,
        });
      } else {
        // Tie situation - multiple players with same top score
        setWinnerInfo({
          player: tiedPlayers[0].player, // First in alphabetical order
          score: topScore,
          isTie: true,
          tiedPlayers: tiedPlayers.map(tp => ({
            ...tp.player,
            score: tp.score,
          })),
        });
      }
    }
  }, [state.currentPhase, standings, state.rounds.length]);

  const handleNewGame = async () => {
    setIsNavigating(true);
    try {
      // Store current player names for pre-population
      const playerNames = state.players.map(p => p.name);
      
      // Reset game state
      resetGame();
      
      // Navigate to new game setup with player names pre-populated
      navigate('/new-game', { 
        state: { 
          prePopulatedPlayers: playerNames,
          maxCards: state.maxCards 
        } 
      });
    } catch (error) {
      console.error('Error starting new game:', error);
      setIsNavigating(false);
    }
  };

  const handleMainMenu = async () => {
    setIsNavigating(true);
    try {
      // Clean up game state
      resetGame();
      
      // Navigate to main menu
      navigate('/');
    } catch (error) {
      console.error('Error navigating to main menu:', error);
      setIsNavigating(false);
    }
  };

  if (!winnerInfo) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Spel resultaten laden...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header with winner announcement */}
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          mb: 3, 
          textAlign: 'center',
          background: winnerInfo.isTie 
            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            : 'linear-gradient(135deg, #FFD700 0%, #FF6B35 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <TrophyIcon sx={{ fontSize: 72, mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
          
          {winnerInfo.isTie ? (
            <>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                🎉 Gelijkspel! 🎉
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, opacity: 0.9 }}>
                {winnerInfo.tiedPlayers?.map(p => p.name).join(', ')} delen de overwinning!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                Eindscore: {winnerInfo.score} punten
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                🎉 Winnaar: {winnerInfo.player.name}! 🎉
              </Typography>
              <Typography variant="h5" sx={{ mb: 2, opacity: 0.9 }}>
                Gefeliciteerd met de overwinning!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                Eindscore: {winnerInfo.score} punten
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* Game Statistics */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 3
        }}
      >
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Spelers
            </Typography>
            <Typography variant="h4" color="primary">
              {state.players.length}
            </Typography>
          </CardContent>
        </Card>
        
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center' }}>
            <ScoreIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Rondes Gespeeld
            </Typography>
            <Typography variant="h4" color="secondary">
              {state.totalRounds}
            </Typography>
          </CardContent>
        </Card>
        
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Winnende Score
            </Typography>
            <Typography variant="h4" color="warning.main">
              {winnerInfo.score}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Final Standings */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrophyIcon color="primary" />
          Eindstand
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={1}>
          {standings.map((standing, index) => (
            <Box
              key={standing.player.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                backgroundColor: index === 0 && !winnerInfo.isTie 
                  ? 'primary.light'
                  : winnerInfo.isTie && winnerInfo.tiedPlayers?.some(p => p.id === standing.player.id)
                  ? 'warning.light'
                  : 'grey.100',
                color: (index === 0 && !winnerInfo.isTie) || 
                       (winnerInfo.isTie && winnerInfo.tiedPlayers?.some(p => p.id === standing.player.id))
                  ? 'white' 
                  : 'text.primary',
                fontWeight: (index === 0 && !winnerInfo.isTie) ||
                           (winnerInfo.isTie && winnerInfo.tiedPlayers?.some(p => p.id === standing.player.id))
                  ? 'bold' 
                  : 'normal'
              }}
            >
              <Avatar 
                sx={{ 
                  mr: 2, 
                  bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#CD7F32' : 'grey.500',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {index + 1}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">
                  {standing.player.name}
                  {((index === 0 && !winnerInfo.isTie) || 
                    (winnerInfo.isTie && winnerInfo.tiedPlayers?.some(p => p.id === standing.player.id))) && (
                    <TrophyIcon sx={{ ml: 1, verticalAlign: 'middle' }} />
                  )}
                </Typography>
              </Box>
              
              <Chip
                label={`${standing.score} punten`}
                color={(index === 0 && !winnerInfo.isTie) || 
                      (winnerInfo.isTie && winnerInfo.tiedPlayers?.some(p => p.id === standing.player.id))
                  ? 'primary' 
                  : 'default'}
                variant={(index === 0 && !winnerInfo.isTie) || 
                        (winnerInfo.isTie && winnerInfo.tiedPlayers?.some(p => p.id === standing.player.id))
                  ? 'filled' 
                  : 'outlined'}
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Final Scoreboard */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Volledige Scorelijst
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ overflowX: 'auto' }}>
          <Scoreboard 
            showOnlyCompleted={true}
            highlightWinner={true}
            readOnly={true}
            maxHeight="400px"
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Wat wil je nu doen?
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center',
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            onClick={handleNewGame}
            disabled={isNavigating}
            sx={{ 
              py: 2, 
              px: 4,
              fontSize: '1.1rem',
              minWidth: 200
            }}
          >
            {isNavigating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                Laden...
              </Box>
            ) : (
              'Nieuw Spel'
            )}
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleMainMenu}
            disabled={isNavigating}
            sx={{ 
              py: 2, 
              px: 4,
              fontSize: '1.1rem',
              minWidth: 200
            }}
          >
            {isNavigating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                Laden...
              </Box>
            ) : (
              'Terug naar Hoofdmenu'
            )}
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Nieuw Spel:</strong> Start een nieuw spel met dezelfde spelers en instellingen.
            <br />
            <strong>Hoofdmenu:</strong> Ga terug naar het hoofdmenu om nieuwe spelers te selecteren of de historie te bekijken.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default EndGame;
