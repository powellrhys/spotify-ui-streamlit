// Import file dependencies
const { BlobServiceClient } = require("@azure/storage-blob");
const axios = require('axios');

// Import environmental variables from config file (.env)
require('dotenv').config({ path: '../.env' });

/**
 * Function to collect top artist and track data from spotify profile
 * @param {string} [type='tracks'] - Data of interest, acceptable values include tracks or artists
 * @param {string} [time_range='short_term'] - Time range to sample, acceptable values include short_term, medium_term, long_term 
 * @param {number} [limit=50] - How many values to return, maximum value is 50
 * @param {string} access_token - Access token required to access account data
 * @param {string} blob_connection_string - Azure blob storage connection string to write out data
 */
async function exportTopData(
    type = 'tracks',
    time_range ='short_term',
    limit = 50,
    access_token,
    blob_connection_string
) {
    // Ensure type is valid
    if (type !== 'tracks' && type !== 'artists') {
        throw new Error("Invalid parameter 'type'. Expected 'tracks' or 'artists'.");
    }

    // Ensure time_range is valid
    if (time_range !== 'short_term' && time_range !== 'medium_term' && time_range !== 'long_term') {
        throw new Error("Invalid parameter 'time_range'. Expected 'short_term', 'medium_term', or 'long_term'.");
    }

    // Ensure limit is valid
    if (limit > 50) {
        throw new Error("Invalid parameter 'limit'. Value cannot exceed 50.");
    }

    // Ensure access token has been provided
    if (!access_token) {
        throw new Error('Parameter access_token required');
    }

    // Ensure blob connection string has been provided
    if (!blob_connection_string) {
        throw new Error('Parameter blob_connection_string required');
    }

    // Collect a list of top item based on input parameters
    response = await axios.get(`http://${process.env.host_url}/top`, {
        params: {
            access_token: access_token,
            type: type,
            time_range: time_range,
            limit: limit
        },
    });

    // Convert the JSON object to a string
    const jsonString = JSON.stringify(response.data, null, 2); // Pretty format with 2 spaces

    // Define the file path
    const fileName = `top_${type}_${time_range}.json`;

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
}

// Export function
module.exports = {exportTopData};
