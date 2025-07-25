"""Database CRUD operations for Boerenbridge application."""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, and_, func
from typing import List, Optional, Tuple
from datetime import datetime

from . import models, schemas


class PlayerCRUD:
    """CRUD operations for Player model."""

    @staticmethod
    def get_player(db: Session, player_id: int) -> Optional[models.Player]:
        """Get player by ID."""
        return db.query(models.Player).filter(models.Player.id == player_id).first()

    @staticmethod
    def get_player_by_name(db: Session, name: str) -> Optional[models.Player]:
        """Get player by name."""
        return db.query(models.Player).filter(models.Player.name == name).first()

    @staticmethod
    def get_players(db: Session, skip: int = 0, limit: int = 100) -> List[models.Player]:
        """Get all players with pagination."""
        return db.query(models.Player).order_by(models.Player.name).offset(skip).limit(limit).all()

    @staticmethod
    def create_player(db: Session, player: schemas.PlayerCreate) -> models.Player:
        """Create a new player."""
        db_player = models.Player(name=player.name)
        db.add(db_player)
        db.commit()
        db.refresh(db_player)
        return db_player

    @staticmethod
    def get_or_create_player(db: Session, name: str) -> models.Player:
        """Get player by name or create if doesn't exist."""
        player = PlayerCRUD.get_player_by_name(db, name)
        if not player:
            player_create = schemas.PlayerCreate(name=name)
            player = PlayerCRUD.create_player(db, player_create)
        return player


class GameCRUD:
    """CRUD operations for Game model."""

    @staticmethod
    def create_game(db: Session, game_data: schemas.GameCreate) -> models.Game:
        """Create a new game with players."""
        # Create the game
        db_game = models.Game(max_cards=game_data.max_cards)
        db.add(db_game)
        db.flush()  # Get the game ID without committing

        # Add players to the game
        for position, player_id in enumerate(game_data.player_ids):
            game_player = models.GamePlayer(
                game_id=db_game.id,
                player_id=player_id,
                position=position
            )
            db.add(game_player)

        db.commit()
        db.refresh(db_game)
        return db_game

    @staticmethod
    def get_game(db: Session, game_id: int) -> Optional[models.Game]:
        """Get game by ID with all related data."""
        return (
            db.query(models.Game)
            .options(
                joinedload(models.Game.game_players).joinedload(models.GamePlayer.player),
                joinedload(models.Game.rounds).joinedload(models.Round.round_scores).joinedload(models.RoundScore.player)
            )
            .filter(models.Game.id == game_id)
            .first()
        )

    @staticmethod
    def update_game_status(db: Session, game_id: int, status: schemas.GameStatus) -> Optional[models.Game]:
        """Update game status."""
        db_game = GameCRUD.get_game(db, game_id)
        if db_game:
            db_game.status = status
            db.commit()
            db.refresh(db_game)
        return db_game

    @staticmethod
    def get_games_with_filters(
        db: Session, 
        filters: schemas.GameHistoryFilter
    ) -> Tuple[List[models.Game], int]:
        """Get games with filtering and pagination."""
        query = db.query(models.Game).options(
            joinedload(models.Game.game_players).joinedload(models.GamePlayer.player)
        )

        # Apply filters
        if filters.player_ids:
            # Games that include ALL specified players
            for player_id in filters.player_ids:
                query = query.filter(
                    models.Game.game_players.any(models.GamePlayer.player_id == player_id)
                )

        if filters.start_date:
            query = query.filter(models.Game.created_at >= filters.start_date)

        if filters.end_date:
            # Add 1 day to include the entire end date
            end_date_inclusive = filters.end_date.replace(hour=23, minute=59, second=59)
            query = query.filter(models.Game.created_at <= end_date_inclusive)

        # Count total before pagination
        total_games = query.count()

        # Apply sorting
        if filters.sort_by == "date":
            order_func = desc if filters.sort_order == "desc" else asc
            query = query.order_by(order_func(models.Game.created_at))
        elif filters.sort_by == "winner_score":
            # This would require a complex subquery to get winner scores
            # For now, default to date sorting
            query = query.order_by(desc(models.Game.created_at))

        # Apply pagination
        skip = (filters.page - 1) * filters.page_size
        games = query.offset(skip).limit(filters.page_size).all()

        return games, total_games


class RoundCRUD:
    """CRUD operations for Round model."""

    @staticmethod
    def create_round_with_scores(
        db: Session, 
        game_id: int, 
        round_data: schemas.RoundDataSubmission
    ) -> models.Round:
        """Create a round with all player scores."""
        # Create the round
        db_round = models.Round(
            game_id=game_id,
            round_number=round_data.round_number,
            cards_count=round_data.cards_count,
            dealer_position=round_data.dealer_position
        )
        db.add(db_round)
        db.flush()  # Get the round ID without committing

        # Get previous round totals for running total calculation
        previous_totals = RoundCRUD.get_running_totals(db, game_id, round_data.round_number - 1)

        # Create scores for each player
        for score_data in round_data.scores:
            # Calculate round score
            round_score = ScoreCalculator.calculate_score(score_data.bid, score_data.tricks_won)
            
            # Calculate running total
            previous_total = previous_totals.get(score_data.player_id, 0)
            running_total = previous_total + round_score

            db_score = models.RoundScore(
                round_id=db_round.id,
                player_id=score_data.player_id,
                bid=score_data.bid,
                tricks_won=score_data.tricks_won,
                score=round_score,
                running_total=running_total
            )
            db.add(db_score)

        db.commit()
        db.refresh(db_round)
        return db_round

    @staticmethod
    def get_running_totals(db: Session, game_id: int, through_round: int) -> dict:
        """Get running totals for all players through a specific round."""
        if through_round <= 0:
            return {}

        # Get the latest scores for each player through the specified round
        subquery = (
            db.query(
                models.RoundScore.player_id,
                func.max(models.Round.round_number).label('max_round')
            )
            .join(models.Round)
            .filter(
                models.Round.game_id == game_id,
                models.Round.round_number <= through_round
            )
            .group_by(models.RoundScore.player_id)
            .subquery()
        )

        results = (
            db.query(models.RoundScore.player_id, models.RoundScore.running_total)
            .join(models.Round)
            .join(
                subquery,
                and_(
                    models.RoundScore.player_id == subquery.c.player_id,
                    models.Round.round_number == subquery.c.max_round
                )
            )
            .filter(models.Round.game_id == game_id)
            .all()
        )

        return {player_id: total for player_id, total in results}

    @staticmethod
    def get_game_rounds(db: Session, game_id: int) -> List[models.Round]:
        """Get all rounds for a game."""
        return (
            db.query(models.Round)
            .options(joinedload(models.Round.round_scores).joinedload(models.RoundScore.player))
            .filter(models.Round.game_id == game_id)
            .order_by(models.Round.round_number)
            .all()
        )


class ScoreCalculator:
    """Utility class for score calculations."""

    @staticmethod
    def calculate_score(bid: int, tricks_won: int) -> int:
        """
        Calculate score for a round based on bid and tricks won.
        
        Rules:
        - Correct bid: 10 + (2 * tricks_won)
        - Incorrect bid: -2 * abs(bid - tricks_won)
        """
        if bid == tricks_won:
            # Correct bid
            return 10 + (2 * tricks_won)
        else:
            # Incorrect bid
            return -2 * abs(bid - tricks_won)

    @staticmethod
    def get_winner(players_with_totals: List[Tuple[int, int]]) -> Optional[int]:
        """
        Get the winner (player with highest total score).
        
        Args:
            players_with_totals: List of (player_id, total_score) tuples
            
        Returns:
            Player ID of winner, or None if empty list
        """
        if not players_with_totals:
            return None
        
        return max(players_with_totals, key=lambda x: x[1])[0]


class ScoreboardService:
    """Service for generating scoreboard data."""

    @staticmethod
    def get_scoreboard(db: Session, game_id: int) -> Optional[schemas.ScoreboardResponse]:
        """Generate complete scoreboard for a game."""
        game = GameCRUD.get_game(db, game_id)
        if not game:
            return None

        # Get game players sorted by position
        players = sorted(game.game_players, key=lambda gp: gp.position)
        total_rounds = (game.max_cards * 2) - 1

        # Get all rounds
        rounds = RoundCRUD.get_game_rounds(db, game_id)
        current_round = len(rounds) + 1 if len(rounds) < total_rounds else total_rounds

        # Build player scoreboard data
        player_scoreboard_data = []
        final_totals = []

        for game_player in players:
            player_rounds = [None] * total_rounds
            final_total = 0

            # Fill in completed rounds
            for round_obj in rounds:
                round_index = round_obj.round_number - 1
                
                # Find this player's score for this round
                player_score = next(
                    (rs for rs in round_obj.round_scores if rs.player_id == game_player.player_id),
                    None
                )
                
                if player_score:
                    player_rounds[round_index] = schemas.RoundScoreResponse(
                        id=player_score.id,
                        player_id=player_score.player_id,
                        bid=player_score.bid,
                        tricks_won=player_score.tricks_won,
                        score=player_score.score,
                        running_total=player_score.running_total,
                        player=schemas.PlayerResponse(
                            id=game_player.player.id,
                            name=game_player.player.name,
                            created_at=game_player.player.created_at
                        )
                    )
                    final_total = player_score.running_total

            player_scoreboard_data.append(schemas.PlayerScoreboardData(
                player_id=game_player.player_id,
                player_name=game_player.player.name,
                position=game_player.position,
                rounds=player_rounds,
                final_total=final_total
            ))
            final_totals.append((game_player.player_id, final_total))

        # Determine winner if game is complete
        is_complete = len(rounds) == total_rounds
        winner_id = ScoreCalculator.get_winner(final_totals) if is_complete else None

        return schemas.ScoreboardResponse(
            game_id=game_id,
            max_cards=game.max_cards,
            total_rounds=total_rounds,
            current_round=current_round,
            players=player_scoreboard_data,
            is_complete=is_complete,
            winner_id=winner_id
        )
