# Import python dependencies
from azure.storage.blob import BlobServiceClient
import json

# Import project dependencies
from functions.variables import Variables

def read_json_from_blob(vars: Variables,
                        file_name: str) -> list:
    """
    Input: Project variables and blob filename
    Output: Data from blob
    Function to read json files from blob
    """
    # Create the BlobServiceClient using the connection string
    blob_service_client = BlobServiceClient.from_connection_string(vars.blob_storage_connection_string)

    # Get a client for the container
    container_client = blob_service_client.get_container_client('spotify')

    # Get a client for the blob
    blob_client = container_client.get_blob_client(file_name)

    # Download the blob's content
    download_stream = blob_client.download_blob()
    json_content = download_stream.readall()

    # Parse the JSON content
    data = json.loads(json_content)

    return data


def collect_newest_playlist_id(vars: Variables,
                               file_name: str) -> str:
    """
    Input: Project variables
    Output: Playlist id of newest playlist
    Function to collect latest playlist id from blob
    """
    # Read playlist_id.json file from blob
    data = read_json_from_blob(vars=vars,
                               file_name=file_name)

    # Collect playlist id
    playlist_id = data['playlist_id']

    return playlist_id
