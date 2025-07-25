"""SQLAlchemy database models for Boerenbridge scorekeeping."""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from .database import Base


class GameStatus(str, Enum):
    """Game status enumeration."""
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Player(Base):
    """Player model - stores player names and basic info."""
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    game_players = relationship("GamePlayer", back_populates="player")
    round_scores = relationship("RoundScore", back_populates="player")


class Game(Base):
    """Game model - stores game configuration and metadata."""
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    max_cards = Column(Integer, nullable=False)
    status = Column(SQLEnum(GameStatus), default=GameStatus.ACTIVE, nullable=False)

    # Relationships
    game_players = relationship("GamePlayer", back_populates="game", cascade="all, delete-orphan")
    rounds = relationship("Round", back_populates="game", cascade="all, delete-orphan")


class GamePlayer(Base):
    """Game-player association table with player positions."""
    __tablename__ = "game_players"

    game_id = Column(Integer, ForeignKey("games.id"), primary_key=True)
    player_id = Column(Integer, ForeignKey("players.id"), primary_key=True)
    position = Column(Integer, nullable=False)  # 0-based position in clockwise order

    # Relationships
    game = relationship("Game", back_populates="game_players")
    player = relationship("Player", back_populates="game_players")


class Round(Base):
    """Round model - stores round configuration and metadata."""
    __tablename__ = "rounds"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    round_number = Column(Integer, nullable=False)  # 1-based round number
    cards_count = Column(Integer, nullable=False)   # Number of cards in this round
    dealer_position = Column(Integer, nullable=False)  # 0-based position of dealer

    # Relationships
    game = relationship("Game", back_populates="rounds")
    round_scores = relationship("RoundScore", back_populates="round", cascade="all, delete-orphan")


class RoundScore(Base):
    """Round score model - stores individual player scores for each round."""
    __tablename__ = "round_scores"

    id = Column(Integer, primary_key=True, index=True)
    round_id = Column(Integer, ForeignKey("rounds.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    bid = Column(Integer, nullable=False)           # Player's bid for this round
    tricks_won = Column(Integer, nullable=False)    # Actual tricks won
    score = Column(Integer, nullable=False)         # Points scored this round
    running_total = Column(Integer, nullable=False) # Cumulative score after this round

    # Relationships
    round = relationship("Round", back_populates="round_scores")
    player = relationship("Player", back_populates="round_scores")
