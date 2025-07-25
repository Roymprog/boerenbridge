import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  Casino as CasinoIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface RoundConfigurationProps {
  playerCount: number;
  selectedMaxCards: number;
  onMaxCardsChange: (maxCards: number) => void;
  onValidationChange: (isValid: boolean) => void;
}

const RoundConfiguration: React.FC<RoundConfigurationProps> = ({
  playerCount,
  selectedMaxCards,
  onMaxCardsChange,
  onValidationChange
}) => {
  const [validOptions, setValidOptions] = useState<number[]>([]);

  // Calculate valid max cards options
  useEffect(() => {
    const minCards = 5;
    const maxCards = Math.floor(52 / playerCount);
    
    const options: number[] = [];
    for (let i = minCards; i <= maxCards; i++) {
      options.push(i);
    }
    
    setValidOptions(options);
    
    // Set default value if current selection is invalid
    if (!options.includes(selectedMaxCards)) {
      if (options.length > 0) {
        // Default to middle option, or closest to 10 if available
        const defaultValue = options.includes(10) ? 10 : options[Math.floor(options.length / 2)];
        onMaxCardsChange(defaultValue);
      }
    }
  }, [playerCount, selectedMaxCards, onMaxCardsChange]);

  // Update validation state
  useEffect(() => {
    const isValid = validOptions.includes(selectedMaxCards) && validOptions.length > 0;
    onValidationChange(isValid);
  }, [selectedMaxCards, validOptions, onValidationChange]);

  const calculateRounds = (maxCards: number): number => {
    return (maxCards * 2) - 1;
  };

  const generateRoundProgression = (maxCards: number): string => {
    const progression: number[] = [];
    
    // Ascending: 1 to maxCards
    for (let i = 1; i <= maxCards; i++) {
      progression.push(i);
    }
    
    // Descending: (maxCards-1) to 1
    for (let i = maxCards - 1; i >= 1; i--) {
      progression.push(i);
    }
    
    return progression.join(' → ');
  };

  if (playerCount < 3) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Selecteer eerst minimaal 3 spelers om de ronde configuratie in te stellen.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CasinoIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h6">
          Ronde Configuratie
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="max-cards-label">Maximum Aantal Kaarten</InputLabel>
            <Select
              labelId="max-cards-label"
              value={selectedMaxCards || ''}
              label="Maximum Aantal Kaarten"
              onChange={(e) => onMaxCardsChange(Number(e.target.value))}
              disabled={validOptions.length === 0}
            >
              {validOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option} kaarten
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <InfoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              Bereik: 5 tot {Math.floor(52 / playerCount)} kaarten (52 ÷ {playerCount} spelers)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          {selectedMaxCards && validOptions.includes(selectedMaxCards) && (
            <Card elevation={1} sx={{ bgcolor: 'primary.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" color="primary.main">
                    Spel Overzicht
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Aantal rondes:
                  </Typography>
                  <Chip 
                    label={`${calculateRounds(selectedMaxCards)} rondes`}
                    color="primary"
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Spelers:
                  </Typography>
                  <Chip 
                    icon={<GroupIcon />}
                    label={`${playerCount} spelers`}
                    color="secondary"
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ronde progressie:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {generateRoundProgression(selectedMaxCards)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {selectedMaxCards && validOptions.includes(selectedMaxCards) && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Spelverloop:</strong> Het spel begint met 1 kaart per speler en gaat omhoog tot {selectedMaxCards} kaarten, 
            daarna weer omlaag naar 1 kaart. De dealer roteert elke ronde met de klok mee.
          </Typography>
        </Alert>
      )}

      {validOptions.length === 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Fout: Geen geldige kaart opties beschikbaar voor {playerCount} spelers. 
            Controleer het aantal spelers (minimaal 3, maximaal 10).
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default RoundConfiguration;
