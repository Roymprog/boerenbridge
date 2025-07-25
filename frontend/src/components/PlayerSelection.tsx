import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { playerAPI } from '../services/api';
import { useError } from '../contexts';

interface Player {
  id: number;
  name: string;
}

interface PlayerSelectionProps {
  selectedPlayers: string[];
  onPlayersChange: (players: string[]) => void;
  onValidationChange?: (isValid: boolean) => void;
  initialPlayers?: string[]; // New prop for pre-populated players
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({ 
  selectedPlayers, 
  onPlayersChange, 
  onValidationChange,
  initialPlayers = []
}) => {
  const { showError, showSuccess } = useError();
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<string[]>([]);

  // Fetch players from API
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await playerAPI.getAll();
      setAvailablePlayers(response.data);
    } catch (err: any) {
      showError('Fout bij ophalen van spelers: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter players based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlayers([]);
      return;
    }

    const playerNames = availablePlayers.map(p => p.name);
    const filtered = playerNames.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedPlayers.includes(name)
    );

    // If search term doesn't match any existing player, include it as a new option
    if (!filtered.includes(searchTerm) && !selectedPlayers.includes(searchTerm)) {
      filtered.unshift(searchTerm); // Add to beginning
    }

    setFilteredPlayers(filtered);
  }, [searchTerm, availablePlayers, selectedPlayers]);

  // Load players on component mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  // Handle initial players (e.g., from EndGame component)
  useEffect(() => {
    if (initialPlayers.length > 0 && selectedPlayers.length === 0) {
      onPlayersChange(initialPlayers);
    }
  }, [initialPlayers, selectedPlayers.length, onPlayersChange]);

  const handleAddPlayer = (playerName: string) => {
    if (!playerName.trim()) return;
    
    const trimmedName = playerName.trim();
    if (selectedPlayers.includes(trimmedName)) {
      showError(`${trimmedName} is al toegevoegd`);
      return;
    }
    if (selectedPlayers.length >= 10) {
      showError('Maximum van 10 spelers bereikt');
      return;
    }

    const newPlayers = [...selectedPlayers, trimmedName];
    onPlayersChange(newPlayers);
    setSearchTerm('');
    showSuccess(`${trimmedName} toegevoegd`);
  };

  const handleRemovePlayer = (playerName: string) => {
    const newPlayers = selectedPlayers.filter(p => p !== playerName);
    onPlayersChange(newPlayers);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      event.preventDefault();
      handleAddPlayer(searchTerm);
    }
  };

  const handleAddMultiplePlayers = () => {
    const playersToAdd = filteredPlayers.slice(0, Math.min(
      filteredPlayers.length, 
      10 - selectedPlayers.length
    ));
    
    const newPlayers = [...selectedPlayers, ...playersToAdd];
    onPlayersChange(newPlayers);
    setSearchTerm('');
  };

  const getValidationMessage = () => {
    if (selectedPlayers.length < 3) {
      return {
        type: 'warning' as const,
        message: `Minimum 3 spelers vereist (${selectedPlayers.length}/3)`
      };
    }
    if (selectedPlayers.length > 10) {
      return {
        type: 'error' as const,
        message: `Maximum 10 spelers toegestaan (${selectedPlayers.length}/10)`
      };
    }
    return {
      type: 'success' as const,
      message: `${selectedPlayers.length} spelers geselecteerd`
    };
  };

  const validation = getValidationMessage();
  const isValid = selectedPlayers.length >= 3 && selectedPlayers.length <= 10;

  // Notify parent component about validation changes
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">
          Spelers Selecteren
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Autocomplete
          freeSolo
          options={filteredPlayers}
          inputValue={searchTerm}
          onInputChange={(event, newValue) => setSearchTerm(newValue)}
          onChange={(event, value) => {
            if (value && typeof value === 'string') {
              handleAddPlayer(value);
            }
          }}
          disabled={selectedPlayers.length >= 10}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Voeg speler toe"
              placeholder="Type naam en druk Enter of selecteer uit lijst"
              variant="outlined"
              fullWidth
              onKeyPress={handleKeyPress}
              disabled={selectedPlayers.length >= 10}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <PersonAddIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                <Typography>
                  {availablePlayers.some(p => p.name === option) ? option : `${option} (nieuw)`}
                </Typography>
              </Box>
            </li>
          )}
          ListboxProps={{
            style: { maxHeight: 200 }
          }}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Type een naam om te zoeken in bestaande spelers of voeg een nieuwe speler toe.
          Gebruik Enter om toe te voegen, of klik op een suggestie.
        </Typography>

        {filteredPlayers.length > 1 && selectedPlayers.length < 8 && (
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleAddMultiplePlayers}
              disabled={selectedPlayers.length >= 10}
            >
              Voeg alle {Math.min(filteredPlayers.length, 10 - selectedPlayers.length)} gevonden spelers toe
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Alert severity={validation.type} sx={{ mb: 2 }}>
          {validation.message}
        </Alert>

        {selectedPlayers.length > 0 ? (
          <List dense>
            {selectedPlayers.map((playerName, index) => (
              <ListItem
                key={playerName}
                sx={{
                  bgcolor: index % 2 === 0 ? 'grey.50' : 'transparent',
                  borderRadius: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={`${index + 1}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 2, minWidth: 40 }}
                      />
                      <Typography variant="body1">{playerName}</Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="verwijder speler"
                    onClick={() => handleRemovePlayer(playerName)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <GroupIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Nog geen spelers geselecteerd
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {selectedPlayers.length}/10 spelers • Minimum: 3 spelers
        </Typography>
        
        <Button
          variant="text"
          size="small"
          onClick={fetchPlayers}
          disabled={loading}
        >
          {loading ? 'Laden...' : 'Vernieuwen'}
        </Button>
      </Box>
    </Paper>
  );
};

export default PlayerSelection;
