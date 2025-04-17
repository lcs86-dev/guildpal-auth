# # Use a Node.js Alpine image for the builder stage
# FROM node:22-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
# RUN npm prune --production

# # Use another Node.js Alpine image for the final stage
# FROM node:22-alpine
# WORKDIR /app
# COPY --from=builder /app/build build/
# COPY --from=builder /app/node_modules node_modules/
# COPY package.json .
# EXPOSE 3000
# ENV NODE_ENV=production
# CMD [ "node", "build" ]

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install yarn
RUN apk add --no-cache yarn

# Copy package.json files and install dependencies
COPY package*.json yarn.lock* ./
RUN yarn install

# Copy the rest of the application
COPY . .

# ARGs for public env variables that might be needed at build time
ARG PUBLIC_GOOGLE_CLIENT_ID
ARG PUBLIC_AUTH_SERVICE_ORIGIN
ARG PUBLIC_MOBILE_GOOGLE_CLIENT_ID

# Set as environment variables for the build process
ENV PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID}
ENV PUBLIC_AUTH_SERVICE_ORIGIN=${PUBLIC_AUTH_SERVICE_ORIGIN}
ENV PUBLIC_MOBILE_GOOGLE_CLIENT_ID=${PUBLIC_MOBILE_GOOGLE_CLIENT_ID}

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS deploy

WORKDIR /app

# Install yarn
RUN apk add --no-cache yarn

# Copy built assets from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/yarn.lock* ./
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules

# Create a .env file for SvelteKit to read at runtime
# This will be overridden by environment variables passed at runtime
RUN echo "# Default values, will be overridden by container env vars" > .env

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set the host address to allow connections from outside the container
# ENV HOST=0.0.0.0

# Expose the port your app runs on
EXPOSE 3000

# The actual environment variables will be passed through docker-compose
CMD ["node", "build"]