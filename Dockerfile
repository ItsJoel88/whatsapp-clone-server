# Use official Node.js base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy files
COPY package*.json ./
COPY server.js ./

# Install dependencies
RUN npm install

# Expose WebSocket server port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
