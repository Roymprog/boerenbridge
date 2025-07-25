# Boerenbridge Scorekeeping Web Application - Implementation Plan

## Project Overview
This plan outlines the step-by-step implementation of a web-based Boerenbridge scorekeeping application with React frontend, FastAPI backend, and PostgreSQL database.

## Architecture Foundation
- **Frontend**: React with TypeScript for type safety
- **Backend**: Python FastAPI for API endpoints
- **Database**: PostgreSQL for data persistence
- **Development**: Docker for local development environment

---

## Phase 1: Project Foundation & Setup

### Step 1: Initial Project Structure
```
Create the basic project structure and development environment setup. Initialize a monorepo with separate frontend and backend directories, configure Docker for local development, and set up basic package.json/requirements.txt files.

Create the following structure:
- /frontend (React TypeScript app)
- /backend (FastAPI Python app)
- /docker-compose.yml for local development
- Basic README.md with setup instructions

Initialize React app with TypeScript, install essential dependencies (React Router, Axios for API calls, basic UI framework like Material-UI or Tailwind CSS).

Initialize FastAPI backend using UV with essential dependencies (FastAPI, SQLAlchemy, Pydantic, psycopg2 for PostgreSQL).

Configure CORS for local development between frontend and backend.
```

### Step 2: Database Schema and Models
```
Design and implement the PostgreSQL database schema based on the specification. Create SQLAlchemy models for the data structure.

Required tables:
- players (id, name, created_at)
- games (id, created_at, max_cards, status)
- game_players (game_id, player_id, position)
- rounds (id, game_id, round_number, cards_count, dealer_position)
- round_scores (id, round_id, player_id, bid, tricks_won, score, running_total)

Create Pydantic schemas for request/response validation.
Set up database connection and basic CRUD operations.
Create database migration system using Alembic.
```

### Step 3: Basic API Endpoints
```
Implement the core API endpoints needed for the application. Start with simple CRUD operations and build up to more complex game logic.

Endpoints to create:
- GET /players - fetch all player names for dropdown
- POST /players - create new player
- POST /games - create new game
- GET /games/{game_id} - fetch game details
- GET /games - fetch games with filtering/sorting for history
- POST /games/{game_id}/rounds - submit round data
- GET /games/{game_id}/scoreboard - fetch current scoreboard

Include proper error handling and validation.
Add basic testing for each endpoint.
```

---

## Phase 2: Core Frontend Components

### Step 4: Main Menu Component
```
Create the main menu as the application entry point. This should be simple and clean, focusing on the two primary actions.

Components to create:
- MainMenu component with two buttons
- Basic routing setup with React Router
- Simple, clean styling that works on desktop
- Navigation to game setup and history views

The component should be straightforward with clear, prominent buttons for "Nieuw Spel Starten" and "Historie Bekijken".
```

### Step 5: Player Selection Component
```
Build the player selection interface for game setup. This includes the filterable dropdown for player names and dynamic player list management.

Features to implement:
- Filterable combobox that queries the backend for existing player names
- Add/remove players functionality (3-10 players)
- Real-time search/filtering of player names
- Validation for minimum/maximum players
- Clean UI for managing the selected player list

Connect to the /players API endpoint for fetching existing names.
Handle both selecting existing players and adding new ones.
```

### Step 6: Round Configuration Component
```
Create the round configuration interface that determines the maximum cards for the peak round.

Features to implement:
- Dynamic dropdown calculation based on number of players
- Formula: min=5, max=floor(52/N) where N is player count
- Clear explanation of how many rounds will be played
- Validation and error handling
- Smooth transition to the game screen

Display the calculated number of rounds: (max_cards * 2) - 1
Provide clear feedback about the game length before starting.
```

---

## Phase 3: Game Logic & Scoring

### Step 7: Game State Management
```
Implement the core game state management system. This handles round progression, dealer rotation, and game flow.

Features to implement:
- Game state context/store for managing current game data
- Round progression logic (1 card -> max cards -> 1 card)
- Dealer rotation tracking (clockwise among players)
- Current round state (bidding phase vs tricks phase)
- Validation state management

Use React Context or a state management library to handle complex game state.
Ensure state persists properly between phases and rounds.
```

### Step 8: Bidding Phase Component
```
Create the interface for entering player bids during each round.

Features to implement:
- Input fields for each player's bid, ordered clockwise from left of dealer
- Filterable dropdown for bid values (0 to current round's card count)
- Special validation for last bidder (prevent total bids = cards in round)
- Visual feedback for invalid bids (red highlighting)
- Clear indication of current dealer and turn order

Connect to game state to track dealer position and validate bids.
Provide clear visual feedback for validation errors.
```

### Step 9: Tricks Input Component
```
Build the interface for entering how many tricks each player won.

Features to implement:
- Input fields for tricks won by each player
- Running total display that updates in real-time
- Validation that total tricks equals cards in current round
- Visual feedback when total is incorrect (red highlighting)
- Prevention of proceeding until validation passes

Clear visual indication of the running total and validation status.
Smooth transition between bidding and tricks phases.
```

### Step 10: Scoring System
```
Implement the automatic scoring calculation system.

Scoring rules to implement:
- Correct bid: 10 points + (2 * tricks_won)
- Incorrect bid: -2 * abs(bid - tricks_won)
- Running total calculation
- Integration with round completion flow

Create utility functions for score calculation.
Ensure scores update immediately when round data is submitted.
Add comprehensive testing for all scoring scenarios.
```

---

## Phase 4: Scoreboard & Game Display

### Step 11: In-Game Scoreboard Component
```
Create the large, scrollable scoreboard that displays during gameplay.

Features to implement:
- Responsive table with horizontal and vertical scrolling
- Row headers for each round (e.g., "Ronde 1 (1 kaart)")
- Column groups for each player
- Cell display: Bid, Tricks Won, Round Score, Running Total
- Proper styling for readability and desktop optimization

Ensure the table remains readable with many players and rounds.
Implement smooth scrolling and proper table formatting.
```

### Step 12: Game Progress Integration
```
Wire together all game components into a cohesive game flow.

Integration points:
- Seamless transition from setup to gameplay
- Real-time scoreboard updates after each round
- Proper state management between bidding and tricks phases
- Round progression with dealer rotation
- Data persistence to backend after each round

Ensure all components work together smoothly.
Add loading states and error handling throughout the flow.
```

---

## Phase 5: Game Completion & History

### Step 13: End Game Component
```
Create the end-of-game interface with winner highlighting and next actions.

Features to implement:
- Final scoreboard with winner highlighting
- Clear visual indication of the winning player
- Two action buttons: "Nieuw Spel" and "Terug naar Hoofdmenu"
- Pre-population of players for new game option
- Proper cleanup of game state

Ensure game data is properly saved to database before showing end screen.
Handle edge cases like ties in scoring.
```

### Step 14: Game History List Component
```
Build the game history interface with filtering and sorting capabilities.

Features to implement:
- List view of all completed games
- Display: Date, Player Names, Final Scores, Winner
- Filter by players (multi-select dropdown)
- Filter by date range (start/end date inputs)
- Filter by winner's score (range input)
- Sort by date and winner's score
- Clickable rows for detailed view

Connect to backend API with proper query parameters for filtering/sorting.
Implement efficient data loading and pagination if needed.
```

### Step 15: Game History Detail Component
```
Create the detailed view for individual historical games.

Features to implement:
- Read-only version of the in-game scoreboard
- Complete round-by-round breakdown
- Navigation back to history list
- Proper formatting for historical data display

Reuse scoreboard component logic but in read-only mode.
Ensure historical data displays correctly even for games with different player counts.
```

---

## Phase 6: Polish & Optimization

### Step 16: Error Handling & User Experience
```
Implement comprehensive error handling and improve user experience throughout the application.

Improvements to implement:
- Global error boundary in React
- Loading states for all API calls
- User-friendly error messages
- Confirmation dialogs for destructive actions
- Input validation feedback
- Responsive design refinements

Add proper loading indicators and error recovery mechanisms.
Implement user feedback for all actions (success/error states).
```

### Step 17: Performance Optimization & Testing
```
Optimize application performance and add comprehensive testing.

Optimizations to implement:
- React performance optimizations (useMemo, useCallback, React.memo)
- API response optimization and caching
- Database query optimization
- Bundle size optimization

Testing to add:
- Unit tests for scoring logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Component testing for UI interactions

Ensure the application performs well with large datasets and many games.
```

### Step 18: Final Integration & Deployment Preparation
```
Complete final integration, documentation, and prepare for deployment.

Final tasks:
- Environment configuration for production
- Database migration scripts
- Comprehensive documentation
- Docker production configuration
- Final end-to-end testing
- Performance monitoring setup

Ensure all components are properly integrated and the application is production-ready.
Create deployment guides and operational documentation.
```

---

## Implementation Notes

### Key Principles:
1. **Incremental Development**: Each step builds on the previous ones
2. **No Orphaned Code**: Every component gets integrated immediately
3. **Test as You Go**: Add tests with each major component
4. **User-Focused**: Keep the desktop-first, user-friendly design in mind
5. **Data Integrity**: Ensure proper validation and error handling throughout

### Technical Considerations:
- Use TypeScript throughout for better type safety
- Implement proper error boundaries and loading states
- Focus on desktop-first responsive design
- Ensure database transactions for data consistency
- Use proper React patterns (hooks, context, proper state management)

### Validation Points:
- After each step, the application should be in a working state
- Each component should be tested individually before integration
- API endpoints should be tested with proper data validation
- User experience should be smooth and intuitive at every stage