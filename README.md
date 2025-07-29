Disclaimer: This code was built completely through vibe coding.

# Boerenbridge Scorekeeping Web Application

A modern web application for keeping track of Boerenbridge game scores with a React TypeScript frontend and FastAPI backend.

## Project Structure

```
├── frontend/          # React TypeScript application
├── backend/           # FastAPI Python application
├── docker-compose.yml # Docker development environment
└── README.md          # This file
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.12+ with UV package manager (for local backend development)

## Quick Start with Docker

1. **Clone and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Database: PostgreSQL on localhost:5432

## Local Development Setup

### Frontend (React TypeScript)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Available scripts:**
   - `npm start` - Start development server
   - `npm test` - Run tests
   - `npm run build` - Build for production

### Backend (FastAPI with UV)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install UV (if not already installed):**
   ```bash
   pip install uv
   ```

3. **Install dependencies:**
   ```bash
   uv pip install .
   ```

4. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   ```

5. **Start development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Environment Configuration

### Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust values as needed:

```env
DATABASE_URL=postgresql://admin:password@localhost:5432/boerenbridge
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

The frontend uses the following environment variable:
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8000)

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Material-UI** for UI components
- **Axios** for API calls

### Backend
- **FastAPI** for API framework
- **SQLAlchemy** for ORM
- **Pydantic** for data validation
- **PostgreSQL** for database
- **Alembic** for database migrations

### Development
- **Docker & Docker Compose** for containerization
- **UV** for Python package management
- **npm** for Node.js package management

## API Documentation

When the backend is running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

The application uses PostgreSQL as the database. When using Docker Compose, the database is automatically set up with:
- Database: `boerenbridge`
- User: `admin`
- Password: `password`
- Port: `5432`

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
uv run pytest
```

## Troubleshooting

### Common Issues

1. **Port conflicts:** Make sure ports 3000, 8000, and 5432 are not in use
2. **Docker issues:** Try `docker-compose down -v` to clean up volumes
3. **Frontend build issues:** Delete `node_modules` and run `npm install` again
4. **Backend dependency issues:** Try `uv pip install . --force-reinstall`

### Logs

View logs for specific services:
```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db
```

## Contributing

1. Make sure all tests pass
2. Follow the existing code style
3. Update documentation as needed
4. Test both local and Docker environments

## License

This project is for educational purposes.