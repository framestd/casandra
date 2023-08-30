#!/usr/bin/env bash

openapi-generator-cli generate --skip-validate-spec\
  -i http://localhost:3780/openapi.json\
  -g typescript-axios\
  -o client\
  -p useSingleRequestParameter=true,supportsES6=true,ensureUniqueParams=true\
  -c ./openapi-gen.config.yml\
  -t ./client/templates
