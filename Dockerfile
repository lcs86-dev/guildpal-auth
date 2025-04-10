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
FROM node:18-alpine AS build

WORKDIR /app

# Copy the .env file first
COPY .env .env

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS deploy

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.env ./.env

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

CMD ["node", "build"]