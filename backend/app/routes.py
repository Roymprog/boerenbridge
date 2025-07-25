"""API routes for Boerenbridge scorekeeping application."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from . import schemas, crud
from .database import get_db

# Create routers
players_router = APIRouter(prefix="/players", tags=["players"])
games_router = APIRouter(prefix="/games", tags=["games"])


# Player endpoints
@players_router.get("/", response_model=List[schemas.PlayerResponse])
def get_players(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all player names for dropdown/selection."""
    players = crud.PlayerCRUD.get_players(db, skip=skip, limit=limit)
    return players


@players_router.post("/", response_model=schemas.PlayerResponse)
def create_player(
    player: schemas.PlayerCreate,
    db: Session = Depends(get_db)
):
    """Create a new player."""
    # Check if player already exists
    existing_player = crud.PlayerCRUD.get_player_by_name(db, player.name)
    if existing_player:
        raise HTTPException(
            status_code=400,
            detail=f"Player with name '{player.name}' already exists"
        )
    
    return crud.PlayerCRUD.create_player(db, player)


# Game endpoints
@games_router.post("/", response_model=schemas.GameResponse)
def create_game(
    game_data: schemas.GameCreate,
    db: Session = Depends(get_db)
):
    """Create a new game with players."""
    # Validate all player IDs exist
    for player_id in game_data.player_ids:
        player = crud.PlayerCRUD.get_player(db, player_id)
        if not player:
            raise HTTPException(
                status_code=400,
                detail=f"Player with ID {player_id} not found"
            )
    
    # Validate max_cards based on number of players
    num_players = len(game_data.player_ids)
    max_possible_cards = 52 // num_players
    if game_data.max_cards > max_possible_cards:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum cards ({game_data.max_cards}) exceeds limit for {num_players} players ({max_possible_cards})"
        )
    
    return crud.GameCRUD.create_game(db, game_data)


@games_router.get("/{game_id}", response_model=schemas.GameResponse)
def get_game(
    game_id: int,
    db: Session = Depends(get_db)
):
    """Get game details by ID."""
    game = crud.GameCRUD.get_game(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@games_router.get("/", response_model=schemas.GameHistoryResponse)
def get_games_history(
    player_ids: Optional[List[int]] = Query(None),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_winner_score: Optional[int] = None,
    max_winner_score: Optional[int] = None,
    sort_by: str = Query(default="date", pattern="^(date|winner_score)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get game history with filtering and sorting."""
    filters = schemas.GameHistoryFilter(
        player_ids=player_ids,
        start_date=start_date,
        end_date=end_date,
        min_winner_score=min_winner_score,
        max_winner_score=max_winner_score,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    
    games, total_games = crud.GameCRUD.get_games_with_filters(db, filters)
    total_pages = (total_games + page_size - 1) // page_size
    
    # Convert to GameSummary format
    game_summaries = []
    for game in games:
        # Get final scores and winner if game is completed
        final_scores = None
        winner_id = None
        
        if game.status == schemas.GameStatus.COMPLETED:
            scoreboard = crud.ScoreboardService.get_scoreboard(db, game.id)
            if scoreboard and scoreboard.is_complete:
                final_scores = [p.final_total for p in scoreboard.players]
                winner_id = scoreboard.winner_id
        
        game_summary = schemas.GameSummary(
            id=game.id,
            created_at=game.created_at,
            status=game.status,
            max_cards=game.max_cards,
            players=[schemas.PlayerResponse(
                id=gp.player.id,
                name=gp.player.name,
                created_at=gp.player.created_at
            ) for gp in sorted(game.game_players, key=lambda x: x.position)],
            final_scores=final_scores,
            winner_id=winner_id
        )
        game_summaries.append(game_summary)
    
    return schemas.GameHistoryResponse(
        games=game_summaries,
        total_games=total_games,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@games_router.post("/{game_id}/rounds", response_model=schemas.RoundResponse)
def submit_round_data(
    game_id: int,
    round_data: schemas.RoundDataSubmission,
    db: Session = Depends(get_db)
):
    """Submit round data (bids and tricks) for a game."""
    # Validate game exists
    game = crud.GameCRUD.get_game(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.status != schemas.GameStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Game is not active")
    
    # Validate round data
    total_players = len(game.game_players)
    if not round_data.validate_scores(total_players):
        raise HTTPException(
            status_code=400,
            detail="Invalid round data: total tricks must equal cards count and all players must have scores"
        )
    
    # Validate all player IDs belong to this game
    game_player_ids = {gp.player_id for gp in game.game_players}
    round_player_ids = {score.player_id for score in round_data.scores}
    if round_player_ids != game_player_ids:
        raise HTTPException(
            status_code=400,
            detail="Round scores must include all game players"
        )
    
    # Validate dealer position
    if round_data.dealer_position >= total_players:
        raise HTTPException(
            status_code=400,
            detail=f"Dealer position ({round_data.dealer_position}) exceeds number of players ({total_players})"
        )
    
    # Check if this is the final round
    total_rounds = (game.max_cards * 2) - 1
    is_final_round = round_data.round_number == total_rounds
    
    # Create the round with scores
    new_round = crud.RoundCRUD.create_round_with_scores(db, game_id, round_data)
    
    # If this is the final round, mark game as completed
    if is_final_round:
        crud.GameCRUD.update_game_status(db, game_id, schemas.GameStatus.COMPLETED)
    
    return new_round


@games_router.get("/{game_id}/scoreboard", response_model=schemas.ScoreboardResponse)
def get_game_scoreboard(
    game_id: int,
    db: Session = Depends(get_db)
):
    """Get current scoreboard for a game."""
    scoreboard = crud.ScoreboardService.get_scoreboard(db, game_id)
    if not scoreboard:
        raise HTTPException(status_code=404, detail="Game not found")
    return scoreboard


# Health check endpoint
@games_router.get("/health", response_model=schemas.HealthResponse)
def health_check():
    """Health check endpoint."""
    return schemas.HealthResponse(
        status="healthy",
        service="boerenbridge-api",
        timestamp=datetime.now()
    )
