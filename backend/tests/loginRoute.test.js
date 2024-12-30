// Import required dependencies
const request = require('supertest');
const express = require('express');
const router = require('../api/routes/login');
require('dotenv').config({ path: '../.env' });

// Execute tests
describe('Spotify OAuth2 Authorization Endpoint', () => {
    let app;

    // Before each test, redefine the express application
    beforeAll(() => {
        app = express();
        app.use('/', router);
    });

    // Test to ensure that a redirect happens when no query parameters are provided
    test('Redirects with default parameters when no query params are provided', async () => {
        const response = await request(app).get('/');

        // Assert response status
        expect(response.status).toBe(302);

        // Parse redirect location
        const redirectUrl = new URL(response.headers.location);
        expect(redirectUrl.origin).toBe('https://accounts.spotify.com');
        expect(redirectUrl.pathname).toBe('/authorize');

        // Extract query params
        const params = Object.fromEntries(redirectUrl.searchParams);

        // Assert query params
        expect(params.response_type).toBe('code');
        expect(params.scope).toContain('user-read-private'); // Default scope
        expect(params.scope).toContain('playlist-read-collaborative');
        expect(params.redirect_uri).toBe(`http://${process.env.host_url}/callback`);
        expect(params.state).toBe('update-data'); // Default action
    });

    // Test to ensure the endpoint redirects traffic when a client_id is provided
    test('Redirects with custom client_id', async () => {
        const customClientId = 'test-client-id';
        const response = await request(app).get(`/?client_id=${customClientId}`);

        // Assert response status
        expect(response.status).toBe(302);

        // Parse redirect location
        const redirectUrl = new URL(response.headers.location);
        const params = Object.fromEntries(redirectUrl.searchParams);

        // Assert custom client_id
        expect(params.client_id).toBe(customClientId);
    });

    // Test to ensure traffic is redirected when custom scopes are provided
    test('Redirects with custom scopes', async () => {
        const customScopes = 'user-library-read user-library-modify';
        const response = await request(app).get(`/?scopes=${encodeURIComponent(customScopes)}`);

        // Assert response status
        expect(response.status).toBe(302);

        // Parse redirect location
        const redirectUrl = new URL(response.headers.location);
        const params = Object.fromEntries(redirectUrl.searchParams);

        // Assert custom scopes
        expect(params.scope).toBe(customScopes);
    });

    // Test to ensure that traffic is redirected with custom states provided
    test('Redirects with custom action state', async () => {
        const customAction = 'create-playlist';
        const response = await request(app).get(`/?action=${customAction}`);

        // Assert response status
        expect(response.status).toBe(302);

        // Parse redirect location
        const redirectUrl = new URL(response.headers.location);
        const params = Object.fromEntries(redirectUrl.searchParams);

        // Assert custom action state
        expect(params.state).toBe(customAction);
    });
});
