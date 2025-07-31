// Game History Type Definitions

export interface GameHistoryFilter {
  player_ids?: number[];
  start_date?: string;
  end_date?: string;
  min_winner_score?: number;
  max_winner_score?: number;
  sort_by: 'date' | 'winner_score';
  sort_order: 'asc' | 'desc';
  page: number;
  page_size: number;
}

export interface Player {
  id: number;
  name: string;
  created_at?: string;
}

export interface GameSummary {
  id: number;
  created_at: string;
  status: 'active' | 'completed' | 'abandoned';
  max_cards: number;
  players: Player[];
  final_scores?: number[];
  winner_id?: number;
}

export interface GameHistoryResponse {
  games: GameSummary[];
  total_games: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GameHistoryFilters {
  selectedPlayers: number[];
  startDate: string | null;
  endDate: string | null;
  minWinnerScore: number;
  maxWinnerScore: number;
  sortBy: 'date' | 'winner_score';
  sortOrder: 'asc' | 'desc';
}
