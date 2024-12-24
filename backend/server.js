// Import server requirements
const http = require('http');
const app = require('./app');

// Define port number
const port = process.env.PORT || 3000;

// Spin up server based on app config
const server = http.createServer(app);

// Listen for requests on port 3000
server.listen(port);
