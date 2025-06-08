# Full-Stack Project Template

A comprehensive full-stack project template with React frontend, Node.js backend, and Docker services.

## Setup and Running

### Quick Production Setup
For fast setup and running everything in Docker:
```bash
chmod +x setup.sh run-prod.sh
./setup.sh    # Install dependencies
./run-prod.sh # Run everything in Docker
```

### Development Setup (with debugging)
For development with individual service debugging:
```bash
chmod +x setup.sh run-dev.sh
./setup.sh    # Install dependencies
./run-dev.sh  # Start infrastructure only
```

Then run services individually for debugging:
- **Backend**: Open `backend/` in your (vscode based) IDE, run the debugger and start coding :)
- **Frontend**: `cd client && npm run dev`
- **Image Analysis**: Open `ai-service/` in your (vscode based) IDE, run the debugger and start coding :)

### Services
- **MongoDB**: localhost:27017 (admin/password)
- **RabbitMQ**: localhost:5672, Management UI: localhost:15672 (guest/guest)
- **MinIO**: localhost:9000, Console: localhost:9001 (minioadmin/minioadmin)

## Design Choices

### Backend Architecture
**Flow-Based Organization**: Each business domain (users, orders, etc.) gets its own folder under `src/flows/` with:
- `routes.ts` - API endpoints
- `controller.ts` - HTTP handling
- `service.ts` - Business logic
- `dal.ts` - Database operations
- `validations.ts` - Zod schemas

**Why?** Clear separation of concerns, easy to maintain and scale, consistent structure.

**Validation-First**: All external data (API, database, events) uses Zod schemas for type safety and runtime validation.

**MongoDB Native Driver**: Direct MongoDB access instead of ODMs for better performance and control.

### Frontend Architecture
**Generic Components**: All UI goes through reusable components in `src/shared/components/generic/` instead of raw HTML elements.

**Styled Components**: Component-scoped CSS instead of CSS files to prevent conflicts and enable dynamic styling.

**No Default Exports**: Named exports only for better IDE support and refactoring.

**Kebab-Case Files**: Consistent naming across all files and folders.

### Infrastructure
**Docker Compose**: Consistent development environment with separate configs for dev (debugging) and prod (all-in-one).

**Service Selection**:
- MongoDB for flexible document storage
- RabbitMQ for event-driven architecture
- MinIO for S3-compatible file storage 