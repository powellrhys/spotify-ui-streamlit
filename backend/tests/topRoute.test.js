// Import dependencies
const request = require('supertest');
const app = require('../app');
const axios = require('axios');

// Mock the axios module
jest.mock('axios');

// Execute tests
describe('/top endpoint', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    // Test to ensure that a 400 response code is returned if an access_token is missing
    it('should return 400 if access_token is missing', async () => {
        const response = await request(app).get('/top');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Parameter access_token required' });
    });

    // Ensure artist data in the correct format is returned when type='artists'
    it('should return artist data for type=artists', async () => {
        // Mock axios response
        axios.get.mockResolvedValue({
            data: {
                items: [
                    {
                        name: 'Artist 1',
                        external_urls: { spotify: 'http://artist1.url' },
                        followers: { total: 1000 },
                        images: [{ url: 'http://artist1.img' }]
                    }
                ]
            }
        });

        // Execute request
        const response = await request(app)
            .get('/top')
            .query({ access_token: 'mockToken', type: 'artists' });

        // Assertion of request response values
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                artist_name: 'Artist 1',
                artist_url: 'http://artist1.url',
                artist_followers: 1000,
                artist_img: 'http://artist1.img'
            }
        ]);
        expect(axios.get).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/top/artists',
            {
                headers: { Authorization: 'Bearer mockToken' },
                params: { time_range: 'short_term', limit: 50 }
            }
        );
    });

    // Ensure artist data in the correct format is returned when type='tracks'
    it('should return track data for type=tracks', async () => {
        // Mock axios response
        axios.get.mockResolvedValue({
            data: {
                items: [
                    {
                        album: {
                            name: 'Album 1',
                            artists: [{ name: 'Artist 1' }],
                            external_urls: { spotify: 'http://song1.url' },
                            images: [{ url: 'http://song1.img' }]
                        },
                        uri: 'spotify:track:mockUri1'
                    }
                ]
            }
        });

        // Execute request
        const response = await request(app)
            .get('/top')
            .query({ access_token: 'mockToken', type: 'tracks' });

        // Assertion of the request response values
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                song_name: 'Album 1',
                artist_name: 'Artist 1',
                song_url: 'http://song1.url',
                song_uri: 'spotify:track:mockUri1',
                song_img: 'http://song1.img'
            }
        ]);
        expect(axios.get).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/top/tracks',
            {
                headers: { Authorization: 'Bearer mockToken' },
                params: { time_range: 'short_term', limit: 50 }
            }
        );
    });

    // Ensure that the endpoint can handle empty response from the API
    it('should handle empty response from Spotify API', async () => {
        // Mock axios with an empty response
        axios.get.mockResolvedValue({ data: { items: [] } });

        // Execute request
        const response = await request(app)
            .get('/top')
            .query({ access_token: 'mockToken', type: 'tracks' });

        // Assertion of empty response values
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
});
