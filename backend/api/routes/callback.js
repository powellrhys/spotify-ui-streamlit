// Import node dependencies
const querystring = require('querystring');
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Import environmental variables from config file (.env)
require('dotenv').config({ path: '../.env' });

// Import custom project functions
const { exportTopData } = require('../functions/exportData');
const { createPlaylist } = require('../functions/createPlaylist');

/**
 * Express endpoint for handling Spotify API authorization callback and user actions.
 *
 * This endpoint handles the OAuth2 authorization code provided by Spotify, exchanges it
 * for an access token, and performs user-specified actions such as exporting user data
 * or creating a playlist. The supported actions include:
 * - `update-data`: Exports the user's top tracks and artists for short-term, medium-term,
 *   and long-term periods to blob storage.
 * - `create-playlist-{term}`: Creates a new playlist based on the user's top tracks for a
 *   specified term (`short_term`, `medium_term`, or `long_term`).
 *
 * Environmental Variables:
 * - `blob_storage_connection_string` (string): Connection string for blob storage.
 * - `host_url` (string): Host URL for the application (used in redirect URI).
 * - `client_id` (string): Spotify application client ID.
 * - `client_secret` (string): Spotify application client secret.
 *
 * Query Parameters:
 * - `code` (string): Authorization code from Spotify's OAuth2 redirect. (Required)
 * - `state` (string): Action to perform, such as `update-data` or `create-playlist-{term}`. (Required)
 *
 * Success Response:
 * - Status: 200
 * - JSON:
 *   {
 *     "message": "Data successfully exported",
 *     "access_token": "<Spotify API access token>",
 *     "action_performed": "<Performed action>"
 *   }
 *
 * Error Responses:
 * - Message: "Authorization failed." (if `code` is missing).
 * - Message: "Parameter Action Required." (if `state` is missing).
 * - Message: "Failed to fetch access token." (if token exchange fails).
 *
 * Dependencies:
 * - axios: For making HTTP requests to Spotify's API.
 * - querystring: For encoding query parameters.
 * - dotenv: For loading environment variables from `.env` file.
 * - exportTopData (custom function): Exports user data to blob storage.
 * - createPlaylist (custom function): Creates a new Spotify playlist.
 *
 * @route GET /
 * @returns {JSON} Success or error message based on the performed action.
 */
router.get('/', async (req, res) => {
    const code = req.query.code || null;
    const action = req.query.state;
    const blob_storage_connection_string = process.env.blob_storage_connection_string;

    // Ensure code has been captured during redirect
    if (!code) {
        res.send('Authorization failed.');
        return;
    }

    // Ensure code has been captured during redirect
    if (!action) {
        res.send('Parameter Action Required.');
        return;
    }

    try {
        // Collect api token via post request
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `http://${process.env.host_url}/callback`,
                client_id: process.env.client_id,
                client_secret: process.env.client_secret,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Collect access token from response
        const { access_token } = await tokenResponse.data;

        // Update data is that the action
        if (action === 'update-data') {

             // Define term types for data collection
            const term_types = ['short_term', 'medium_term', 'long_term'];

            // Export top track and artist data
            for (let i = 0; i < term_types.length; i++) {
                exportTopData('tracks', term_types[i], 50, access_token, blob_storage_connection_string);
                exportTopData('artists', term_types[i], 50, access_token, blob_storage_connection_string);
            };  
        }

        // Create new playlist if that is the action
        if (action.includes('create-playlist')) {

            const action_array = action.split('-');
            const term = action_array[action_array.length - 1];

            await createPlaylist(term, access_token, blob_storage_connection_string);
        }     

        // Return access token
        res.status(200).json({
            message : 'Data successfully exported',
            access_token : access_token,
            action_performed: action 
        });

    } catch (error) {
        console.error('Error fetching access token:', error.response.data || error.message);
        res.send('Failed to fetch access token.');
    }
});

// Export router
module.exports = router;
