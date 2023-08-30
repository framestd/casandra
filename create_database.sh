#!/usr/bin/env bash

databases=("casandra" "casandra_test")

# https://stackoverflow.com/a/70976611/8124214
for db in $databases; do
  psql -U ${POSTGRES_USER} <<-END
    CREATE DATABASE $db
      WITH
      OWNER = ${POSTGRES_USER}
      ENCODING = 'UTF8'
      CONNECTION LIMIT = -1
      IS_TEMPLATE = False;
END

  psql -U ${POSTGRES_USER} -d $db -c "CREATE EXTENSION IF NOT EXISTS citext"
done
