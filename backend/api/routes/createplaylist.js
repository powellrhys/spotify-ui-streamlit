// Import node dependencies
const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Express endpoint to create or overwrite a Spotify playlist for a user.
 *
 * This endpoint allows the creation of a new Spotify playlist for a user with specified metadata
 * and a list of tracks. If a playlist with the same name already exists, it will be deleted
 * before creating the new one.
 *
 * Query Parameters:
 * - `access_token` (string, required): Spotify API access token for user authentication.
 * - `playlist_name` (string, required): Name of the playlist to create.
 * - `user_id` (string, required): Spotify user ID for whom the playlist will be created.
 * - `description` (string, optional): Description of the playlist.
 * - `public` (boolean, optional): Visibility status of the playlist (default: `false`).
 *
 * Request Body:
 * - `tracks` (array, optional): Array of Spotify track URIs to include in the playlist.
 *
 * Success Response:
 * - Status: 200
 * - JSON:
 *   {
 *     "message": "Playlist <playlist_name> created for user <user_id>, with id <new_playlist_id>",
 *     "playlist_id": "<playlist_id>"
 *   }
 *
 * Error Responses:
 * - Status: 400
 *   - JSON: { "error": "Parameter access_token required" }
 *   - JSON: { "error": "Parameter playlist_name required" }
 *   - JSON: { "error": "Parameter user_id required" }
 * - Status: 500
 *   - JSON: Error message from Spotify API or internal processing error.
 *
 * Process:
 * 1. Checks if the required query parameters (`access_token`, `playlist_name`, `user_id`) are provided.
 * 2. Fetches the user's current playlists to check for name conflicts.
 * 3. Deletes an existing playlist if it matches the desired name.
 * 4. Creates a new playlist with the specified metadata.
 * 5. Adds the provided tracks to the newly created playlist.
 *
 * Dependencies:
 * - axios: For making HTTP requests to Spotify's API.
 *
 * @route POST /
 * @returns {JSON} Success or error message.
 */
router.post('/', async (req, res) => {

    // Collect api constants from request
    const access_token = req.query.access_token;
    const playlist_name = req.query.playlist_name;
    const user_id = req.query.user_id;
    const description = req.query.description || null;
    const public_status = req.query.public || false;
    const tracks = req.body.tracks || [];

    // Ensure access token has been provided
    if (!access_token) {
        return res.status(400).json({ error: 'Parameter access_token required' });
    }

    // Ensure playlist name has been provided
    if (!playlist_name) {
        return res.status(400).json({ error: 'Parameter playlist_name required' });
    }

    // Ensure user id has been provided
    if (!user_id) {
        return res.status(400).json({ error: 'Parameter playlist_name required' });
    }

    try {
        // Collect a list of current playlists
        var response = await axios.get(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            params: {
                limit: 50,
            },
        });
        
        // Create a list of current existing playlist names and ids 
        var current_playlists = response.data.items.filter(item => item !== null);
        current_playlists = current_playlists.map(item => ({
            playlist_name : item.name,
            playlist_id : item.id
        }));

        // Check if new playlist name has already been taken
        const exists = current_playlists.some(item => item.playlist_name === playlist_name);

        // Delete playlist if it already exists
        if (exists) {

            // Collect existing playlist id based on the new playlist name
            const matched_playlist = current_playlists.find(item => item.playlist_name === playlist_name);
            const matched_playlist_id = matched_playlist.playlist_id;

            // Delete current version of the playlist
            response = await axios.delete(`https://api.spotify.com/v1/playlists/${matched_playlist_id}/followers`, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            });
        }

        // Create a new empty playlist with all supporting metadata
        response = await axios.post(`https://api.spotify.com/v1/users/${user_id}/playlists`,
            {
                name: playlist_name,
                description: description,
                public: public_status
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": 'application/json'
                },
        });

        // Collect the playlist id of the newly created playlist
        const new_playlist_id = response.data.id;

        // Append songs to the empty playlist
        response = await axios.put(`https://api.spotify.com/v1/playlists/${new_playlist_id}/tracks?uris=${tracks.join(',')}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            }
        );
        
        // Return response
        return res.status(200).json({
            message: `Playlist ${playlist_name} created for user ${user_id}, with id ${new_playlist_id}`,
            new_playlist_id: new_playlist_id
        });


    } catch (error) {
        console.error('Error creating new playlist:', error.response?.data || error.message);
        throw error;
    }
});

// Export router
module.exports = router;
