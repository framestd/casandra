build:
	docker compose build

up-build:
	docker compose up --build

start:
	docker compose up

next-clean:
	rm -rf ./.next
	rm -rf ./web_client/.next

migrations-clean:
	rm ./web_services/alembic/versions/*

python-clean:
	find . -type d -name "__pycache__" ! -path "./venv/*" -exec rm -rf {} +
