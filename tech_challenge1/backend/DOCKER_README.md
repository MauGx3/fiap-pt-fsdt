# Backend Docker & Compose README

This document explains how to build and run the backend using Docker and Docker Compose, why the Dockerfile was refactored, and notes about environment variables and security best practices.

Prerequisites
- Docker Engine and Docker Compose (v2) installed
- A shell with environment variables available (or a `.env` file)

Quick start (development)

1. Create a `.env` or export required variables. At minimum you must set `JWT_SECRET` so the compose stack doesn't fail on startup:

```fish
# example (fish shell)
set -x JWT_SECRET "your_jwt_secret_here"
set -x ENABLE_SWAGGER_UI "true"
set -x MONGO_INITDB_ROOT_USERNAME ""
set -x MONGO_INITDB_ROOT_PASSWORD ""
```

2. Build and start the stack (from repository root):

```bash
docker compose -f compose.yaml build
docker compose -f compose.yaml up -d
```

3. Check services:

```bash
docker compose -f compose.yaml ps
docker compose -f compose.yaml logs backend --follow
```

Why this Dockerfile was refactored
- Multi-stage build: we separate dependency installation into stages to keep the final image small and free of build/dev tooling.
- `ENABLE_SWAGGER_UI=true` exposes Swagger docs even when `NODE_ENV=production` (use with caution in public environments).
- Pinning base image: using `node:22-alpine` (explicit version) improves reproducibility compared to `node:lts-alpine`.
- Non-root runtime: we create `appuser` and run the app as non-root for reduced attack surface.

Notes and recommendations
- The backend previously imported development-only packages (e.g., `swagger-ui-express`) statically. That caused the production image to crash when those packages were not installed. The app now dynamically imports dev-only modules only in non-production environments.
- Keep secrets out of images. Use runtime env vars, Docker secrets, or a secret manager for production.
- Add `.dockerignore` to reduce build context size (added in repo root).
- Consider adding scanning and linting in CI (Hadolint for Dockerfiles, Trivy for images).

Healthchecks
- Compose uses HTTP healthchecks for backend and frontend. Ensure the endpoints exist and are lightweight. If your app needs extra time on first run (e.g., DB migrations), increase `start_period` in the compose healthcheck.

Testing inside container
- To run tests in the builder context (optional):

```bash
# Build the builder image and run tests
docker build --target builder -t fiap-backend-builder tech_challenge1/backend
docker run --rm fiap-backend-builder npm test
```

CI notes
- Use multi-stage builds in CI to build artifacts and then publish only runtime images.
- Consider scanning images during CI with Trivy and enforce policies for high severity vulnerabilities.
