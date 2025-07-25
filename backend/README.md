# Boerenbridge Backend

FastAPI backend for the Boerenbridge scorekeeping application.

## Features

- RESTful API endpoints for game management
- PostgreSQL database integration
- CORS support for frontend communication
- Pydantic data validation
- SQLAlchemy ORM

## Development

1. Install dependencies: `uv pip install .`
2. Run the server: `uvicorn app.main:app --reload`
3. Access API docs at: http://localhost:8000/docs
