# Full-Stack Project Template

A comprehensive full-stack project template with React frontend, Node.js backend, and Docker services.

## Architecture

This template provides a complete project structure with:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Infrastructure**: Docker Compose with MongoDB, RabbitMQ, and MinIO
- **Example Flow**: Complete CRUD operations with users as an example

## Services

The template includes the following services via Docker Compose:

- **MongoDB** (Port 27017) - Database
- **RabbitMQ** (Port 5672, Management UI: 15672) - Message queue
- **MinIO** (Port 9000, Console: 9001) - Object storage

## Quick Start

### Automated Setup

For a complete setup and development environment:

```bash
# One-time setup - installs dependencies and starts infrastructure
chmod +x setup.sh
./setup.sh
```

### Development Mode

```bash
# Start infrastructure and get ready for local development
chmod +x run-dev.sh
./run-dev.sh
```

Then manually start the services you want to develop:
- **Frontend**: `cd client && npm run dev`
- **Backend**: Use your IDE debugger in the backend folder
- **Image Analysis**: Use your IDE debugger in the image-analysis folder

### Production Mode

```bash
# Start all services in production mode
chmod +x run-prod.sh
./run-prod.sh
```

## Manual Setup (Alternative)

1. **Start the infrastructure**:
```bash
docker-compose up -d
```

2. **Backend setup**:
```bash
cd backend
npm install
npm run dev
```

3. **Frontend setup**:
```bash
cd client
npm install
npm run dev
```

## Project Structure

```
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── flows/
│   │   │   └── example-users/  # Example CRUD flow
│   │   ├── packages/        # Utility packages
│   │   ├── middleware/      # Express middleware
│   │   └── config/         # Configuration
│   └── envs/               # Environment files
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── example-dashboard/  # Example page
│   │   └── shared/         # Shared components
├── image-analysis/         # Python ML service
├── setup.sh               # One-time setup script
├── run-dev.sh             # Development environment script
├── run-prod.sh            # Production environment script
└── docker-compose.yml      # Infrastructure services
```

## Design Choices & Architecture Decisions

### Backend Architecture

**Flow-Based Organization**: The backend uses a flow-based architecture where each business domain (e.g., users, orders) is organized in its own folder under `src/flows/`. This provides:
- Clear separation of concerns
- Easy scalability when adding new features
- Consistent patterns across all business logic

**Class-Based Services**: We use class-based controllers and services with dependency injection patterns for:
- Better testing capabilities
- Clear dependency relationships
- Automatic logging with decorators
- Consistent error handling

**Validation-First Approach**: All external contracts (API requests, RabbitMQ events, database operations) use Zod schemas for:
- Type safety at runtime
- Clear API contracts
- Automatic type inference
- Input sanitization

### Frontend Architecture

**Component-Based Design**: The frontend follows a strict component structure with:
- Generic reusable components in `shared/components/generic/`
- Styled-components for all styling (no CSS files)
- TypeScript interfaces in separate `types.ts` files
- Consistent naming conventions (kebab-case)

**State Management**: Uses Zustand for global state and React useState for local state, providing:
- Simple, non-boilerplate state management
- TypeScript integration
- Performance optimization

### Infrastructure Choices

**Docker Compose**: All services run in Docker containers for:
- Consistent development environments
- Easy deployment and scaling
- Service isolation and dependency management

**MongoDB**: Chosen for its flexibility with JSON documents and:
- Native Node.js driver (no ORM overhead)
- Schema flexibility for rapid development
- Built-in indexing and aggregation

**RabbitMQ**: For reliable message queuing providing:
- Decoupled service communication
- Event-driven architecture
- Reliable message delivery

**MinIO**: S3-compatible object storage for:
- File and image storage
- Development S3 compatibility
- Anonymous access configuration for CORS-free frontend integration

### Security Considerations

- JWT-based authentication
- Environment-based configuration
- Input validation on all endpoints
- CORS configuration for cross-origin requests

## Backend Features

- **Packages**: JWT, Logger, RabbitMQ, MinIO, MongoDB utilities
- **Example Flow**: Users CRUD with API routes, services, DAL, and consumers
- **Middleware**: Error handling, request logging
- **Environment**: Multiple environment configurations

## Frontend Features

- **Example Dashboard**: Sample page showing project structure
- **Shared Components**: Generic UI components
- **Services**: API integration layer
- **Routing**: React Router setup

## Environment Variables

Copy the example environment files and configure:

- `backend/envs/local.env` - Backend configuration
- `client/.env` - Frontend configuration (if needed)

## Example API Endpoints

- `GET /api/example-users` - List users
- `POST /api/example-users` - Create user
- `GET /health` - Health check

## Customizing the Template

1. Rename `example-users` flow to your domain
2. Update API routes and endpoints
3. Modify the frontend dashboard
4. Add your business logic
5. Configure environment variables for your services

## Default Credentials

- **MongoDB**: admin/password
- **RabbitMQ**: guest/guest (Management UI: http://localhost:15672)
- **MinIO**: minioadmin/minioadmin (Console: http://localhost:9001)

## Development Workflow

1. Use `setup.sh` for initial project setup
2. Use `run-dev.sh` for daily development
3. Develop backend and image-analysis services using IDE debuggers
4. Frontend runs independently with hot reload
5. All infrastructure services available via Docker Compose

## CI/CD Integration

The project includes GitHub Actions workflows for:
- Code linting and formatting
- Automated testing
- Docker image building
- Production deployment validation