build:
	docker compose build

up-build:
	docker compose up --build

start:
	docker compose up

next-clean:
	rm -rf ./.next
	rm -rf ./kaybot/.next

migrations-clean:
	rm ./kaybot-services/alembic/versions/*

python-clean:
	find . -type d -name "__pycache__" ! -path "./venv/*" -exec rm -rf {} +
