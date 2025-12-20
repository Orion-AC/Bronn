FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Run vite with --host to allow external access within docker network
CMD ["npm", "run", "dev", "--", "--host"]
