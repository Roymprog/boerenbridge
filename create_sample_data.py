#!/usr/bin/env python3
"""
Script to add sample completed games for testing the game history feature.
"""

import requests
import json
from datetime import datetime, timedelta
import random

API_BASE = "http://localhost:8000"

def create_player(name):
    """Create a player and return the player data."""
    response = requests.post(f"{API_BASE}/players/", json={"name": name})
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 400 and "already exists" in response.text:
        # Player already exists, get their ID
        players_response = requests.get(f"{API_BASE}/players/")
        players = players_response.json()
        for player in players:
            if player["name"] == name:
                return player
    return None

def create_sample_games():
    """Create some sample completed games."""
    
    # Sample player names
    player_names = [
        "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Iris", "Jack"
    ]
    
    # Create players
    players = {}
    for name in player_names:
        player_data = create_player(name)
        if player_data:
            players[name] = player_data
    
    print(f"Created/found {len(players)} players")
    
    # Create sample games
    sample_games = [
        {
            "players": ["Alice", "Bob", "Charlie", "Diana"],
            "max_cards": 8,
            "rounds_data": [
                # Round 1 (1 card)
                {"bids": [1, 0, 0, 0], "tricks": [1, 0, 0, 0]},
                # Round 2 (2 cards) 
                {"bids": [1, 1, 0, 0], "tricks": [1, 0, 1, 0]},
                # Round 3 (3 cards)
                {"bids": [2, 1, 0, 0], "tricks": [2, 1, 0, 0]},
                # Continue pattern...
            ]
        },
        {
            "players": ["Eve", "Frank", "Grace"],
            "max_cards": 10,
            "rounds_data": []  # We'll generate simple data
        },
        {
            "players": ["Henry", "Iris", "Jack", "Alice", "Bob"],
            "max_cards": 7,
            "rounds_data": []
        }
    ]
    
    for i, game_config in enumerate(sample_games):
        try:
            print(f"\nCreating game {i+1}...")
            
            # Get player IDs
            game_players = [players[name] for name in game_config["players"] if name in players]
            if len(game_players) != len(game_config["players"]):
                print(f"Skipping game {i+1} - missing players")
                continue
            
            player_ids = [p["id"] for p in game_players]
            
            # Create game
            game_data = {
                "player_ids": player_ids,
                "max_cards": game_config["max_cards"]
            }
            
            response = requests.post(f"{API_BASE}/games/", json=game_data)
            if response.status_code != 200:
                print(f"Failed to create game {i+1}: {response.text}")
                continue
                
            game = response.json()
            game_id = game["id"]
            print(f"Created game {game_id}")
            
            # Generate and submit round data
            max_cards = game_config["max_cards"]
            total_rounds = (max_cards * 2) - 1
            
            for round_num in range(1, total_rounds + 1):
                # Calculate cards for this round
                if round_num <= max_cards:
                    cards_count = round_num
                else:
                    cards_count = total_rounds - round_num + 1
                
                # Generate random but valid bids and tricks
                player_count = len(game_players)
                bids = []
                tricks = []
                
                # Generate bids (ensuring last bidder constraint is sometimes violated for realism)
                for j, player in enumerate(game_players):
                    if j == player_count - 1:  # Last bidder
                        current_bid_total = sum(bids)
                        # Sometimes make it equal to cards (invalid), sometimes not
                        if random.random() < 0.3:  # 30% chance of invalid bid
                            bid = max(0, cards_count - current_bid_total)
                        else:
                            possible_bids = [b for b in range(0, cards_count + 1) if b != cards_count - current_bid_total]
                            bid = random.choice(possible_bids) if possible_bids else 0
                    else:
                        bid = random.randint(0, min(cards_count, 3))  # Reasonable bid
                    bids.append(bid)
                
                # Generate tricks (must sum to cards_count)
                remaining_tricks = cards_count
                for j in range(player_count - 1):
                    max_tricks = min(remaining_tricks, bids[j] + 2)  # Somewhat realistic
                    tricks_won = random.randint(0, max_tricks)
                    tricks.append(tricks_won)
                    remaining_tricks -= tricks_won
                
                tricks.append(max(0, remaining_tricks))  # Last player gets remaining
                
                # Submit round
                dealer_position = (round_num - 1) % player_count
                
                round_data = {
                    "round_number": round_num,
                    "cards_count": cards_count,
                    "dealer_position": dealer_position,
                    "player_data": []
                }
                
                for j, player in enumerate(game_players):
                    round_data["player_data"].append({
                        "player_name": player["name"],
                        "bid": bids[j],
                        "tricks_won": tricks[j],
                        "score": 0,  # Will be calculated by backend
                        "running_total": 0  # Will be calculated by backend
                    })
                
                response = requests.post(f"{API_BASE}/games/{game_id}/rounds", json=round_data)
                if response.status_code == 200:
                    print(f"  Submitted round {round_num}")
                else:
                    print(f"  Failed to submit round {round_num}: {response.text}")
                    break
            
            print(f"Completed game {game_id}")
            
        except Exception as e:
            print(f"Error creating game {i+1}: {e}")

if __name__ == "__main__":
    create_sample_games()
    print("\nSample data creation completed!")
