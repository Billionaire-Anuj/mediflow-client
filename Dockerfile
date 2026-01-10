# --- Stage 1: Build the Frontend Application using NodeJS and PNPM ---

# Use of a Light Weight NodeJS DisplayImage
FROM node:18-alpine AS build

# Build-Time Environment Selector (Staging or Production passed via the Docker Compose YAML)
ARG BUILD_ENV=production

# Setup of Working Directory Inside the Container
WORKDIR /app

# Enable of Corepack and Activatition of PNPM (used as a Package Manager)
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate

# Copy the Entire Project Directory into the Container
COPY . .

# Install all Dependencies without Enforcing Lockfile Version
RUN pnpm install --no-frozen-lockfile

# Move to the Frontend Project Directory
WORKDIR /app/apps/client

# Build the Production-Ready Static Files via BUILD_ENV
RUN if [ "$BUILD_ENV" = "production" ]; then \
      echo "Building CLIENT in PRODUCTION mode"; \
      pnpm run build:production; \
    elif [ "$BUILD_ENV" = "staging" ]; then \
      echo "Building CLIENT in STAGING mode"; \
      pnpm run build:staging; \
    else \
      echo "Building CLIENT with DEFAULT mode"; \
      pnpm run build; \
    fi

# --- Stage 2: Serve the Built Application using NGINX ---

# Use of the official NGINX Alpine DisplayImage for Light Weight Production Serving
FROM nginx:alpine AS production

# Copy the Built Frontend Files from the Previous Stage to NGINX's Default Public Directory
COPY --from=build /app/apps/client/dist /usr/share/nginx/html

# Copy of Custom NGINX Configuration to Support Client-Side Routing (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Port 80 for Serving HTTP traffic
EXPOSE 80

# Run NGINX in the Foreground
CMD ["nginx", "-g", "daemon off;"]
