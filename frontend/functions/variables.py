# Import python dependencies
from dotenv import load_dotenv
import os

# Read env variables from local .env (used for local development)
load_dotenv()

class Variables:
    '''
    Input: None
    Output: None
    Class to hold all codebase constants
    '''
    def __init__(self):

        # Api variables
        self.client_id = os.getenv('client_id')
        self.client_secret = os.getenv('client_secret')
        self.host_url = os.getenv('host_url')

        # Spotify variables
        self.spotify_user_id = os.getenv('spotify_user_id')
        self.spotify_username = os.getenv('spotify_username')
        self.spotify_password = os.getenv('spotify_password')

        # Blob storage variables
        self.blob_storage_connection_string = os.getenv('blob_storage_connection_string')

        # UI variables
        self.login_required = eval(os.getenv('LOGIN_REQUIRED', str(True)))
        self.app_username = os.getenv('APP_USERNAME')
        self.app_password = os.getenv('APP_PASSWORD')
