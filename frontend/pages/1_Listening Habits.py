# Import python dependencies
import streamlit as st

# Import project dependencies
from functions.ui_components import \
    configure_page_config, \
    login_page
from functions.collect_data import \
    read_json_from_blob

# Define page config and collected project variables
vars = configure_page_config()

# Check if login required is required and login
if not st.session_state['logged_in'] and vars.login_required:

    # Render login component
    login_page()

else:
    # Render page title
    st.title('Spotify Overview')

    # Render sample term selectbox on sidebar
    term = st.sidebar.selectbox(label='Sample Habits',
                                options=['Long Term',
                                         'Medium Term',
                                         'Short Term'])

    # Render page tabs
    tab_songs, tab_artists = st.tabs(['Top Songs', 'Top Artists'])

    # Render components withing songs tab
    with tab_songs:

        # Collect song data
        json = read_json_from_blob(vars=vars,
                                   file_name=f"top_tracks_{term.replace(' ', '_').lower()}.json")

        # Removing duplicates based on the 'song_name' key
        seen = set()
        unique_data = []
        for entry in json:
            if entry["song_name"] not in seen:
                unique_data.append(entry)
                seen.add(entry["song_name"])

        # Define columns
        col1, col2, col3, col4, col5 = st.columns(5)

        # Store column objects in list
        grid = [col1, col2, col3, col4, col5]

        # Iterate through column list
        for i in range(len(grid)):

            # Render components with columns
            with grid[i]:

                # Render link button
                st.link_button(label="Explore",
                               url=unique_data[i]['song_url'],
                               type='primary',
                               use_container_width=True)

                # Render track image
                st.image(unique_data[i]['song_img'],
                         caption=f"{i+1}. {unique_data[i]['song_name']} - {unique_data[i]['artist_name']}")

    # Render components within artists tab
    with tab_artists:

        # Collect artist data
        json = read_json_from_blob(vars=vars,
                                   file_name=f"top_artists_{term.replace(' ', '_').lower()}.json")

        # Render 5 column objects
        col1, col2, col3, col4, col5 = st.columns(5)

        # Store column objects in list
        grid = [col1, col2, col3, col4, col5]

        # Iterate through columns
        for i in range(len(grid)):

            # Render components within columns
            with grid[i]:

                # Render link button within columns
                st.link_button(label="Explore",
                               url=json[i]['artist_url'],
                               type='primary',
                               use_container_width=True)

                # Render image of artists within columns
                st.image(json[i]['artist_img'],
                         caption=f"{i+1}. {json[i]['artist_name']}")
