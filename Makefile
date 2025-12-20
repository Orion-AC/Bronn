.PHONY: up down build logs shell-backend shell-frontend clean

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

shell-backend:
	docker compose exec backend /bin/bash

shell-frontend:
	docker compose exec frontend /bin/bash

clean:
	docker compose down -v
	docker system prune -f

