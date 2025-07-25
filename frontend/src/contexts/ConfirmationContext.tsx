import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  HelpOutline as QuestionIcon,
} from '@mui/icons-material';

// Types
export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info' | 'question';
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  isLoading: boolean;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => void;
  close: () => void;
}

// Context
const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

// Get icon by severity
const getIcon = (severity: ConfirmationOptions['severity']) => {
  switch (severity) {
    case 'warning':
      return <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
    case 'error':
      return <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />;
    case 'info':
      return <InfoIcon sx={{ fontSize: 48, color: 'info.main' }} />;
    case 'question':
    default:
      return <QuestionIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
  }
};

// Provider Component
export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    options: null,
    isLoading: false,
  });

  const confirm = (options: ConfirmationOptions) => {
    setState({
      isOpen: true,
      options: {
        confirmText: 'Bevestigen',
        cancelText: 'Annuleren',
        severity: 'question',
        confirmColor: 'primary',
        ...options,
      },
      isLoading: false,
    });
  };

  const close = () => {
    setState({
      isOpen: false,
      options: null,
      isLoading: false,
    });
  };

  const handleConfirm = async () => {
    if (!state.options) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await state.options.onConfirm();
      close();
    } catch (error) {
      console.error('Error in confirmation action:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCancel = () => {
    if (state.options?.onCancel) {
      state.options.onCancel();
    }
    close();
  };

  const contextValue: ConfirmationContextType = {
    confirm,
    close,
  };

  return (
    <ConfirmationContext.Provider value={contextValue}>
      {children}
      
      {/* Confirmation Dialog */}
      <Dialog
        open={state.isOpen}
        onClose={state.isLoading ? undefined : handleCancel}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={state.isLoading}
      >
        {state.options && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <Box sx={{ mb: 2 }}>
                {getIcon(state.options.severity)}
              </Box>
              <Typography variant="h5" component="div">
                {state.options.title}
              </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ textAlign: 'center', pt: 0 }}>
              <Typography variant="body1" color="text.secondary">
                {state.options.message}
              </Typography>
            </DialogContent>
            
            <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
              <Button
                onClick={handleCancel}
                disabled={state.isLoading}
                size="large"
              >
                {state.options.cancelText}
              </Button>
              
              <Button
                onClick={handleConfirm}
                color={state.options.confirmColor}
                variant="contained"
                disabled={state.isLoading}
                size="large"
              >
                {state.isLoading ? 'Bezig...' : state.options.confirmText}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </ConfirmationContext.Provider>
  );
};

// Hook
export const useConfirmation = (): ConfirmationContextType => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};
