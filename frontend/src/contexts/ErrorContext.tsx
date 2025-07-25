import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertColor,
  Slide,
  SlideProps,
} from '@mui/material';

// Types
export interface ErrorNotification {
  id: string;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
  action?: React.ReactNode;
}

interface ErrorState {
  notifications: ErrorNotification[];
  isLoading: boolean;
  globalError: string | null;
}

type ErrorAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<ErrorNotification, 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GLOBAL_ERROR'; payload: string | null };

// Context
interface ErrorContextType {
  state: ErrorState;
  showError: (message: string, autoHideDuration?: number) => void;
  showWarning: (message: string, autoHideDuration?: number) => void;
  showSuccess: (message: string, autoHideDuration?: number) => void;
  showInfo: (message: string, autoHideDuration?: number) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Reducer
const initialState: ErrorState = {
  notifications: [],
  isLoading: false,
  globalError: null,
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const id = Math.random().toString(36).substr(2, 9);
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id, ...action.payload }
        ],
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload,
      };
    
    default:
      return state;
  }
}

// Transition component for snackbar
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

// Provider Component
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const showNotification = (
    message: string, 
    severity: AlertColor, 
    autoHideDuration: number = 6000
  ) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { message, severity, autoHideDuration },
    });
  };

  const showError = (message: string, autoHideDuration?: number) => {
    showNotification(message, 'error', autoHideDuration);
  };

  const showWarning = (message: string, autoHideDuration?: number) => {
    showNotification(message, 'warning', autoHideDuration);
  };

  const showSuccess = (message: string, autoHideDuration?: number) => {
    showNotification(message, 'success', autoHideDuration);
  };

  const showInfo = (message: string, autoHideDuration?: number) => {
    showNotification(message, 'info', autoHideDuration);
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setGlobalError = (error: string | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  };

  const handleClose = (id: string) => {
    removeNotification(id);
  };

  const contextValue: ErrorContextType = {
    state,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    removeNotification,
    clearAllNotifications,
    setLoading,
    setGlobalError,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      {state.notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={SlideTransition}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
            action={notification.action}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </ErrorContext.Provider>
  );
};

// Hook
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
