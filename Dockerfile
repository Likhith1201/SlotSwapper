# Dockerfile

# 1. Use an official Node.js 18 image as the base
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install backend dependencies
RUN npm install

# 5. Copy the rest of your application code
# (We'll use .dockerignore to skip node_modules and frontend)
COPY . .

# 6. Expose the port the app runs on
EXPOSE 5000

# 7. Define the command to start the app
CMD [ "npm", "start" ]