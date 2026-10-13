# Docker Startup Design

## Goal

Let a user start the workplace English course locally with one Docker Compose command, without separately installing or starting the frontend and backend runtimes.

## Approved Approach

Use two services orchestrated by Docker Compose:

- `frontend`: build the existing Vite app into static assets and serve them through Nginx.
- `backend`: run the existing FastAPI app with Uvicorn.

Nginx serves the site and reverse-proxies `/api` requests to the backend service. It also forwards `/docs`, `/redoc`, and `/openapi.json` so the existing API documentation remains available through the same public entry point. The browser uses one origin for both frontend and API, preserving the backend's existing same-origin validation and session-cookie behavior. Only the frontend is published to the host, on port `8080`; the backend remains on the internal Compose network.

## Data Persistence

Mount a named Docker volume at the backend SQLite data directory so users, sessions, progress, and quiz attempts survive container recreation and `docker compose down`. Removing persisted data requires the explicit volume-removal command `docker compose down --volumes`.

## User Workflow

From the project root:

```bash
docker compose up --build
```

Open `http://localhost:8080`. Stop the stack with Ctrl+C followed by `docker compose down`, or run `docker compose down` in another terminal.

## Scope

- Add Dockerfiles for the frontend and backend, an Nginx configuration, a Compose file, and Docker ignore rules as needed.
- Document the Docker startup and shutdown commands in the README while preserving existing non-Docker instructions.
- Add container health checks and start the frontend only after the backend is healthy.
- Keep existing application routes, authentication, API behavior, and local-development commands unchanged.

## Validation

- Build both images with Docker Compose.
- Start the stack and verify the frontend, `/api/health`, and `/docs` are reachable through the intended public entry point.
- Create persistent application data, recreate the containers without removing volumes, and verify the data remains.
- Run the existing frontend and backend tests and production frontend build.

## Out of Scope

- Development-mode hot reload in containers.
- HTTPS termination, remote hosting, or production secret management.
- A single-container frontend/backend deployment.
- Changes to application features or API behavior.
