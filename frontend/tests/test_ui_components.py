# Import python dependencies
from streamlit.testing.v1 import AppTest

# Import project functions
from functions.ui_components import \
    configure_page_config
from functions.variables import \
    Variables

def test_configure_page_config() -> None:
    """
    Input: None
    Output: None
    Function to test configure page config function
    """
    # Execute function
    vars = configure_page_config()

    # Ensure the output of the function is of the correct type
    assert isinstance(vars, Variables)

    # Ensure that the function has read in environmental variables
    assert vars.login_required is True


def test_login_page_pass() -> None:
    """
    Input: None
    Output: None
    Function to test that login has been completed
    """
    # Configure App test instance
    at = AppTest.from_file('../Home.py').run()

    # Enter username and password
    at.text_input[0].set_value('user1').run()
    at.text_input[1].set_value('password').run()

    # Ensure title has rendered correctly
    assert at.title[0].value == 'Spotify Dashboard'

    # Ensure session state has been updated
    assert at.session_state["logged_in"] is True


def test_login_page_fail() -> None:
    """
    Input: None
    Output: None
    Function to test that login has failed
    """
    # Configure App test instance
    at = AppTest.from_file('../Home.py').run()

    # Enter username and password
    at.text_input[0].set_value('username').run()
    at.text_input[1].set_value('password').run()

    # Ensure title has rendered correctly
    assert at.title[0].value == 'Login Page'

    # Ensure that warning message has been rendered
    assert at.warning[0].value == 'Username/Password invalid'
