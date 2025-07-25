import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Backdrop,
  CircularProgress,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';

// Types
interface LoadingState {
  isGlobalLoading: boolean;
  loadingMessage: string;
  progress?: number;
  showProgress: boolean;
}

interface LoadingContextType {
  isGlobalLoading: boolean;
  loadingMessage: string;
  progress?: number;
  showProgress: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  startProgressLoading: (message?: string, initialProgress?: number) => void;
  updateProgress: (progress: number) => void;
  setLoadingMessage: (message: string) => void;
}

// Context
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Provider Component
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LoadingState>({
    isGlobalLoading: false,
    loadingMessage: 'Laden...',
    progress: undefined,
    showProgress: false,
  });

  const startLoading = (message: string = 'Laden...') => {
    setState({
      isGlobalLoading: true,
      loadingMessage: message,
      progress: undefined,
      showProgress: false,
    });
  };

  const stopLoading = () => {
    setState(prev => ({
      ...prev,
      isGlobalLoading: false,
      showProgress: false,
      progress: undefined,
    }));
  };

  const startProgressLoading = (message: string = 'Laden...', initialProgress: number = 0) => {
    setState({
      isGlobalLoading: true,
      loadingMessage: message,
      progress: initialProgress,
      showProgress: true,
    });
  };

  const updateProgress = (progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
    }));
  };

  const setLoadingMessage = (message: string) => {
    setState(prev => ({
      ...prev,
      loadingMessage: message,
    }));
  };

  const contextValue: LoadingContextType = {
    isGlobalLoading: state.isGlobalLoading,
    loadingMessage: state.loadingMessage,
    progress: state.progress,
    showProgress: state.showProgress,
    startLoading,
    stopLoading,
    startProgressLoading,
    updateProgress,
    setLoadingMessage,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* Global Loading Overlay */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={state.isGlobalLoading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            color="inherit" 
            size={60}
            thickness={4}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
            {state.loadingMessage}
          </Typography>
          
          {state.showProgress && state.progress !== undefined && (
            <Box sx={{ width: 300, mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={state.progress}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#fff',
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {Math.round(state.progress)}%
              </Typography>
            </Box>
          )}
        </Box>
      </Backdrop>
    </LoadingContext.Provider>
  );
};

// Hook
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
