import pytest


def test_example(selenium):
    selenium.get('http://www.example.com')


# Comment this out if you'd like selenium to open real chrome
@pytest.fixture(autouse=True)
def chrome_options(chrome_options):
    chrome_options.add_argument('--headless')
    return chrome_options
