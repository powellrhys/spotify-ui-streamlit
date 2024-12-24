// Import node dependencies
const express = require('express');
const router = express.Router();
const querystring = require('querystring');

// Import environmental variables from config file (.env)
require('dotenv').config({ path: '../.env' });

/**
 * Spotify OAuth2 Authorization Endpoint.
 *
 * This endpoint generates a Spotify authentication URL with the specified client ID, requested
 * scopes, and a redirect URI. It redirects the user to Spotify's authorization page to initiate
 * the OAuth2 flow. The endpoint also allows specifying an optional `action` parameter, which is 
 * passed as state during the authorization process.
 *
 * Query Parameters:
 * - `client_id` (string, required): Spotify application client ID. If not provided, the authorization
 *   process will fail on Spotify's side.
 * - `scopes` (string, optional): Space-separated list of Spotify API scopes to request. If not provided,
 *   the following default scopes are used:
 *     - `user-read-private`
 *     - `user-read-email`
 *     - `user-top-read`
 *     - `playlist-modify-private`
 *     - `playlist-modify-public`
 *     - `playlist-read-private`
 *     - `playlist-read-collaborative`
 * - `action` (string, optional): Describes the desired post-authorization action, such as
 *   `update-data` or `create-playlist`. Defaults to `update-data`.
 *
 * Redirects To:
 * - Spotify's authorization URL, which includes:
 *   - `response_type`: Set to `code`.
 *   - `client_id`: Provided via query parameter or defaults from `.env`.
 *   - `scope`: List of requested permissions.
 *   - `redirect_uri`: Constructed using the `host_url` environmental variable.
 *   - `state`: Passed action parameter for tracking intended operation post-authorization.
 *
 * Dependencies:
 * - `querystring`: For encoding query parameters into the URL.
 * - `dotenv`: For loading environment variables (`host_url`).
 *
 * Error Handling:
 * - If `client_id` is not provided, the endpoint still generates the authorization URL,
 *   but Spotify will reject the authentication request during the redirection.
 *
 * Usage:
 * - Access this endpoint via a GET request to obtain the redirect to Spotify's OAuth2 page.
 *
 * @route GET /
 * @returns {Redirect} Redirects the user to Spotify's authorization page.
 */
router.get('/', (req, res) => {

    // Define endpoint variables
    const CLIENT_ID = req.query.client_id || null;
    const ACTION = req.query.action || 'update-data';
    const SCOPES = req.query.scopes || 
        'user-read-private ' +
        'user-read-email ' +
        'user-top-read ' +
        'playlist-modify-private ' +
        'playlist-modify-public ' +
        'playlist-read-private ' +
        'playlist-read-collaborative';

    // Define authentication url
    const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: SCOPES,
        redirect_uri: `http://${process.env.host_url}/callback`,
        state: ACTION,
    })}`;

    // Redirect to authentication url
    res.redirect(authUrl);
});

// Export router
module.exports = router;
