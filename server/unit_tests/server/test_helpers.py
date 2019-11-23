import pytest
from server.helpers import random_key


@pytest.mark.parametrize('length', [
    1,
    2,
    15,
    20
])
def test_random_key(length):
    key = random_key(length)
    assert key
