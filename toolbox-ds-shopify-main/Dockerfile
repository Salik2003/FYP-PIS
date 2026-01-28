# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy all backend files
COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS app (if using TypeScript)
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]