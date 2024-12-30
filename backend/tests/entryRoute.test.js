// Import test dependencies
const request = require('supertest');
const app = require('../app');

// Mock the axios module
jest.mock('axios');

// Execute test for endpoint
describe('/entry endpoint', () => {
    // Clear mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Ensure that a 200 response code and the application name is returned when calling the endpoint
    it('should return 200 and the application name', async () => {
        const response = await request(app).get('/'); // Perform GET request to root
        expect(response.status).toBe(200); // Check status code
        expect(response.body).toEqual({
            application: 'spotify-streamlit-backend',
        }); // Check response body
    });
});
