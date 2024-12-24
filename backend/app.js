// Import express dependencies
const express = require('express');
const app = express();

// Define api endpoints
const entry = require('./api/routes/entry.js');
const callbackRoutes = require('./api/routes/callback');
const loginRoutes = require('./api/routes/login');
const topRoutes = require('./api/routes/top');
const createPlaylistRoutes = require('./api/routes/createplaylist');

// Add express middleware to accept json payloads
app.use(express.json());

// Define endpoints
app.use('/', entry);
app.use('/callback', callbackRoutes);
app.use('/login', loginRoutes);
app.use('/top', topRoutes);
app.use('/createplaylist', createPlaylistRoutes);

// Export application to be consumed by server
module.exports = app;
