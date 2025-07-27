#!/usr/bin/env python3
"""
Test script to create a complete game scenario for testing the continue game feature.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def create_players():
    """Create test players."""
    players = ["TestUser1", "TestUser2", "TestUser3"]
    player_ids = []
    
    for name in players:
        try:
            response = requests.post(f"{BASE_URL}/players", json={"name": name})
            if response.status_code == 200:
                player_data = response.json()
                player_ids.append(player_data["id"])
                print(f"Created/found player: {name} (ID: {player_data['id']})")
            elif response.status_code == 400:
                # Player already exists, get the ID
                response = requests.get(f"{BASE_URL}/players")
                if response.status_code == 200:
                    existing_players = response.json()
                    for player in existing_players:
                        if player["name"] == name:
                            player_ids.append(player["id"])
                            print(f"Found existing player: {name} (ID: {player['id']})")
                            break
        except Exception as e:
            print(f"Error creating player {name}: {e}")
    
    return player_ids

def create_game_with_rounds():
    """Create a game with some completed rounds."""
    player_ids = create_players()
    if len(player_ids) < 3:
        print("Not enough players created")
        return None
    
    # Create game
    game_data = {
        "player_ids": player_ids,
        "max_cards": 5
    }
    
    response = requests.post(f"{BASE_URL}/games", json=game_data)
    if response.status_code != 200:
        print(f"Failed to create game: {response.text}")
        return None
    
    game = response.json()
    game_id = game["id"]
    print(f"Created game {game_id}")
    
    # Add first round
    round_data = {
        "round_number": 1,
        "cards_count": 1,
        "dealer_position": 0,
        "scores": [
            {"player_id": player_ids[0], "bid": 1, "tricks_won": 1},
            {"player_id": player_ids[1], "bid": 0, "tricks_won": 0},
            {"player_id": player_ids[2], "bid": 0, "tricks_won": 0}
        ]
    }
    
    response = requests.post(f"{BASE_URL}/games/{game_id}/rounds", json=round_data)
    if response.status_code == 200:
        print("Added round 1")
    else:
        print(f"Failed to add round 1: {response.text}")
    
    # Add second round  
    round_data = {
        "round_number": 2,
        "cards_count": 2,
        "dealer_position": 1,
        "scores": [
            {"player_id": player_ids[0], "bid": 1, "tricks_won": 0},
            {"player_id": player_ids[1], "bid": 1, "tricks_won": 2},
            {"player_id": player_ids[2], "bid": 0, "tricks_won": 0}
        ]
    }
    
    response = requests.post(f"{BASE_URL}/games/{game_id}/rounds", json=round_data)
    if response.status_code == 200:
        print("Added round 2")
    else:
        print(f"Failed to add round 2: {response.text}")
    
    return game_id

def create_completed_game():
    """Create a completed game."""
    player_ids = create_players()
    if len(player_ids) < 3:
        print("Not enough players created")
        return None
    
    # Create game with max_cards = 5 (so total rounds = 9)
    game_data = {
        "player_ids": player_ids,
        "max_cards": 5
    }
    
    response = requests.post(f"{BASE_URL}/games", json=game_data)
    if response.status_code != 200:
        print(f"Failed to create completed game: {response.text}")
        return None
    
    game = response.json()
    game_id = game["id"]
    print(f"Created completed game {game_id}")
    
    # Add all 9 rounds to complete the game
    rounds = [
        {"round_number": 1, "cards_count": 1, "dealer_position": 0},
        {"round_number": 2, "cards_count": 2, "dealer_position": 1},
        {"round_number": 3, "cards_count": 3, "dealer_position": 2},
        {"round_number": 4, "cards_count": 4, "dealer_position": 0},
        {"round_number": 5, "cards_count": 5, "dealer_position": 1},
        {"round_number": 6, "cards_count": 4, "dealer_position": 2},
        {"round_number": 7, "cards_count": 3, "dealer_position": 0},
        {"round_number": 8, "cards_count": 2, "dealer_position": 1},
        {"round_number": 9, "cards_count": 1, "dealer_position": 2}
    ]
    
    for i, round_info in enumerate(rounds):
        round_data = {
            "round_number": round_info["round_number"],
            "cards_count": round_info["cards_count"],
            "dealer_position": round_info["dealer_position"],
            "scores": [
                {"player_id": player_ids[0], "bid": 1, "tricks_won": 1 if i % 2 == 0 else 0},
                {"player_id": player_ids[1], "bid": 0, "tricks_won": round_info["cards_count"] - (1 if i % 2 == 0 else 0) - (1 if i % 3 == 0 else 0)},
                {"player_id": player_ids[2], "bid": 0, "tricks_won": 1 if i % 3 == 0 else 0}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/games/{game_id}/rounds", json=round_data)
        if response.status_code == 200:
            print(f"Added round {round_info['round_number']}")
        else:
            print(f"Failed to add round {round_info['round_number']}: {response.text}")
    
    return game_id

if __name__ == "__main__":
    print("Creating test scenarios for continue game feature...")
    
    # Create active game with some rounds
    active_game_id = create_game_with_rounds()
    if active_game_id:
        print(f"\n✅ Active game created: {active_game_id}")
        print(f"   Test URL: http://localhost:3000/game/{active_game_id}")
    
    # Create completed game
    completed_game_id = create_completed_game()
    if completed_game_id:
        print(f"\n✅ Completed game created: {completed_game_id}")
        print(f"   Test URL: http://localhost:3000/history/{completed_game_id}")
    
    print(f"\n🌐 Frontend URL: http://localhost:3000")
    print(f"🌐 Game History: http://localhost:3000/history")
