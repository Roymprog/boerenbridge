import React, { useEffect } from 'react';
import { Container, Typography, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { BiddingPhase } from './index';
import { useGame } from '../contexts';
import { useGamePhase } from '../hooks';

const BiddingPhaseDemo: React.FC = () => {
  const navigate = useNavigate();
  const { state, initializeGame } = useGame();
  const { setPhase } = useGamePhase();

  // Initialize a demo game when the component mounts
  useEffect(() => {
    if (!state.isGameActive) {
      const demoPlayers = ['Alice', 'Bob', 'Charlie', 'David'];
      const demoMaxCards = 8;
      
      initializeGame(demoPlayers, demoMaxCards);
    }
  }, [state.isGameActive, initializeGame]);

  // Ensure we're in bidding phase
  useEffect(() => {
    if (state.isGameActive && state.currentPhase !== 'bidding') {
      setPhase('bidding');
    }
  }, [state.isGameActive, state.currentPhase, setPhase]);

  const handleBack = () => {
    navigate('/');
  };

  const resetDemo = () => {
    const demoPlayers = ['Alice', 'Bob', 'Charlie', 'David'];
    const demoMaxCards = 8;
    initializeGame(demoPlayers, demoMaxCards);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Terug naar Hoofdmenu
        </Button>
        
        <Button
          variant="outlined"
          onClick={resetDemo}
          sx={{ ml: 'auto' }}
        >
          Reset Demo
        </Button>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        🎯 Bidding Phase Demo
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Dit is een demo van de bidding phase component. Het spel is automatisch geïnitialiseerd met 4 testspelers (Alice, Bob, Charlie, David) en 8 kaarten maximum.
        </Typography>
      </Alert>

      {state.isGameActive ? (
        <BiddingPhase />
      ) : (
        <Alert severity="warning">
          Spel wordt geïnitialiseerd...
        </Alert>
      )}
    </Container>
  );
};

export default BiddingPhaseDemo;

// Ensure this file is treated as a module
export {};
