
# Build client
FROM node:18-alpine AS build

# Run with `--build-arg server_base_url=http://example.com`
ARG server_base_url

# Required for build as communication is made to server
# during build (`yarn build`)
ENV SERVER_BASE_URL=$server_base_url

# Define working directory for client
WORKDIR /kaysolo/dissertation/kaybot

# Copy package metadata for client
COPY ./package.json .
COPY ./yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy other source files except those ignored in .dockerignore
COPY . .

# Run build script
RUN yarn build


# Build production image
FROM node:18-alpine as production

# Define working directory for client
WORKDIR /kaysolo/dissertation/kaybot

# Copy package metadata for client
COPY ./package.json .
COPY ./yarn.lock .

# Install production only dependencies
RUN yarn install --production --frozen-lockfile

# Copy build files from previous stage
COPY --from=client-build /kaysolo/dissertation/kaybot/.next ./.next

# Define default container start script
CMD ["yarn", "start"]
