Developer Specification: Boerenbridge Scorekeeping Web Application
1. Executive Summary

This document outlines the requirements for a web-based application designed to keep score for the card game Boerenbridge. The application will be a desktop-first, single-page application (SPA) allowing users to set up games, track scores per round, and view a persistent history of past games. The system is designed to be open and anonymous, with no user authentication.

2. System Architecture

Frontend: A web-based client application (using React) responsible for all user interface elements and interactions.
Backend: A server-side API (Python/FastAPI) that will handle business logic, interact with the database, and serve data to the frontend.
Database: A PostgreSQL database to persist all player names and game data.
3. Functional Requirements

3.1. Main Menu

The application's entry point is a simple main menu.
It must contain two primary actions:
A button to "Nieuw Spel Starten".
A button to "Historie Bekijken".
3.2. Game Setup

Player Selection:
The user can add 3 to 10 players.
Player names are entered via a filterable dropdown/combobox.
This input field must query the backend for a list of all previously used player names to populate the dropdown.
The user can type a new name not present in the list, which will be added to the database upon game completion.
Round Configuration:
After confirming players, the user must select the maximum number of cards to be played in the peak round.
This is presented as a dropdown menu.
The options are dynamically calculated based on the number of players (N):
Minimum value: 5
Maximum value: floor(52 / N)
The total number of rounds will be (max_cards * 2) - 1. For example, choosing 10 cards results in 19 rounds (1->10->1).
3.3. Game Screen & Score Input

The main game view consists of a persistent, real-time scorebord and an input area for the current round.
Dealer Tracking: The application must internally track the current dealer for each round, rotating clockwise among players.
Bidding Phase:
For the current round, the UI must present input fields for each player's bid, ordered clockwise starting from the player left of the dealer.
The input for a bid is a filterable dropdown menu, allowing both selection and numeric typing. Options range from 0 to the number of cards in the current round.
Error Handling: For the last bidder, the application must prevent a bid that would make the total bids equal to the number of cards in the round. The invalid bid option in the dropdown must be visually marked in red and be unselectable.
Trick (Slagen) Input Phase:
After bids are entered, the UI will present input fields for the number of tricks each player won.
A running total of tricks entered for the round must be displayed.
Error Handling: The application must validate that the sum of tricks entered equals the number of cards in the round. If the sum is incorrect, the total must be displayed in red. The user must be blocked from proceeding to the next round until the total is corrected.
3.4. Scoring Logic

Scores are calculated automatically at the end of each round.
Correct Bid: 10 points + (2 * tricks_won)
Incorrect Bid: -2 * abs(bid - tricks_won)
No other special penalties (like for 'verzaken') will be implemented.
3.5. In-Game Scoreboard

A large, scrollable (horizontally and vertically) table must be visible during the game.
Rows: Represent rounds (e.g., "Ronde 1 (1 kaart)", "Ronde 2 (2 kaarten)", etc.).
Columns: Grouped by player.
Cells: For each player and each round, the table must display:
Bid (Voorspelling)
Tricks Won (Gehaald)
Round Score (Score)
Running Total Score (Totaal)
3.6. End of Game

After the final round, the game is concluded.
The player with the highest total score is the winner and must be visually highlighted in the final scoreboard.
The completed game data (players, rounds, scores) is saved to the database.
The user is presented with two options:
"Nieuw Spel": Starts a new game, pre-populating the player list with the same players.
"Terug naar Hoofdmenu".
3.7. Game History

Accessible from the main menu.
List View: Displays a list of all completed games with the following columns:
Date
Player Names
Final score for each player
Winner
Filtering & Sorting: The list must be filterable and sortable:
Filter by Player: A multi-select dropdown to show only games containing all selected players.
Filter by Date: Two date inputs ('Start', 'End'). A single date filters for that day; two dates filter for the range.
Filter by Winner's Score: A range slider/input for the winner's final score.
Sort: By Date (newest/oldest) and by Winner's Score (high/low).
Detail View: Each game in the list is clickable. Clicking a game navigates to a read-only view of its complete, detailed in-game scoreboard.
4. Data Model (PostgreSQL Schema Proposal)

5. Testing Plan

Unit Tests:
Test the scoring function with various inputs (correct bid, incorrect bid, zero bid).
Test the validation logic for the last bidder.
Test the validation logic for the total tricks in a round.
Test the backend API endpoints for correct data retrieval and storage.
Integration Tests:
Verify that frontend inputs for a new game correctly create corresponding records in the database via the backend.
Test the full round-completion flow: frontend sends data -> backend processes and saves -> frontend receives updated state.
Test the history page filters to ensure the backend API returns the correct filtered/sorted data from the database.
End-to-End (E2E) Tests:
Automate a full user journey: Start app -> Create new game with 4 players -> Play 3-4 rounds, entering valid and invalid data -> Finish game -> Verify winner -> Go to history -> Find the game and verify its details.
Test various filter combinations on the history page.