# Use a specific Node.js version for better compatibility
FROM node:20-slim

# Install system dependencies required for node-canvas and other native modules
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    build-essential \
    python3 \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Pass environment variables for Prisma
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy rest of the code
COPY . .

# Make sure the build script is executable
RUN chmod +x ./build.sh

# Expose the required port
EXPOSE 5000

# Run the start script
CMD ["./build.sh"]
