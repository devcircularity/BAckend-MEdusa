# Use official Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build TypeScript / Medusa
RUN yarn build

# Expose port
EXPOSE 9000

# Start the server
CMD ["yarn", "start"]
