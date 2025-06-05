# Development Setup Guide

This guide explains how to run the backend and AI service locally while connecting to Docker Compose infrastructure services (MongoDB, RabbitMQ, MinIO).

## Prerequisites

- Docker Desktop installed and running
- Node.js (for backend)
- Python 3.8+ (for AI service)

## Quick Start

### 1. Start Infrastructure Services

```bash
# Start only the infrastructure services (MongoDB, RabbitMQ, MinIO)
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- **MongoDB** on `localhost:27017`
- **RabbitMQ** on `localhost:5672` (management UI: `localhost:15672`)
- **MinIO** on `localhost:9000` (console: `localhost:9001`)

### 2. Test Connectivity

#### Backend connectivity test:
```bash
cd backend
node test-connectivity.js
```

#### AI Service connectivity test:
```bash
cd ai-service
# Create virtual environment (first time only)
python3 -m venv .venv
source .venv/bin/activate
pip install python-dotenv pika minio

# Run connectivity test
python test-connectivity.py
```

### 3. Run Services Locally

#### Backend
```bash
cd backend
npm install  # First time only
npm run dev  # Uses nodemon for hot reload
```

The backend will:
- Load environment variables from `backend/envs/local.env`
- Connect to localhost instances of MongoDB, RabbitMQ, and MinIO
- Run on `http://localhost:3000`

#### AI Service
```bash
cd ai-service
source .venv/bin/activate  # Activate virtual environment
python main.py
```

The AI service will:
- Load environment variables from `ai-service/local.env`
- Connect to localhost instances of RabbitMQ and MinIO
- Listen for image processing requests

## Debugging with VS Code

### Backend Debugging
The backend already has debugging configurations in `backend/.vscode/launch.json`:
- **Debug with Nodemon**: Hot reload debugging
- **Debug TypeScript Backend**: Standard debugging

To debug:
1. Open VS Code in the `backend` directory
2. Set breakpoints in your TypeScript code
3. Press `F5` or use the Debug panel
4. Select "Debug with Nodemon" or "Debug TypeScript Backend"

### AI Service Debugging
The AI service has debugging configurations in `ai-service/.vscode/launch.json`:
- **Debug AI Service**: Uses virtual environment Python
- **Debug AI Service (System Python)**: Uses system Python

To debug:
1. Open VS Code in the `ai-service` directory
2. Ensure the virtual environment is created (`python3 -m venv .venv`)
3. Set breakpoints in your Python code
4. Press `F5` or use the Debug panel
5. Select "Debug AI Service"

## Environment Variables

### Backend (`backend/envs/local.env`)
- MongoDB: `mongodb://admin:password@localhost:27017/helmet_detection?authSource=admin`
- RabbitMQ: `amqp://guest:guest@localhost:5672`
- MinIO: `localhost:9000` with credentials `minioadmin:minioadmin`

### AI Service (`ai-service/local.env`)
- RabbitMQ: `localhost:5672` with credentials `guest:guest`
- MinIO: `localhost:9000` with credentials `minioadmin:minioadmin`

## Service Management

### View Infrastructure Status
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Stop Infrastructure Services
```bash
docker-compose -f docker-compose.dev.yml down
```

### Stop Services and Remove Volumes
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### View Service Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f mongodb
docker-compose -f docker-compose.dev.yml logs -f rabbitmq
docker-compose -f docker-compose.dev.yml logs -f minio
```

## Useful URLs

- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Backend API**: http://localhost:3000
- **Backend Health Check**: http://localhost:3000/health (if available)

## Troubleshooting

### Connection Issues
1. Ensure Docker Desktop is running
2. Verify services are up: `docker-compose -f docker-compose.dev.yml ps`
3. Test connectivity with the provided test scripts
4. Check that no other services are using the same ports

### Port Conflicts
If you have port conflicts, you can modify `docker-compose.dev.yml` to use different ports:
```yaml
ports:
  - "27018:27017"  # MongoDB on 27018 instead of 27017
  - "5673:5672"    # RabbitMQ on 5673 instead of 5672
  - "9001:9000"    # MinIO on 9001 instead of 9000
```

Remember to update the environment files accordingly.

### Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf ai-service/.venv
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install python-dotenv pika minio
```

## Development Workflow

1. Start infrastructure: `docker-compose -f docker-compose.dev.yml up -d`
2. Test connectivity with provided scripts
3. Start backend in one terminal: `cd backend && npm run dev`
4. Start AI service in another terminal: `cd ai-service && source .venv/bin/activate && python main.py`
5. Debug using VS Code configurations as needed
6. Stop infrastructure when done: `docker-compose -f docker-compose.dev.yml down` 