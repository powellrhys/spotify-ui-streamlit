from functions.variables import Variables

def test_variables_initialization(monkeypatch):

    # Mock environment variables using monkeypatch
    mock_env_vars = {
        'client_id': 'mock_client_id',
        'client_secret': 'mock_client_secret',
        'spotify_user_id': 'mock_spotify_user_id',
        'spotify_username': 'mock_spotify_username',
        'spotify_password': 'mock_spotify_password',
        'blob_storage_connection_string': 'mock_blob_storage_connection_string',
        'host_url': 'host_url'
    }

    # Create a set of mocked environmental variables
    for key, value in mock_env_vars.items():
        monkeypatch.setenv(key, value)

    # Create Variables instance
    variables = Variables()

    # Assert that variables were initialized correctly
    assert variables.client_id == 'mock_client_id'
    assert variables.client_secret == 'mock_client_secret'
    assert variables.spotify_user_id == 'mock_spotify_user_id'
    assert variables.spotify_username == 'mock_spotify_username'
    assert variables.spotify_password == 'mock_spotify_password'
    assert variables.blob_storage_connection_string == 'mock_blob_storage_connection_string'
    assert variables.host_url == 'host_url'
