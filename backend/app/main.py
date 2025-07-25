from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv
import os

from .routes import players_router, games_router
from .database import engine
from . import models

# Load environment variables
load_dotenv()

# Create database tables
try:
    models.Base.metadata.create_all(bind=engine)
except OperationalError as e:
    print(f"Warning: Could not connect to database: {e}")

app = FastAPI(
    title="Boerenbridge Scorekeeping API",
    description="API for managing Boerenbridge game scores and history",
    version="1.0.0"
)

# Configure CORS for local development
origins = [
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # FastAPI development server
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(players_router)
app.include_router(games_router)

@app.get("/")
async def root():
    return {"message": "Boerenbridge Scorekeeping API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "boerenbridge-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
