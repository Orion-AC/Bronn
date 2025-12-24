.PHONY: up down build logs logs-ap logs-backend logs-frontend shell-backend shell-frontend shell-ap clean dev-studio dev-backend

# =============================================================================
# Docker Compose Commands
# =============================================================================

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

rebuild:
	docker compose build --no-cache

logs:
	docker compose logs -f

logs-ap:
	docker compose logs -f activepieces

logs-backend:
	docker compose logs -f bronn-backend

logs-frontend:
	docker compose logs -f bronn-frontend

logs-db:
	docker compose logs -f postgres

# =============================================================================
# Shell Access
# =============================================================================

shell-backend:
	docker compose exec bronn-backend /bin/bash

shell-frontend:
	docker compose exec bronn-frontend /bin/sh

shell-ap:
	docker compose exec activepieces /bin/sh

shell-db:
	docker compose exec postgres psql -U bronn -d bronn

# =============================================================================
# Development Commands
# =============================================================================
# Force rebase strategy for all local updates from GitHub
pull-rebase:
	git pull --rebase origin main

dev-studio:
	cd apps/studio-ui && npm run dev

dev-backend:
	cd apps/backend-api && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-db:
	docker compose up postgres redis -d

dev-ap:
	docker compose up postgres redis activepieces -d

# =============================================================================
# Infrastructure Only (for local development)
# =============================================================================

infra:
	docker compose up postgres redis activepieces -d

# =============================================================================
# Cleanup
# =============================================================================

clean:
	docker compose down -v
	docker system prune -f

# =============================================================================
# Status
# =============================================================================

status:
	docker compose ps

# =============================================================================
# Database
# =============================================================================

db-seed:
	docker compose exec bronn-backend python -m backend.seed

# =============================================================================
# Activepieces Subtree Management
# =============================================================================

ap-update:
	git subtree pull --prefix=apps/activepieces https://github.com/activepieces/activepieces.git main --squash
