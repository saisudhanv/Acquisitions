# Base image - adjust based on your application's requirements
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Set environment variable to determine if we're in production or development
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Start the application (adjust command as needed for your app)
CMD ["npm", "start"]