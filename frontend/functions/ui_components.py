# Import python dependencies
import streamlit as st
import warnings

# Import project dependencies
from functions.variables import Variables

def configure_page_config(initial_sidebar_state: str = "expanded",
                          layout: str = "wide") -> None:
    '''
    Input: Page config parameters
    Output: None
    Function to define page config
    '''
    # Set page config
    st.set_page_config(
        initial_sidebar_state=initial_sidebar_state,
        layout=layout,
        page_icon=':musical_note:'
    )

    # Ignore all warnings
    warnings.filterwarnings("ignore")

    if 'logged_in' not in st.session_state:
        st.session_state['logged_in'] = False

    st.logo(image='./assets/spotify_logo.png',
            size='large')

    # Read in project variables
    vars = Variables()

    return vars


def login_page() -> None:
    """
    Input: None
    Output: None
    Function to render login page
    """
    # Collect project variables
    vars = Variables()

    # Login page title
    st.title('Login Page')

    # Define column structure for page
    col1, _ = st.columns([2, 3])

    with col1:

        # Collect user login inputs
        username = st.text_input(label='Username')
        password = st.text_input(label='Password',
                                 type='password')

        # Compare user inputs with accepted values
        if username == vars.app_username and password == vars.app_password:

            # If credentials are correct
            st.session_state['logged_in'] = True

            # Reload page
            st.rerun()

        else:
            # Display error message
            st.warning('Username/Password invalid')
