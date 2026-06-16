# Production Deployment Guide

This guide describes how to deploy the BudgetGuard AI platform using Docker and Docker Compose.

## Architecture

The platform consists of four containerized services:
1. **Frontend**: React app served via Nginx (Port 80)
2. **Backend**: Node.js/Express API (Port 5000)
3. **AI Service**: Python/FastAPI ML engine (Port 8000)
4. **Database**: MongoDB (Port 27017)

## Environment Variables

### Frontend Variables (Build-time)
* `VITE_API_BASE_URL`: The public URL of the backend API (e.g., `http://api.budgetguard.com` or `http://localhost:5000`). This is set as a build argument in the Dockerfile.

### Backend Variables (Runtime)
* `PORT`: Port to run the server on (default: `5000`).
* `MONGODB_URI`: Connection string for MongoDB (default in compose: `mongodb://mongodb:27017/budgetguard`).
* `JWT_SECRET`: Secret key for signing JWT tokens. Change this in production!
* `AI_SERVICE_URL`: Internal Docker network URL to reach the AI service (default in compose: `http://ai-service:8000`).
* `FRONTEND_URL`: URL of the frontend to allow CORS (default: `http://localhost`).

### AI Service Variables (Runtime)
* `PORT`: Port to run FastAPI on (default: `8000`).
* `HOST`: Host binding (default: `0.0.0.0`).
* `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins.
* `MODEL_DIR`: Directory where pre-trained models are stored (default: `trained_models`).

## Deployment Commands

### Prerequisites
1. Ensure Docker and Docker Compose are installed.
2. Train the AI models first (required before startup):
   ```bash
   cd ai
   python train_anomaly_model.py
   python train_lapse_model.py
   cd ..
   ```

### Start the Platform
Run the following command to build and start all containers in detached mode:
```bash
docker-compose up -d --build
```

### View Logs
To view logs for all services:
```bash
docker-compose logs -f
```
To view logs for a specific service:
```bash
docker-compose logs -f backend
```

### Stop the Platform
```bash
docker-compose down
```

## Health Checks
All services are configured with Docker health checks. You can monitor their status using:
```bash
docker ps
```
Services will transition from `(health: starting)` to `(healthy)`.

## Internal Networking & Service Discovery
Docker Compose creates a shared bridge network (`budgetguard-net`). Services resolve each other by their service names defined in `docker-compose.yml`:
- The Backend connects to the AI service using `http://ai-service:8000`
- The Backend connects to MongoDB using `mongodb://mongodb:27017/budgetguard`

## Remaining Blockers / Considerations
- **HTTPS/TLS**: The current setup exposes the frontend on port 80 (HTTP). For production, you should add an SSL termination proxy (like Let's Encrypt with Nginx or Traefik).
- **Secrets Management**: Passing `JWT_SECRET` via plain environment variables in docker-compose is fine for testing, but in a real production environment, use Docker Swarm Secrets, Kubernetes Secrets, or a vault service.
- **Persistent Data**: MongoDB data is persisted in a local Docker volume. Consider using a managed database service (e.g., MongoDB Atlas) for higher availability and automated backups.
- **Frontend API URL**: The frontend is currently built targeting `http://localhost:5000`. If deploying to a remote server, update the `VITE_API_BASE_URL` build argument to point to the server's public IP or domain.
