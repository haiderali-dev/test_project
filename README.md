# Task Manager Application

A full-stack task management application with React frontend and Node/Express backend. Data is hardcoded in the backend (no database required).

## Features

- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Filtering**: Filter by status (todo, in-progress, done) and priority (low, medium, high)
- **Sorting**: Sort by created date, updated date, title, or priority
- **Responsive UI**: Works on desktop and mobile
- **Testing**: Comprehensive unit and integration tests for both frontend and backend

## Tech Stack

### Backend
- Node.js + Express
- Jest + Supertest for testing
- Hardcoded data storage (in-memory array)

### Frontend
- React 18 + Vite
- Vitest + React Testing Library for testing
- CSS Modules (plain CSS)

## Project Structure

```
task-manager/
├── backend/
│   ├── data/
│   │   └── tasks.js          # Hardcoded data & data access layer
│   ├── routes/
│   │   └── tasks.js          # REST API routes
│   ├── test/
│   │   ├── tasks.unit.test.js       # Unit tests for data layer
│   │   └── tasks.integration.test.js # Integration tests for API
│   ├── server.js             # Express app entry point
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── TaskList.js
    │   │   ├── TaskItem.js
    │   │   ├── TaskForm.js
    │   │   └── Filter.js
    │   ├── services/
    │   │   └── api.js
    │   ├── test/
    │   │   └── setup.js
    │   ├── App.js
    │   ├── App.css
    │   ├── main.jsx
    │   ├── App.test.jsx            # Integration tests
    │   └── components/*.test.jsx   # Unit tests
    ├── vite.config.js
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install manually:
cd backend && npm install
cd ../frontend && npm install
```

### Development

```bash
# Terminal 1: Start backend (port 3001)
npm run dev:backend

# Terminal 2: Start frontend (port 3000)
npm run dev:frontend
```

The frontend will be available at http://localhost:3000
The backend API will be available at http://localhost:3001/api/tasks

### Testing

```bash
# Run all tests
npm run test:all

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with optional filters) |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task (full) |
| PATCH | `/api/tasks/:id` | Update task (partial) |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/health` | Health check |

### Query Parameters for GET /api/tasks

- `status`: Filter by status (todo, in-progress, done)
- `priority`: Filter by priority (low, medium, high)
- `sortBy`: Sort field (createdAt, updatedAt, title, priority)
- `sortOrder`: Sort order (asc, desc)

## Task Data Structure

```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Task Description",
  "status": "todo",
  "priority": "medium",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Test Coverage

### Backend Tests
- **Unit Tests** (`tasks.unit.test.js`): Tests for data layer functions (getAllTasks, getTaskById, createTask, updateTask, deleteTask, resetTasks)
- **Integration Tests** (`tasks.integration.test.js`): Tests for all REST API endpoints with various scenarios

### Frontend Tests
- **Unit Tests**: Individual component tests (TaskForm, TaskItem, TaskList, Filter)
- **Integration Tests** (`App.test.jsx`): Full app workflows including create, read, update, delete, filtering, and error handling

## Hardcoded Data

The backend initializes with 5 sample tasks:
1. Set up project structure (done, high)
2. Implement REST API endpoints (in-progress, high)
3. Build React frontend components (todo, medium)
4. Add unit and integration tests (todo, medium)
5. Deploy application (todo, low)

Data resets on server restart or when `resetTasks()` is called (used in tests).

## License

MIT

## CI/CD and local Docker staging

The Intelligent CI/CD Orchestrator registers this repository as `test-project`.
Its Pipeline Assistant generates Checkout, Build, Backend tests, Frontend tests,
and Deploy stages from these catalog commands:

```sh
sh scripts/build.sh
sh scripts/test.sh backend
sh scripts/test.sh frontend
sh scripts/deploy.sh staging
```

Build creates a Docker image tagged with the full Git commit. Tests run the existing
Jest/Supertest and Vitest/React Testing Library suites in Docker with coverage and
without watch mode. Deploy uses the already built image, starts
`test-project-staging`, waits for Docker health, and checks the frontend bundle,
API, deployed revision, and task create/read/update/delete behavior.

Staging is available at http://localhost:9003. `/health` reports readiness and
`/version` identifies the deployed Git commit. Port 9003 is bound to local loopback.
Task data is in memory and resets when the container restarts.

The Docker base is pinned by digest to Node 24.21.0 for repeatable builds.


### Automatic staging builds

The orchestrator's `test-project` service enables Git polling for the approved
build/test/deploy Pipeline on `main`. While Jenkins and the local Docker stack are
running, Jenkins checks GitHub once a minute and starts a new build when `main`
changes. The Pipeline follows the branch instead of pinning the previous commit,
and serializes deployments to http://localhost:9003.
