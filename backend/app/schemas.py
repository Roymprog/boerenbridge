"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum


class GameStatus(str, Enum):
    """Game status enumeration."""
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


# Player schemas
class PlayerBase(BaseModel):
    """Base player schema."""
    name: str = Field(..., min_length=1, max_length=100, description="Player name")


class PlayerCreate(PlayerBase):
    """Schema for creating a new player."""
    pass


class PlayerResponse(PlayerBase):
    """Schema for player response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# Game schemas
class GameBase(BaseModel):
    """Base game schema."""
    max_cards: int = Field(..., ge=5, le=17, description="Maximum cards in peak round")


class GameCreate(GameBase):
    """Schema for creating a new game."""
    player_ids: List[int] = Field(..., min_length=3, max_length=10, description="List of player IDs")


class GamePlayerResponse(BaseModel):
    """Schema for game-player association response."""
    model_config = ConfigDict(from_attributes=True)
    
    player_id: int
    position: int
    player: PlayerResponse


class GameResponse(GameBase):
    """Schema for game response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    status: GameStatus
    game_players: List[GamePlayerResponse]


class GameSummary(BaseModel):
    """Schema for game summary in history list."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    status: GameStatus
    max_cards: int
    players: List[PlayerResponse]
    final_scores: Optional[List[int]] = None
    winner_id: Optional[int] = None


# Round schemas
class RoundBase(BaseModel):
    """Base round schema."""
    round_number: int = Field(..., ge=1, description="Round number (1-based)")
    cards_count: int = Field(..., ge=1, le=17, description="Number of cards in this round")
    dealer_position: int = Field(..., ge=0, description="Dealer position (0-based)")


class RoundCreate(RoundBase):
    """Schema for creating a new round."""
    pass


class RoundScoreBase(BaseModel):
    """Base round score schema."""
    player_id: int
    bid: int = Field(..., ge=0, description="Player's bid for this round")
    tricks_won: int = Field(..., ge=0, description="Actual tricks won")


class RoundScoreCreate(RoundScoreBase):
    """Schema for creating round scores."""
    pass


class RoundScoreResponse(RoundScoreBase):
    """Schema for round score response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    score: int
    running_total: int
    player: PlayerResponse


class RoundDataSubmission(BaseModel):
    """Schema for submitting complete round data."""
    round_number: int = Field(..., ge=1, description="Round number (1-based)")
    cards_count: int = Field(..., ge=1, le=17, description="Number of cards in this round")
    dealer_position: int = Field(..., ge=0, description="Dealer position (0-based)")
    scores: List[RoundScoreCreate] = Field(..., description="List of player scores for this round")

    def validate_scores(self, total_players: int) -> bool:
        """Validate that all players have scores and tricks sum equals cards."""
        if len(self.scores) != total_players:
            return False
        
        total_tricks = sum(score.tricks_won for score in self.scores)
        return total_tricks == self.cards_count


class RoundResponse(RoundBase):
    """Schema for round response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    game_id: int
    round_scores: List[RoundScoreResponse]


# Scoreboard schemas
class PlayerScoreboardData(BaseModel):
    """Player's data for scoreboard display."""
    player_id: int
    player_name: str
    position: int
    rounds: List[Optional[RoundScoreResponse]]  # Indexed by round number - 1
    final_total: int


class ScoreboardResponse(BaseModel):
    """Complete scoreboard response."""
    game_id: int
    max_cards: int
    total_rounds: int
    current_round: int
    players: List[PlayerScoreboardData]
    is_complete: bool
    winner_id: Optional[int] = None


# Game history schemas
class GameHistoryFilter(BaseModel):
    """Schema for game history filtering."""
    player_ids: Optional[List[int]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_winner_score: Optional[int] = None
    max_winner_score: Optional[int] = None
    sort_by: str = Field(default="date", pattern="^(date|winner_score)$")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class GameHistoryResponse(BaseModel):
    """Schema for game history response."""
    games: List[GameSummary]
    total_games: int
    page: int
    page_size: int
    total_pages: int


# Utility schemas
class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    timestamp: datetime


class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
    error_code: Optional[str] = None
