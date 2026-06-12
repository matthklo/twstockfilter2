# syntax=docker/dockerfile:1
# ^ pull the latest stable version of the Dockerfile syntax before the build

# Copyright 2021 Google LLC
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#      http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Stage 1: Build the TypeScript application
FROM node:24-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies (including devDependencies) to build the app
RUN npm ci

COPY . ./

# Build the TypeScript project
RUN npm run build

# Stage 2: Create the production image
FROM node:24-slim

WORKDIR /usr/src/app

COPY package*.json Procfile ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the compiled transpiled output (except tests) from the builder stage
COPY --from=builder --exclude=test/* /usr/src/app/dist ./

# Run the web service on container startup.
ENTRYPOINT [ "node", "index.js" ]
