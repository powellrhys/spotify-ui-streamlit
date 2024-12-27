# Import python dependencies
import streamlit.components.v1 as components
import streamlit as st
import pandas as pd

# Import project dependencies
from functions.ui_components import \
    configure_page_config, \
    login_page
from functions.collect_data import \
    collect_newest_playlist_id, \
    read_json_from_blob

# Define page config and collected project variables
vars = configure_page_config()

# Check if login required
if not st.session_state['logged_in'] and vars.login_required:

    # Render login component
    login_page()

else:
    # Render page title
    st.title('Export Listening Habits')

    # Render sample term selectbox on sidebar
    term = st.sidebar.selectbox(label='Sample Habits',
                                options=['Long Term',
                                         'Medium Term',
                                         'Short Term'])

    # Collect song data
    data = read_json_from_blob(vars=vars,
                               file_name=f"top_tracks_{term.replace(' ', '_').lower()}.json")

    # Collect newest playlist id
    playlist_id = collect_newest_playlist_id(vars=vars,
                                             file_name='playlist_id.json')

    # Removing duplicates based on the 'song_name' key
    seen = set()
    unique_data = []
    for entry in data:
        if entry["song_name"] not in seen:
            unique_data.append(entry)
            seen.add(entry["song_name"])

    # Create top song dataframe
    df = pd.DataFrame(unique_data) \
        .rename(columns={'song_name': 'Track Name',
                         'artist_name': 'Artist Name'
                         }) \
        .drop(['song_url', 'song_uri', 'song_img'], axis=1)

    #  Reset dataframe index
    df.index = df.index + 1

    # Define page columns
    col1, col2 = st.columns([2, 3])

    # Render column one components
    with col1:
        # Render description input object
        playlist_name = st.text_input(label='Playlist Name',
                                      disabled=True,
                                      value='My Top Tracks Playlist')

        # Render description input object
        user_id = st.text_input(label='Spotify User ID',
                                disabled=True,
                                value=vars.spotify_user_id)

        # Render description input object
        description = st.text_input(label='Playlist Description',
                                    disabled=True,
                                    value='Generated playlist based on your top tracks')

        # Render expander object with supporting project description
        with st.expander(label="Songs to Add to the Playlist",
                         expanded=False):

            # Render dataframe inside expander object
            st.dataframe(data=df,
                         use_container_width=True,
                         height=250)

        # Create columns for buttons
        button1, button2 = st.columns(2)

        # Render components inside first column
        with button1:

            # Render Link button to navigate to backend
            request_url = f'http://{vars.host_url}/login?client_id={vars.client_id}' + \
                f"&action=create-playlist-{term.replace(' ', '_').lower()}"
            st.link_button(label='Update Data',
                           url=request_url)

        # Render components inside second column
        with button2:

            # Render refresh button
            refresh = st.button('Refresh Page')

            # If refresh button click, reload page
            if refresh:
                st.rerun

    # Render the second column components
    with col2:

        # Render spotify iframe
        components.iframe(f"https://open.spotify.com/embed/playlist/{playlist_id}",
                          height=500)
