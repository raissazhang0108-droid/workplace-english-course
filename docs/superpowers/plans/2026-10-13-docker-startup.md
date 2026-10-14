# Docker Startup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to start the English course frontend and backend with Docker Compose using one build-and-start command while preserving SQLite data.

**Architecture:** Build the Vite frontend into static files served by Nginx, and run FastAPI/Uvicorn in a separate backend container. Nginx will proxy `/api`, `/docs`, `/redoc`, and `/openapi.json` to FastAPI on the internal Compose network; only Nginx publishes port 8080. A named volume mounted over `backend/data` will persist SQLite state.

**Tech Stack:** Docker, Docker Compose, Node/npm, Nginx, Python, FastAPI, SQLite.

---

### Task 1: Add Docker build contexts and ignore rules

**Files:**
- Create: `.dockerignore`
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`

- [ ] **Step 1: Add root Docker ignore rules**

Exclude Git metadata, local node modules, local Python virtual environments, SQLite data, build output, test caches, and Python bytecode from both image build contexts. Do not exclude the tracked npm lockfiles or backend requirements.

- [ ] **Step 2: Add the backend runtime image**

Use a Python slim base image, set `/app/backend` as the working directory, install `requirements.txt`, copy the backend application, and run Uvicorn on `0.0.0.0:8000`. Keep the container's database default at `backend/data/quiz.sqlite3`, which resolves under `/app/backend/data`.

- [ ] **Step 3: Add the frontend multi-stage image**

Use the frontend `package-lock.json` with `npm ci`, run the existing Vite production build, then copy only the generated static assets and Nginx configuration into an Nginx Alpine runtime image.

- [ ] **Step 4: Validate Docker build configuration**

Run: `docker compose config`

Expected: this may report missing Compose configuration until Task 2; after Task 2, it must exit successfully with both build definitions resolved.

### Task 2: Add Compose orchestration and same-origin proxy

**Files:**
- Create: `docker-compose.yml`
- Create: `frontend/nginx.conf`

- [ ] **Step 1: Configure Nginx routes**

Serve the built SPA and forward `/api/`, `/docs`, `/redoc`, and `/openapi.json` to `http://backend:8000`. Forward the browser's original Host header so FastAPI's existing Origin-versus-Host validation continues to work behind the proxy. Preserve the request path and forward standard client/protocol headers.

- [ ] **Step 2: Define Compose services**

Create a `backend` service built from `backend/Dockerfile`, with a Python standard-library HTTP health check against `/api/health`. Mount a named `quiz_data` volume at `/app/backend/data`.

Create a `frontend` service built from `frontend/Dockerfile`, publish `8080:80`, and wait for backend health before starting. Do not publish the backend port to the host.

- [ ] **Step 3: Validate Compose configuration**

Run: `docker compose config`

Expected: successful resolved configuration containing the frontend, backend, and named data volume.

- [ ] **Step 4: Build both images**

Run: `docker compose build`

Expected: both images build successfully from the repository root.

### Task 3: Document one-command use and verify the running stack

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add Docker quick-start instructions**

Document the Docker prerequisite, `docker compose up --build`, the app URL `http://localhost:8080`, the proxied Swagger URL `http://localhost:8080/docs`, how to stop with `docker compose down`, and that the named volume persists app data unless deliberately removed with `docker compose down --volumes`. Retain the existing local-development and test commands.

- [ ] **Step 2: Start the stack**

Run: `docker compose up --build -d`

Expected: both services reach running state, and the backend health check passes.

- [ ] **Step 3: Smoke-test the public routes**

Run:

```bash
curl --fail http://localhost:8080/
curl --fail http://localhost:8080/api/health
curl --fail http://localhost:8080/openapi.json
curl --fail http://localhost:8080/docs
```

Expected: the homepage, health JSON, OpenAPI schema, and Swagger UI all return HTTP 200 through the single public port.

- [ ] **Step 4: Verify volume persistence**

Create a test account through the app/API, run `docker compose down`, then `docker compose up -d`. Verify the account can still log in. Do not use `--volumes` during this check.

- [ ] **Step 5: Run regression checks and stop containers**

Run: `npm test && npm run build && npm run backend:test`

Expected: existing frontend and backend tests pass and the production Vite build succeeds. Stop the Compose stack with `docker compose down` without removing its named data volume.

### Task 4: Final review

**Files:**
- Review all Docker files created above and the README changes.

- [ ] **Step 1: Review the complete diff**

Confirm only Docker startup/build configuration and directly related README instructions changed; ensure no SQLite data or generated artifacts were added.

- [ ] **Step 2: Commit the Docker startup support**

```bash
git add .dockerignore backend/Dockerfile frontend/Dockerfile frontend/nginx.conf docker-compose.yml README.md
git commit -m "feat: add Docker Compose startup"
```
