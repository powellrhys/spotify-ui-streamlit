// Import node dependencies
const express = require('express');
const router = express.Router();

/**
 * Health check endpoint for the Spotify Streamlit Backend application.
 *
 * This endpoint provides a simple JSON response indicating the service is running.
 * It can be used for monitoring or debugging purposes to confirm the backend is operational.
 *
 * Success Response:
 * - Status: 200
 * - JSON:
 *   {
 *     "application": "spotify-streamlit-backend"
 *   }
 *
 * @route GET /
 * @returns {JSON} Application name to confirm service availability.
 */
router.get('/', (req, res) => {
    
    // Return application status
    res.status(200).json({
        application : 'spotify-streamlit-backend',
    });

});

// Export router
module.exports = router;
