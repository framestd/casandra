#!/usr/bin/env bash

echo "running migrations commands..."

# whatever args are passed to this script when run are redirected to the
# `alembic revision --autogenerate` command
python -m alembic revision --autogenerate "$@" # -m "create inital tables"
python -m alembic upgrade head

echo "applied migrations!"
