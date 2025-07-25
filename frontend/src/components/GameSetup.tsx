import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import PlayerSelection from './PlayerSelection';
import RoundConfiguration from './RoundConfiguration';
import GameStateDebug from './GameStateDebug';
import { useGame } from '../contexts';

const GameSetup: React.FC = () => {
  const navigate = useNavigate();
  const { initializeGame } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playerSelectionValid, setPlayerSelectionValid] = useState(false);
  const [selectedMaxCards, setSelectedMaxCards] = useState(10);
  const [roundConfigValid, setRoundConfigValid] = useState(false);

  const steps = ['Spelers Selecteren', 'Rondes Configureren', 'Spel Starten'];

  const handleBack = () => {
    navigate('/');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartGame = async () => {
    try {
      // Initialize the game using the context
      initializeGame(selectedPlayers, selectedMaxCards);
      
      console.log('Game initialized with context:', {
        players: selectedPlayers,
        maxCards: selectedMaxCards,
        totalRounds: (selectedMaxCards * 2) - 1
      });
      
      // TODO: Navigate to game screen when implemented
      // navigate('/game');
      
      // For now, show success message
      alert(`Spel succesvol geïnitialiseerd!\nSpelers: ${selectedPlayers.join(', ')}\nMax kaarten: ${selectedMaxCards}\nAantal rondes: ${(selectedMaxCards * 2) - 1}\n\nSpel state is nu beschikbaar in de context.`);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Fout bij het starten van het spel. Probeer het opnieuw.');
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Player selection
        return playerSelectionValid;
      case 1: // Round configuration
        return roundConfigValid;
      case 2: // Ready to start
        return playerSelectionValid && roundConfigValid;
      default:
        return false;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
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

        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ minHeight: 400 }}>
          {currentStep === 0 && (
            <PlayerSelection
              selectedPlayers={selectedPlayers}
              onPlayersChange={setSelectedPlayers}
              onValidationChange={setPlayerSelectionValid}
            />
          )}
          
          {currentStep === 1 && (
            <RoundConfiguration
              playerCount={selectedPlayers.length}
              selectedMaxCards={selectedMaxCards}
              onMaxCardsChange={setSelectedMaxCards}
              onValidationChange={setRoundConfigValid}
            />
          )}

          {currentStep === 2 && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Spel Samenvatting
              </Typography>
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Spelers ({selectedPlayers.length}):</strong> {selectedPlayers.join(', ')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Maximum kaarten:</strong> {selectedMaxCards}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Aantal rondes:</strong> {(selectedMaxCards * 2) - 1}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Het spel verloopt van 1 kaart naar {selectedMaxCards} kaarten en weer terug naar 1 kaart. 
                  De dealer roteert elke ronde.
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outlined"
          >
            Vorige
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {currentStep === steps.length - 1 ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                disabled={!isStepValid()}
                onClick={handleStartGame}
              >
                Start Spel
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                variant="contained"
              >
                Volgende
              </Button>
            )}
          </Box>
        </Box>

        {/* Debug info for selected players */}
        {selectedPlayers.length > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Geselecteerde spelers ({selectedPlayers.length}): {selectedPlayers.join(', ')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Validatie: {playerSelectionValid ? '✓ Geldig' : '✗ Niet geldig'} 
              {!playerSelectionValid && selectedPlayers.length > 0 && 
                ` (${selectedPlayers.length < 3 ? 'Te weinig' : 'Te veel'} spelers)`
              }
            </Typography>
          </Box>
        )}

        {/* Game State Debug Component */}
        <Box sx={{ mt: 2 }}>
          <GameStateDebug showDetails={false} />
        </Box>
      </Paper>
    </Container>
  );
};

export default GameSetup;
