#!/usr/bin/env python

# Standard Library
from os.path import abspath
from subprocess import run

# Third Party
from dotenv import dotenv_values


JWT_RS256_PUB_KEY = "JWT_RS256_PUB_KEY"
JWT_RS256_KEY = "JWT_RS256_KEY"


def format(data: str):
    return '"{transformed_data}"\n'.format(
        transformed_data=data.strip().replace("\n", "\\n")
    )


def save_env_file(data_dict: dict[str, str | None], file_path: str):
    with open(file_path, "w") as env_file:
        for key, value in data_dict.items():
            env_file.write(f"{key}={value}\n")


def main():
    key_generation_script_path = abspath("../jwtrs256.sh")
    pubkfile_path = abspath(".keychain/jwtRS256.key.pub")
    pkfile_path = abspath(".keychain/jwtRS256.key")
    envfile_path = abspath(".env")

    env_dict = dotenv_values(envfile_path)

    run(["bash", key_generation_script_path], check=True)

    with open(pubkfile_path, "r") as pubkfile:
        env_dict.update({JWT_RS256_PUB_KEY: format(pubkfile.read())})

    with open(pkfile_path, "r") as pkfile:
        env_dict.update({JWT_RS256_KEY: format(pkfile.read())})

    save_env_file(env_dict, envfile_path)

    print(
        """Signing key-pair generated and saved to:
        [private key {pkpath}],
        [public key {pbkpath}],
        [env file {envfilepath}]""".format(
            pkpath=pkfile_path, pbkpath=pubkfile_path, envfilepath=envfile_path
        )
    )


if __name__ == "__main__":
    main()
