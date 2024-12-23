// Import node dependencies
const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Endpoint to retrieve a user's top tracks or artists from Spotify.
 *
 * This endpoint queries the Spotify API to fetch a user's top tracks or artists based on 
 * the specified type, time range, and limit. It returns the data in a structured format,
 * including relevant details such as name, URL, followers, and images.
 *
 * Query Parameters:
 * - `access_token` (string, required): Spotify API access token for user authentication.
 * - `type` (string, optional): The type of data to fetch: `'tracks'` or `'artists'` (default: `'tracks'`).
 * - `time_range` (string, optional): Time period for which the data is fetched. Valid values: `'short_term'`, `'medium_term'`, `'long_term'` (default: `'short_term'`).
 * - `limit` (number, optional): The number of items to return (default: 50).
 *
 * Success Response:
 * - Status: 200
 * - JSON:
 *   - For `type='artists'`: 
 *     - Array of artist objects, each containing:
 *       - `artist_name`: Artist name.
 *       - `artist_url`: URL to the artist's Spotify page.
 *       - `artist_followers`: Number of followers.
 *       - `artist_img`: URL of the artist's image.
 *   - For `type='tracks'`:
 *     - Array of track objects, each containing:
 *       - `song_name`: Song name.
 *       - `artist_name`: Artist name.
 *       - `song_url`: URL to the track's Spotify page.
 *       - `song_uri`: URI of the track.
 *       - `song_img`: URL of the track's album image.
 *
 * Error Response:
 * - Status: 400
 *   - JSON: { "error": "Parameter access_token required" }
 * - Status: 500
 *   - JSON: Error message from Spotify API or internal processing error.
 *
 * Dependencies:
 * - `axios`: For making HTTP requests to Spotify's API.
 *
 * @route GET /
 * @returns {JSON} User's top tracks or artists based on specified parameters.
 */
router.get('/', async (req, res) => {

    // Extract api constants from request
    const access_token = req.query.access_token;
    const type = req.query.type || 'tracks';
    const time_range = req.query.time_range || 'short_term';
    const limit = req.query.limit || 50;

    // Ensure access token has been provided
    if (!access_token) {
        return res.status(400).json({ error: 'Parameter access_token required' });
    }

    try {
        // Call top spotify api
        const response = await axios.get(`https://api.spotify.com/v1/me/top/${type}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            params: {
                time_range,
                limit,
            },
        });

        // Return artist specific data
        if (type === 'artists') {

            return res.status(200).json(
                response.data.items.map(item => ({
                    artist_name : item.name,
                    artist_url : item.external_urls.spotify,
                    artist_followers : item.followers.total,
                    artist_img : item.images[0].url
                }))
            );
        }

        // Return track specific data
        if (type === 'tracks'){
            
            return res.status(200).json(
                response.data.items.map(item => ({
                    song_name : item.album.name,
                    artist_name : item.album.artists[0]?.name,
                    song_url : item.album.external_urls.spotify,
                    song_uri : item.uri,
                    song_img : item.album.images[0].url
                }))
            );    
        }

    } catch (error) {
        console.error('Error fetching top items:', error.response?.data || error.message);
        throw error;
    }
});

// Export router
module.exports = router;
