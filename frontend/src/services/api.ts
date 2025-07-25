import axios from 'axios';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API Helper Functions
export const playerAPI = {
  // Get all players
  getAll: () => api.get('/players/'),
  
  // Create a new player
  create: (name: string) => api.post('/players/', { name }),
};

export const gameAPI = {
  // Create a new game
  create: (players: string[], maxCards: number) => 
    api.post('/games', { players, max_cards: maxCards }),
  
  // Get game by ID
  getById: (gameId: number) => api.get(`/games/${gameId}`),
  
  // Get all games with optional filtering
  getAll: (params?: any) => api.get('/games', { params }),
  
  // Submit round data
  submitRound: (gameId: string, roundData: any) =>
    api.post(`/games/${gameId}/rounds`, roundData),
  
  // Get game scoreboard
  getScoreboard: (gameId: string) =>
    api.get(`/games/${gameId}/scoreboard`),
};

// Convenience functions for common operations
export const createGame = async (players: string[], maxCards: number) => {
  const response = await gameAPI.create(players, maxCards);
  return response.data;
};

export const submitRound = async (gameId: string, roundData: any) => {
  const response = await gameAPI.submitRound(gameId, roundData);
  return response.data;
};

export const getPlayers = async () => {
  const response = await playerAPI.getAll();
  return response.data;
};

export const createPlayer = async (name: string) => {
  const response = await playerAPI.create(name);
  return response.data;
};

export { api, API_URL };
export default api;
