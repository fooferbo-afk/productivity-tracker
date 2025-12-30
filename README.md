# Allied Health Productivity Tracker

A mobile-friendly web application for allied health professionals to track productivity, manage work schedules across multiple facilities, and view historical performance data.

## Project Structure

```
productivity-tracker/
├── frontend/           # React/Vite application (TypeScript)
│   ├── src/
│   │   ├── api/        # Centralized API client
│   │   ├── components/ # Reusable UI components
│   │   ├── domain/     # Pure business logic
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Route-level components
│   │   ├── store/      # Redux configuration
│   │   ├── routes/     # Route definitions + guards
│   │   ├── styles/     # Global styles
│   │   └── types/      # TypeScript interfaces
│   └── ...
│
├── backend/            # FastAPI application (Python)
│   ├── app/
│   │   ├── auth/       # Firebase JWT validation
│   │   ├── models/     # SQLAlchemy models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── routers/    # API route handlers
│   │   ├── services/   # Business logic layer
│   │   └── repositories/ # Data access layer
│   ├── tests/
│   └── alembic/        # Database migrations
│
└── docker-compose.yml  # Local development orchestration
```

## Getting Started

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Firebase project (for authentication)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd productivity-tracker
   ```

2. **Set up environment variables**

   Copy the example env files and fill in your values:
   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

3. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Email/Password and Google authentication providers
   - Download the service account key for backend configuration

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

### Running the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000
API documentation: http://localhost:8000/docs

### Running with Docker

```bash
docker-compose up --build
```

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint code |

### Backend

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Start development server |
| `pytest` | Run tests |
| `pytest --cov=app` | Run tests with coverage |
| `alembic upgrade head` | Apply migrations |
| `alembic revision --autogenerate -m "message"` | Create migration |

## Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend (.env)

```bash
DATABASE_URL=sqlite+aiosqlite:///./productivity.db
FIREBASE_PROJECT_ID=your_project_id
ALLOWED_ORIGINS=http://localhost:5173
ENVIRONMENT=development
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create therapist profile |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/facilities` | List facilities |
| POST | `/api/facilities` | Create facility |
| PUT | `/api/facilities/{id}` | Update facility |
| POST | `/api/facilities/{id}/archive` | Archive facility |
| GET | `/api/sessions` | List sessions |
| GET | `/api/sessions/summary` | Get aggregate stats |
| POST | `/api/sessions` | Create session |
| PUT | `/api/sessions/{id}` | Update session |
| DELETE | `/api/sessions/{id}` | Delete session |

## Code Style

- **TypeScript**: Follow ESLint configuration
- **Python**: Follow PEP 8, use type hints
- **Git commits**: Use conventional commits format

## Deployment

See [deployment documentation](./docs/deployment.md) for production deployment instructions.

## License

MIT
