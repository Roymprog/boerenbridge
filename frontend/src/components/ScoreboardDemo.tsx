import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  Alert,
  FormControlLabel,
  Switch,
  Slider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { GameProvider } from '../contexts';
import { Scoreboard } from './';

const ScoreboardDemoContent: React.FC = () => {
  const [highlightWinner, setHighlightWinner] = useState(false);
  const [maxHeight, setMaxHeight] = useState(600);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/test-game-state')}
            sx={{ mr: 2 }}
          >
            Terug naar Game State Tester
          </Button>
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Scoreboard Demo
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Dit is een demonstratie van de scoreboard component met mock data.
          Start eerst een spel in de Game State Tester om echte data te zien.
        </Typography>

        {/* Demo Controls */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle1" gutterBottom>
            Demo Instellingen
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={highlightWinner}
                  onChange={(e) => setHighlightWinner(e.target.checked)}
                />
              }
              label="Highlight Winner"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyCompleted}
                  onChange={(e) => setShowOnlyCompleted(e.target.checked)}
                />
              }
              label="Show Only Completed Rounds"
            />
            
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="body2" gutterBottom>
                Max Height: {maxHeight}px
              </Typography>
              <Slider
                value={maxHeight}
                onChange={(_, value) => setMaxHeight(value as number)}
                min={300}
                max={800}
                step={50}
                marks
                size="small"
              />
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Scoreboard */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Om de scoreboard met echte data te zien, ga naar de Game State Tester en start een spel.
          Deze demo toont hoe de component eruitziet zonder data.
        </Alert>

        <Scoreboard 
          highlightWinner={highlightWinner}
          maxHeight={maxHeight}
          showOnlyCompleted={showOnlyCompleted}
          readOnly={true}
        />

        {/* Instructions */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Scoreboard Features:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>🔄 <strong>Horizontaal & Verticaal scrollen:</strong> Ondersteunt veel spelers en rondes</li>
              <li>📊 <strong>Complete score weergave:</strong> Bod, Geslagen slagen, Rondescore, Totaal</li>
              <li>🎯 <strong>Huidige ronde highlight:</strong> Toont duidelijk welke ronde actief is</li>
              <li>🏆 <strong>Winner highlighting:</strong> Markeert de winnaar aan het einde</li>
              <li>👨‍💼 <strong>Dealer indicatie:</strong> Toont wie de dealer is per ronde</li>
              <li>📱 <strong>Responsive design:</strong> Werkt op verschillende schermgroottes</li>
              <li>🎨 <strong>Color coding:</strong> Groene scores voor goede rondes, rode voor slechte</li>
            </ul>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

const ScoreboardDemo: React.FC = () => {
  return (
    <GameProvider>
      <ScoreboardDemoContent />
    </GameProvider>
  );
};

export default ScoreboardDemo;