import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Stack
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  History as HistoryIcon
} from '@mui/icons-material';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  const handleNewGame = () => {
    navigate('/new-game');
  };

  const handleHistory = () => {
    navigate('/history');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#2c3e50',
            mb: 4
          }}
        >
          Boerenbridge
        </Typography>
        
        <Typography
          variant="h6"
          component="p"
          gutterBottom
          sx={{
            color: '#7f8c8d',
            mb: 6,
            fontWeight: 300
          }}
        >
          Houd scores bij van je Boerenbridge spelletjes
        </Typography>

        <Stack spacing={3} alignItems="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            onClick={handleNewGame}
            sx={{
              fontSize: '1.2rem',
              py: 2,
              px: 4,
              minWidth: 280,
              borderRadius: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1BA3D6 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Nieuw Spel Starten
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<HistoryIcon />}
            onClick={handleHistory}
            sx={{
              fontSize: '1.1rem',
              py: 2,
              px: 4,
              minWidth: 280,
              borderRadius: 3,
              borderWidth: 2,
              borderColor: '#34495e',
              color: '#34495e',
              '&:hover': {
                borderWidth: 2,
                borderColor: '#2c3e50',
                backgroundColor: '#34495e',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 10px 2px rgba(52, 73, 94, .2)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Historie Bekijken
          </Button>

          {/* Temporary Development Button */}
          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/test-game-state')}
            sx={{
              color: '#95a5a6',
              fontSize: '0.9rem',
              textTransform: 'none',
            }}
          >
            🧪 Test Game State & Bidding (Dev)
          </Button>

          {/* Scoreboard Demo Button */}
          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/scoreboard-demo')}
            sx={{
              color: '#95a5a6',
              fontSize: '0.9rem',
              textTransform: 'none',
            }}
          >
            📊 Scoreboard Demo (Dev)
          </Button>
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#95a5a6',
              fontStyle: 'italic'
            }}
          >
            Versie 1.0 - Desktop Application
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default MainMenu;
