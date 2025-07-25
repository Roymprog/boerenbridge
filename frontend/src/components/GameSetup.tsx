import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const GameSetup: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Terug naar Hoofdmenu
          </Button>
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Nieuw Spel Instellen
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Hier komt de game setup interface met speler selectie en configuratie.
        </Typography>
        
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Volgende stappen:
          </Typography>
          <Typography variant="body2" component="div">
            • Speler selectie component<br />
            • Rondes configuratie<br />
            • Start spel functionaliteit
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default GameSetup;
