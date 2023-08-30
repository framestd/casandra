# Casandra Application

Casandra is a chatbot that assists in consuming study documents, to propose and answer questions based on the provided study documents.

We make use of OpenAI's ability to process and understand natural language and generate content based on a provided prompt.

## How to run

Set essential environment variables. The first step to running the application is setting the environment variables required for the application to run.
You can create these `.env` files from the `.env.template` files or you could just use them as a guide to know what variables need to be provided.

Note: The JWT asymmetric keys are auto-generated and there's a Python script provided to generate them.

- There are a couple of `.env` files that need to be created from the `.env.template` files.
- There's a `.env` file required at the project root. These are essential for running the compose file, while some are passed by the compose file to individual applications.
- There's also a `.env` file required at the `./web_services` root. You may ignore the ones that are annotated with "`# SET IN docker-compose.yml`" when running locally.

After providing the values for these variables in their respective `.env` files you may go ahead to generate the JWT asymmetric signing key pairs:

```sh
cd ./web_services

chmod +x ./export_keys.py # once through the lifetime of the file

./export_keys.py
```

or simply:

```batch
cd ./web_services

python3 ./export_keys.py
```

When all these are done, you can go ahead to start the application in one of the following ways:

- Using the `make` command, since the project contains a `Makefile` at the project root
- Using `docker` directly from the command line

Note: Windows users, most likely, won't have the `make` command on their system. While the app can be started using the `docker` command directly,
you may also need to have Docker installed.

Using make:

```sh
make up_build
```

Using docker:

```sh
docker compose up --build
```
