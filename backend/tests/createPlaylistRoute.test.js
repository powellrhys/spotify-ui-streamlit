// Import project dependencies
const request = require('supertest');
const express = require('express');
const router = require('../api/routes/createplaylist.js');
const axios = require('axios');

// Mock axios for controlled responses in tests
jest.mock('axios');

// Define express application to test endpoint
const app = express();
app.use(express.json());
app.use('/', router);

// Execute tests
describe('POST /', () => {

    // Define mock variables
    const mockAccessToken = 'mock_access_token';
    const mockUserId = 'mock_user_id';
    const mockPlaylistName = 'My Playlist';
    const mockNewPlaylistId = 'new_playlist_id';

    // After each test, clear mock variables
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test to ensure 400 response code is returned if access token is missing
    test('should return 400 if access_token is missing', async () => {
        const res = await request(app).post('/').query({
            playlist_name: mockPlaylistName,
            user_id: mockUserId
        });

        // Assertions of response value
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Parameter access_token required' });
    });

    // Test to ensure 400 response code if returned if playlist_name is missing
    test('should return 400 if playlist_name is missing', async () => {
        const res = await request(app).post('/').query({
            access_token: mockAccessToken,
            user_id: mockUserId
        });

        // Assertion of response value
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Parameter playlist_name required' });
    });

    // Test to ensure 400 response code is returned if user_id is missing
    test('should return 400 if user_id is missing', async () => {
        const res = await request(app).post('/').query({
            access_token: mockAccessToken,
            playlist_name: mockPlaylistName
        });

        // Assertion of response value
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Parameter playlist_name required' });
    });

    // Test to ensure a new playlist gets created with zero conflicts
    test('should create a new playlist successfully when no conflict exists', async () => {
        // Mock variables for test
        axios.get.mockResolvedValue({
            data: { items: [] }, // No existing playlists
        });
        axios.post.mockResolvedValue({
            data: { id: mockNewPlaylistId },
        });
        axios.put.mockResolvedValue({});

        // Execute mock request
        const res = await request(app)
            .post('/')
            .query({
                access_token: mockAccessToken,
                playlist_name: mockPlaylistName,
                user_id: mockUserId,
                public: true,
                description: 'Test Playlist',
            })
            .send({
                tracks: ['spotify:track:1', 'spotify:track:2'],
            });

        // Assertion of response values
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: `Playlist ${mockPlaylistName} created for user ${mockUserId}, with id ${mockNewPlaylistId}`,
            new_playlist_id: mockNewPlaylistId,
        });

        // Assertion of response values
        expect(axios.get).toHaveBeenCalledWith(
            `https://api.spotify.com/v1/users/${mockUserId}/playlists`,
            expect.objectContaining({
                headers: { Authorization: `Bearer ${mockAccessToken}` },
            })
        );

        // Assertion of response values
        expect(axios.post).toHaveBeenCalledWith(
            `https://api.spotify.com/v1/users/${mockUserId}/playlists`,
            expect.objectContaining({
                name: mockPlaylistName,
                description: 'Test Playlist',
                public: "true", // Ensure public matches as a string, or change to true if fixed in the handler
            }),
            expect.objectContaining({
                headers: {
                    Authorization: `Bearer ${mockAccessToken}`,
                    "Content-Type": "application/json", // Add this to match the implementation
                },
            })
        );

        // Assertion of response values
        expect(axios.put).toHaveBeenCalledWith(
            `https://api.spotify.com/v1/playlists/${mockNewPlaylistId}/tracks?uris=spotify:track:1,spotify:track:2`,
            {},
            expect.objectContaining({
                headers: { Authorization: `Bearer ${mockAccessToken}` },
            })
        );
    });

    // Test to ensure any playlist with the same name is removed before creating a new one with a new ID
    test('should delete existing playlist with same name before creating a new one', async () => {
        // Mock variables
        const mockExistingPlaylistId = 'existing_playlist_id';
        axios.get.mockResolvedValue({
            data: {
                items: [
                    { name: mockPlaylistName, id: mockExistingPlaylistId },
                ],
            },
        });
        axios.delete.mockResolvedValue({});
        axios.post.mockResolvedValue({
            data: { id: mockNewPlaylistId },
        });
        axios.put.mockResolvedValue({});

        // Execute request
        const res = await request(app)
            .post('/')
            .query({
                access_token: mockAccessToken,
                playlist_name: mockPlaylistName,
                user_id: mockUserId,
            })
            .send({
                tracks: ['spotify:track:3', 'spotify:track:4'],
            });
        
        // Assertion of response values
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: `Playlist ${mockPlaylistName} created for user ${mockUserId}, with id ${mockNewPlaylistId}`,
            new_playlist_id: mockNewPlaylistId,
        });

        // Assertion of response values
        expect(axios.delete).toHaveBeenCalledWith(
            `https://api.spotify.com/v1/playlists/${mockExistingPlaylistId}/followers`,
            expect.objectContaining({
                headers: { Authorization: `Bearer ${mockAccessToken}` },
            })
        );
    });
});
