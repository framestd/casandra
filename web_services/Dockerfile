FROM tiangolo/uvicorn-gunicorn:python3.11-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ARG venv_path=.venv
ARG install_dev=true

WORKDIR /code

# set virtual env path
ENV VIRTUAL_ENV=/code/${venv_path}

# install poetry
RUN apt clean && apt update && apt install curl -y
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create true && \
    poetry config virtualenvs.in-project true && \
    poetry config virtualenvs.path ${VIRTUAL_ENV}

# create virtual env
RUN python -m venv $VIRTUAL_ENV

ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY ./pyproject.toml ./poetry.lock* /code/
RUN poetry env info --path
RUN poetry config --list
RUN bash -c "source ${VIRTUAL_ENV}/bin/activate && poetry install --no-root $(test "$install_dev" == false && echo "--no-dev") --no-interaction --no-ansi"

COPY ./alembic /code/
COPY ./alembic.ini /code/
COPY ./run_migrations.sh /code/
RUN chmod +x ./run_migrations.sh

COPY ./app /code/app
# ENV PYTHONPATH=/code

EXPOSE 8000
