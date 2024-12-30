// Import testing dependencies
const { createPlaylist } = require('../api/functions/createPlaylist');
const axios = require('axios');
const { BlobServiceClient } = require('@azure/storage-blob');

// Mock dependencies
jest.mock('axios');
jest.mock('@azure/storage-blob');

// Execute tests
describe('createPlaylist', () => {

  // Define mock variables
  const mockAccessToken = 'mock_access_token';
  const mockBlobConnectionString = 'mock_blob_connection_string';
  const mockTerm = 'medium_term';
  const mockHostUrl = 'mockhost.com';
  const mockSpotifyUserId = 'mock_spotify_user_id';

  // Define response
  const topTracksResponse = [
    { song_uri: 'spotify:track:1' },
    { song_uri: 'spotify:track:2' },
    { song_uri: 'spotify:track:3' },
  ];

  // Define create playlist response
  const createPlaylistResponse = {
    data: {
      new_playlist_id: 'mock_playlist_id',
    },
  };

  // Before all tests, redefine env variables
  beforeAll(() => {
    process.env.host_url = mockHostUrl;
    process.env.spotify_user_id = mockSpotifyUserId;
  });

  // Test to create a playlist and upload the playlist ID to Azure blob storage
  it('should create a playlist and upload the playlist ID to Azure Blob Storage', async () => {
    // Mock the Axios GET and POST responses
    axios.get.mockResolvedValue({ data: topTracksResponse });
    axios.post.mockResolvedValue(createPlaylistResponse);

    // Mock BlobServiceClient
    const mockContainerClient = {
      getBlockBlobClient: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue(),
      }),
    };

    // Mock blob client
    const mockBlobServiceClient = {
      getContainerClient: jest.fn().mockReturnValue(mockContainerClient),
    };

    // Define blob service client with mock block service client connection string =
    BlobServiceClient.fromConnectionString.mockReturnValue(mockBlobServiceClient);

    // Execute function with mock variables
    await expect(createPlaylist(mockTerm, mockAccessToken, mockBlobConnectionString)).resolves.not.toThrow();

    // Assertions for top tracks API call
    expect(axios.get).toHaveBeenCalledWith(`http://${mockHostUrl}/top`, {
      params: {
        access_token: mockAccessToken,
        type: 'tracks',
        time_range: mockTerm,
        limit: 50,
      },
    });

    // Assertions for playlist creation API call
    expect(axios.post).toHaveBeenCalledWith(
      `http://${mockHostUrl}/createplaylist?` +
        `access_token=${mockAccessToken}&playlist_name=My%20Top%20Tracks%20Playlist&user_id=${mockSpotifyUserId}&description=Generated%20playlist%20based%20on%20your%20top%20tracks&public=false`,
      {
        tracks: ['spotify:track:1', 'spotify:track:2', 'spotify:track:3'],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Assertions for Blob Storage upload
    expect(BlobServiceClient.fromConnectionString).toHaveBeenCalledWith(mockBlobConnectionString);
    expect(mockBlobServiceClient.getContainerClient).toHaveBeenCalledWith('spotify');
    expect(mockContainerClient.getBlockBlobClient).toHaveBeenCalledWith('playlist_id.json');

    // Assertions for playlist creation response
    const mockBlockBlobClient = mockContainerClient.getBlockBlobClient.mock.results[0].value;
    expect(mockBlockBlobClient.upload).toHaveBeenCalledWith(
      JSON.stringify({ playlist_id: 'mock_playlist_id' }, null, 2),
      JSON.stringify({ playlist_id: 'mock_playlist_id' }, null, 2).length,
      {
        blobHTTPHeaders: { blobContentType: 'application/json' },
      }
    );
  });

  // Test to ensure function returns expected response for failure
  it('should throw an error if any step fails', async () => {
    // Simulate a failure in fetching top tracks
    axios.get.mockRejectedValue(new Error('Failed to fetch top tracks'));

    await expect(createPlaylist(mockTerm, mockAccessToken, mockBlobConnectionString)).rejects.toThrow(
      'Unable to create playlist'
    );
  });
});
