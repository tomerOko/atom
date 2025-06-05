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

## Getting Started

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
└── docker-compose.yml      # Infrastructure services
```

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