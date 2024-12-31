# Use a Node.js base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json .
RUN npm install

# Copy the Node.js app
COPY . .

# Expose the port your app will run on (default 3000)
EXPOSE 3000

# Start the Node.js server
CMD ["npm", "run", "start"]
