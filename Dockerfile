# Build Stage
FROM node:22-alpine AS builder

WORKDIR /home/app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code 
COPY . .

# Build the app
RUN npm run build


EXPOSE 5173

# Start the Node.js app
CMD ["npm", "run", "dev", "--", "--host"]