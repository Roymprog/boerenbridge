import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Components
import { MainMenu, GameSetup, GameHistory, GameStateTester, ScoreboardDemo } from './components';

// Context
import { GameProvider } from './contexts';

// Create a custom theme for the application
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#34495e',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase transformation
        },
      },
    },
  },
});

function App() {
  return (
    <GameProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/new-game" element={<GameSetup />} />
            <Route path="/history" element={<GameHistory />} />
            <Route path="/test-game-state" element={<GameStateTester />} />
            <Route path="/scoreboard-demo" element={<ScoreboardDemo />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </GameProvider>
  );
}

export default App;
