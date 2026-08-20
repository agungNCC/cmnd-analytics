FROM node:18-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Create upload and log directories
RUN mkdir -p uploads logs

EXPOSE 5000

# Production default. Local compose overrides with `npm run dev`.
CMD ["npm", "start"]
