import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Components
import { 
  MainMenu, 
  GameSetup, 
  GameScreen, 
  GameHistory, 
  GameDetail, 
  ErrorBoundary 
} from './components';

// Context
import { 
  GameProvider,
  ErrorProvider,
  LoadingProvider,
  ConfirmationProvider
} from './contexts';

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
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <ErrorProvider>
          <LoadingProvider>
            <ConfirmationProvider>
              <GameProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<MainMenu />} />
                    <Route path="/new-game" element={<GameSetup />} />
                    <Route path="/game" element={<GameScreen />} />
                    <Route path="/game/:gameId" element={<GameScreen />} />
                    <Route path="/history" element={<GameHistory />} />
                    <Route path="/history/:gameId" element={<GameDetail />} />
                  </Routes>
                </Router>
              </GameProvider>
            </ConfirmationProvider>
          </LoadingProvider>
        </ErrorProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
