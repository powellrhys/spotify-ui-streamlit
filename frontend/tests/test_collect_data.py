from functions.collect_data import \
    collect_newest_playlist_id
from functions.variables import \
    Variables


def test_collect_newest_playlist_id() -> None:
    """
    Input: None
    Output: None
    Function to test that data can be collected from blob
    """
    # Define test variables
    vars = Variables()
    file_name = 'test_file.json'

    # Read data from blob - test file with playlist ID in it
    data = collect_newest_playlist_id(vars=vars,
                                      file_name=file_name)

    # Make sure data collected is a string
    assert isinstance(data, str)

    # Make sure value is matches the expected value
    assert data == "123"
