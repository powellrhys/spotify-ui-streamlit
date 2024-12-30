// Import test dependencies
const request = require('supertest');
const express = require('express');
const router = require('../api/routes/callback');
const axios = require('axios');

// Configure mock for axios
jest.mock('axios');

// Import project dependencies
const { exportTopData } = require('../api/functions/exportData');
const { createPlaylist } = require('../api/functions/createPlaylist');

// Mock project dependencies
jest.mock('../api/functions/exportData');
jest.mock('../api/functions/createPlaylist');

// Spin up an express app for endpoint testing
const app = express();
app.use('/', router);

// Endpoint tests
describe('Spotify Authorization Callback Endpoint Tests', () => {
    const mockEnv = {
        blob_storage_connection_string: 'mock_blob_storage_connection_string',
        host_url: 'mockhost.com',
        client_id: 'mock_client_id',
        client_secret: 'mock_client_secret',
    };

    // Before all tests mock env variables
    beforeAll(() => {
        process.env = { ...process.env, ...mockEnv };
    });

    // Check that the endpoint returns an error when the code is missing
    it('should return an error when code is missing', async () => {
        const response = await request(app).get('/?state=update-data');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Authorization failed.');
    });

    // Check that the endpoint returns an error when the action is missing
    it('should return an error when state (action) is missing', async () => {
        const response = await request(app).get('/?code=mock_code');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Parameter Action Required.');
    });

    // Check that the endpoint returns a successful response
    it('should handle successful token exchange and update-data action', async () => {
        const mockAccessToken = 'mock_access_token';
        axios.post.mockResolvedValue({
            data: { access_token: mockAccessToken },
        });

        const response = await request(app).get('/?code=mock_code&state=update-data');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Data successfully exported');
        expect(response.body.access_token).toBe(mockAccessToken);
        expect(response.body.action_performed).toBe('update-data');

        expect(exportTopData).toHaveBeenCalledTimes(6);
        expect(exportTopData).toHaveBeenCalledWith('tracks', 'short_term', 50, mockAccessToken, mockEnv.blob_storage_connection_string);
    });

    // Check the endpoint return a successful token for create-playlist action
    it('should handle successful token exchange and create-playlist action', async () => {
        const mockAccessToken = 'mock_access_token';
        axios.post.mockResolvedValue({
            data: { access_token: mockAccessToken },
        });

        const response = await request(app).get('/?code=mock_code&state=create-playlist-short_term');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Data successfully exported');
        expect(response.body.access_token).toBe(mockAccessToken);
        expect(response.body.action_performed).toBe('create-playlist-short_term');

        expect(createPlaylist).toHaveBeenCalledWith('short_term', mockAccessToken, mockEnv.blob_storage_connection_string);
    });

});
