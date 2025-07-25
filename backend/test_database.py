"""Test script for database connection and basic CRUD operations."""

import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, schemas, crud
from app.models import Base

def test_database_connection():
    """Test basic database connection."""
    print("Testing database connection...")
    try:
        # Test connection
        with engine.connect() as connection:
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_crud_operations():
    """Test basic CRUD operations."""
    print("\nTesting CRUD operations...")
    
    db = SessionLocal()
    try:
        # Test Player CRUD
        print("Testing Player CRUD...")
        
        # Create a player with unique name
        import uuid
        unique_suffix = str(uuid.uuid4())[:8]
        player_data = schemas.PlayerCreate(name=f"Test Player {unique_suffix}")
        player = crud.PlayerCRUD.create_player(db, player_data)
        print(f"✅ Created player: {player.name} (ID: {player.id})")
        
        # Get player by ID
        retrieved_player = crud.PlayerCRUD.get_player(db, player.id)
        assert retrieved_player.name == f"Test Player {unique_suffix}"
        print(f"✅ Retrieved player by ID: {retrieved_player.name}")
        
        # Get player by name
        player_by_name = crud.PlayerCRUD.get_player_by_name(db, f"Test Player {unique_suffix}")
        assert player_by_name.id == player.id
        print(f"✅ Retrieved player by name: {player_by_name.name}")
        
        # Create additional players for game testing
        player2_data = schemas.PlayerCreate(name=f"Test Player 2 {unique_suffix}")
        player2 = crud.PlayerCRUD.create_player(db, player2_data)
        
        player3_data = schemas.PlayerCreate(name=f"Test Player 3 {unique_suffix}")
        player3 = crud.PlayerCRUD.create_player(db, player3_data)
        
        # Test Game CRUD
        print("\nTesting Game CRUD...")
        
        # Create a game
        game_data = schemas.GameCreate(
            max_cards=10,
            player_ids=[player.id, player2.id, player3.id]
        )
        game = crud.GameCRUD.create_game(db, game_data)
        print(f"✅ Created game: ID {game.id}, max_cards: {game.max_cards}")
        
        # Get game by ID
        retrieved_game = crud.GameCRUD.get_game(db, game.id)
        assert len(retrieved_game.game_players) == 3
        print(f"✅ Retrieved game with {len(retrieved_game.game_players)} players")
        
        # Test Round and Scoring
        print("\nTesting Round CRUD and Scoring...")
        
        # Create a round with scores
        round_data = schemas.RoundDataSubmission(
            round_number=1,
            cards_count=1,
            dealer_position=0,
            scores=[
                schemas.RoundScoreCreate(player_id=player.id, bid=1, tricks_won=1),
                schemas.RoundScoreCreate(player_id=player2.id, bid=0, tricks_won=0),
                schemas.RoundScoreCreate(player_id=player3.id, bid=0, tricks_won=0),
            ]
        )
        
        # Validate the round data
        assert round_data.validate_scores(3), "Round validation should pass"
        
        # Create the round
        round_obj = crud.RoundCRUD.create_round_with_scores(db, game.id, round_data)
        print(f"✅ Created round {round_obj.round_number} with {len(round_obj.round_scores)} scores")
        
        # Test scoring calculations
        print("\nTesting scoring calculations...")
        
        # Test correct bid scoring
        correct_score = crud.ScoreCalculator.calculate_score(1, 1)
        assert correct_score == 12, f"Expected 12, got {correct_score}"  # 10 + (2 * 1)
        print(f"✅ Correct bid score calculation: {correct_score}")
        
        # Test incorrect bid scoring
        incorrect_score = crud.ScoreCalculator.calculate_score(2, 1)
        assert incorrect_score == -2, f"Expected -2, got {incorrect_score}"  # -2 * abs(2-1)
        print(f"✅ Incorrect bid score calculation: {incorrect_score}")
        
        # Test scoreboard generation
        print("\nTesting scoreboard generation...")
        scoreboard = crud.ScoreboardService.get_scoreboard(db, game.id)
        assert scoreboard is not None
        assert len(scoreboard.players) == 3
        assert scoreboard.current_round == 2  # Next round after the one we created
        print(f"✅ Generated scoreboard with {len(scoreboard.players)} players")
        
        # Verify running totals
        for player_data in scoreboard.players:
            if player_data.player_id == player.id:
                # Player bid 1 and got 1: 10 + (2 * 1) = 12
                assert player_data.final_total == 12, f"Expected 12, got {player_data.final_total}"
                print(f"✅ Player {player_data.player_name} running total: {player_data.final_total}")
            else:
                # Players bid 0 and got 0: 10 + (2 * 0) = 10
                assert player_data.final_total == 10, f"Expected 10, got {player_data.final_total}"
                print(f"✅ Player {player_data.player_name} running total: {player_data.final_total}")
        
        print("\n✅ All CRUD operations completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ CRUD operations failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

def main():
    """Run all tests."""
    print("Starting database and CRUD tests...\n")
    
    # Test database connection
    if not test_database_connection():
        return False
    
    # Test CRUD operations
    if not test_crud_operations():
        return False
    
    print("\n🎉 All tests passed successfully!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
