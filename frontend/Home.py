# Import dependencies
import streamlit as st

# Import project dependencies
from functions.ui_components import \
    configure_page_config, \
    login_page

# Setup page config and collect project variables
vars = configure_page_config()

# Check if login is required and if user has logged in
if not st.session_state['logged_in'] and vars.login_required:

    # Render login component
    login_page()

else:
    # Render page title
    st.title('Spotify Dashboard')

    # Render expander object with supporting project description
    with st.expander(label="Project Overview",
                     expanded=True):

        # Project description
        project_description = """
        My project is a web application built with a **Streamlit frontend** and a **Node.js Express backend** that
        integrates with Spotify's API to showcase personalized user data. The backend handles secure authentication
        with Spotify, fetching user-specific data such as playlists, top tracks, favorite artists, and listening habits.
        This data is processed and served to the Streamlit application, which provides an intuitive and interactive
        interface for users to explore their Spotify statistics. The platform combines the simplicity of Streamlit’s
        Python-based UI design with the scalability and efficiency of a Node.js backend, delivering a seamless and
        visually appealing experience.
        """

        # Write project description in expander
        st.write(project_description)

    # Render Link button to navigate to backend
    st.link_button(label='Update Data',
                   url=f'http://{vars.host_url}/login?client_id={vars.client_id}')
