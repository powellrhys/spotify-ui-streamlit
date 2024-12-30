// Import test dependencies
const { exportTopData } = require('../api/functions/exportData');
const axios = require('axios');
const { BlobServiceClient } = require('@azure/storage-blob');

// Mock imports
jest.mock('axios');
jest.mock('@azure/storage-blob');

// Execute tests
describe('exportTopData', () => {
  // Mock request variables
  const mockAccessToken = 'mock_access_token';
  const mockBlobConnectionString = 'mock_blob_connection_string';
  const mockHostUrl = 'mockhost.com';

  // Mock expected request response
  const mockTopTracksResponse = [
    { id: '1', name: 'Track 1' },
    { id: '2', name: 'Track 2' },
    { id: '3', name: 'Track 3' },
  ];

  // Before each test, wipe env variables
  beforeAll(() => {
    process.env.host_url = mockHostUrl;
  });

  // Test to ensure that top tracks are retrieved and uploaded to blob
  it('should fetch top tracks and upload the data to Azure Blob Storage', async () => {
    // Mock resolved value
    axios.get.mockResolvedValue({ data: mockTopTracksResponse });

    // Mock container client
    const mockContainerClient = {
      getBlockBlobClient: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue(),
      }),
    };

    // Mock container client
    const mockBlobServiceClient = {
      getContainerClient: jest.fn().mockReturnValue(mockContainerClient),
    };

    // Mock blob service client using a mocked blob connection string
    BlobServiceClient.fromConnectionString.mockReturnValue(mockBlobServiceClient);

    // Execute request
    await expect(exportTopData('tracks', 'short_term', 50, mockAccessToken, mockBlobConnectionString)).resolves.not.toThrow();

    // Assertions for API call
    expect(axios.get).toHaveBeenCalledWith(`http://${mockHostUrl}/top`, {
      params: {
        access_token: mockAccessToken,
        type: 'tracks',
        time_range: 'short_term',
        limit: 50,
      },
    });

    // Assertions for Blob Storage
    expect(BlobServiceClient.fromConnectionString).toHaveBeenCalledWith(mockBlobConnectionString);
    expect(mockBlobServiceClient.getContainerClient).toHaveBeenCalledWith('spotify');
    expect(mockContainerClient.getBlockBlobClient).toHaveBeenCalledWith('top_tracks_short_term.json');

    // Assertions for Blob Storage
    const mockBlockBlobClient = mockContainerClient.getBlockBlobClient.mock.results[0].value;
    expect(mockBlockBlobClient.upload).toHaveBeenCalledWith(
      JSON.stringify(mockTopTracksResponse, null, 2),
      JSON.stringify(mockTopTracksResponse, null, 2).length,
      {
        blobHTTPHeaders: { blobContentType: 'application/json' },
      }
    );
  });

    // Test to ensure an error is thrown for an invalid data type
  it('should throw an error for invalid type', async () => {
    await expect(exportTopData('invalid_type', 'short_term', 50, mockAccessToken, mockBlobConnectionString)).rejects.toThrow(
      "Invalid parameter 'type'. Expected 'tracks' or 'artists'."
    );
  });

  // Test to ensure an error is thrown for an invalid time_range
  it('should throw an error for invalid time_range', async () => {
    await expect(exportTopData('tracks', 'invalid_time_range', 50, mockAccessToken, mockBlobConnectionString)).rejects.toThrow(
      "Invalid parameter 'time_range'. Expected 'short_term', 'medium_term', or 'long_term'."
    );
  });

  // Test to ensure an error is thrown for a limit exceeding 50
  it('should throw an error for limit exceeding 50', async () => {
    await expect(exportTopData('tracks', 'short_term', 51, mockAccessToken, mockBlobConnectionString)).rejects.toThrow(
      "Invalid parameter 'limit'. Value cannot exceed 50."
    );
  });

  // Test to ensure an error is thrown if an access token is missing
  it('should throw an error if access_token is missing', async () => {
    await expect(exportTopData('tracks', 'short_term', 50, null, mockBlobConnectionString)).rejects.toThrow(
      'Parameter access_token required'
    );
  });

  // Test to ensure that an error is thrown if a blob connection string is missing
  it('should throw an error if blob_connection_string is missing', async () => {
    await expect(exportTopData('tracks', 'short_term', 50, mockAccessToken, null)).rejects.toThrow(
      'Parameter blob_connection_string required'
    );
  });

  // Test to ensure an error is thrown if the API calls fail
  it('should throw an error if API call fails', async () => {
    axios.get.mockRejectedValue(new Error('API error'));

    await expect(exportTopData('tracks', 'short_term', 50, mockAccessToken, mockBlobConnectionString)).rejects.toThrow(
      'API error'
    );
  });
});
