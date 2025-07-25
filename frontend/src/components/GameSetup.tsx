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

const GameSetup: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playerSelectionValid, setPlayerSelectionValid] = useState(false);

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

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Player selection
        return playerSelectionValid;
      case 1: // Round configuration
        return true; // Will be implemented later
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
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Rondes Configuratie
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deze functionaliteit wordt in de volgende stap geïmplementeerd.
              </Typography>
            </Paper>
          )}

          {currentStep === 2 && (
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Spel Starten
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Klaar om het spel te starten!
              </Typography>
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
      </Paper>
    </Container>
  );
};

export default GameSetup;
