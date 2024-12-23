const axios = require('axios');
const querystring = require('querystring'); // Make sure querystring is required
const { BlobServiceClient } = require("@azure/storage-blob");

/**
 * Creates a playlist of top tracks for a user and uploads the playlist ID to Azure Blob Storage.
 * 
 * @param {string} term - Specifies the time range for fetching top tracks.
 *                        Valid values: 'short_term', 'medium_term', 'long_term'.
 * @param {string} access_token - OAuth access token for authenticating API requests.
 * @param {string} blob_connection_string - Azure Blob Storage connection string for uploading data.
 * 
 * @throws {Error} Throws an error if unable to fetch top tracks, create the playlist, or upload data.
 * 
 * Workflow:
 * 1. Fetches the user's top tracks using the specified time range.
 * 2. Creates a new playlist containing the top tracks.
 * 3. Uploads the playlist ID as a JSON file to Azure Blob Storage.
 * 
 * Steps:
 * - API Endpoint for top tracks: `http://<host_url>/top`
 *   - Parameters:
 *     - `access_token`: User's OAuth token.
 *     - `type`: Always set to 'tracks'.
 *     - `time_range`: Value from `term` parameter.
 *     - `limit`: Maximum number of tracks (50).
 * 
 * - API Endpoint for playlist creation: `http://<host_url>/createplaylist`
 *   - Query Parameters:
 *     - `access_token`: User's OAuth token.
 *     - `playlist_name`: Title of the playlist ('My Top Tracks Playlist').
 *     - `user_id`: Spotify user ID (`process.env.spotify_user_id`).
 *     - `description`: Playlist description ('Generated playlist based on your top tracks').
 *     - `public`: Boolean for privacy settings (false).
 *   - Body:
 *     - `tracks`: Array of song URIs from the top tracks API response.
 * 
 * - Upload to Azure Blob Storage:
 *   - File name: `playlist_id.json`.
 *   - Container: `spotify`.
 * 
 * @example
 * await createPlaylist('medium_term', 'your_access_token', 'your_blob_connection_string');
 */
async function createPlaylist(
  term,
  access_token,
  blob_connection_string
  ) {
  try {
    // Fetch top tracks based on the time range (term)
    const response = await axios.get(`http://${process.env.host_url}/top`, {
      params: {
        access_token: access_token,
        type: 'tracks',
        time_range: term,
        limit: 50
      },
    });

    // Map the response to get only the song URIs
    const songUris = response.data.map(song => song.song_uri);

    // Define query parameters for the playlist creation request
    const queryParams = {
      access_token: access_token,
      playlist_name: 'My Top Tracks Playlist',
      user_id: process.env.spotify_user_id,
      description: 'Generated playlist based on your top tracks',
      public: false
    };

    // Define the body of the POST request (the tracks to be added to the playlist)
    const requestBody = {
      tracks: songUris
    };

    // Construct the query string and full URL for the POST request
    const queryString = querystring.stringify(queryParams);
    const apiUrl = `http://${process.env.host_url}/createplaylist?${queryString}`;

    // Make the POST request to create the playlist
    const createPlaylistResponse = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Convert the JSON object to a string
    const jsonString = JSON.stringify({playlist_id : createPlaylistResponse.data.new_playlist_id}, null, 2);

    // Define the file path
    const fileName = `playlist_id.json`;

    // Create a BlobServiceClient using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(blob_connection_string);

    // Get a container client
    const containerClient = blobServiceClient.getContainerClient('spotify');

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload the JSON string to the blob
    await blockBlobClient.upload(
        jsonString,
        jsonString.length,
        {
            blobHTTPHeaders: {
                blobContentType: "application/json"
            },
        }
    );

  } catch (error) {
    console.error('Error creating playlist:', error.message);
    throw new Error('Unable to create playlist');
  }
}

module.exports = { createPlaylist };
