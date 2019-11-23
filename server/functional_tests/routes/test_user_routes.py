# Server needs to be running for these tests
from requests import Session
from requests.models import Response
import json
import pytest


@pytest.fixture
def session():
    return Session()


def _init(session: Session):
    pass


def test_user_register(session: Session):
    resp = session.post('http://localhost:5000/register', json={
        'firstName': 'Avocado',
        'lastName': 'Core',
        'email': 'avocado1@uwo.ca',
        'password': 'password'
    })
    if resp.status_code != 200:
        return False

    return True


def _test_user_confirm(session: Session):
    pass


def test_user_get_info(session: Session):
    resp = session.get('http://localhost:5000/getUserInfo')
    if resp.status_code != 200:
        return False

    return True


def test_user_logout(session: Session):
    resp = session.get('http://localhost:5000/logout')
    if resp.status_code != 200:
        return False

    resp = session.get('http://localhost:5000/getUserInfo')
    if resp.status_code == 200:
        return False

    return True


def test_user_request_password_reset(session: Session):
    return True


def test_user_password_reset(session: Session):
    return True


def test_user_setup(session: Session):
    return True


def test_user_reset_password(session: Session):
    return True


def test_user_complete_setup(session: Session):
    return True


def test_user_change_password(session: Session):
    resp = session.post('http://localhost:5000/changePassword', json={
        'oldPassword': 'incorrect old password',
        'newPassword': 'asd'
    })
    if resp.status_code == 200:
        return False

    resp = session.post('http://localhost:5000/changePassword', json={
        'oldPassword': 'asd',
        'newPassword': 'too short password'
    })
    if resp.status_code == 200:
        return False

    resp = session.post('http://localhost:5000/changePassword', json={
        'oldPassword': 'asd',
        'newPassword': 'asd'
    })
    if resp.status_code != 200:
        return False

    resp = session.post('http://localhost:5000/changePassword', json={
        'oldPassword': 'asd',
        'newPassword': 'asd'
    })
    if resp.status_code != 200:
        return False

    return True


def test_user_change_color(session: Session):
    resp = session.get('http://localhost:5000/getUserInfo')
    resp_json = json.loads(resp.content)
    if 'color' not in resp_json or type(resp_json['color']) != int or resp.status_code != 200:
        return False

    old_color = resp_json['color']

    resp = session.post('http://localhost:5000/changeColor', json={'color': 2 if old_color == 1 else 1})
    if resp.status_code != 200:
        return False

    resp = session.get('http://localhost:5000/getUserInfo')
    resp_json = json.loads(resp.content)
    if 'color' not in resp_json or resp_json['color'] != 2 if old_color == 1 else 1 or resp.status_code != 200:
        return False

    resp = session.post('http://localhost:5000/changeColor', json={'color': old_color})
    if resp.status_code != 200:
        return False

    resp = session.get('http://localhost:5000/getUserInfo')
    resp_json = json.loads(resp.content)
    if 'color' not in resp_json or resp_json['color'] != old_color or resp.status_code != 200:
        return False

    return True


def test_user_change_theme(session: Session):
    resp = session.get('http://localhost:5000/getUserInfo')
    resp_json = json.loads(resp.content)
    if 'theme' not in resp_json or type(resp_json['theme']) != int or resp.status_code != 200:
        return False

    old_theme = resp_json['theme']

    resp = session.post('http://localhost:5000/changeTheme', json={'theme': 2 if old_theme == 1 else 1})
    if resp.status_code != 200:
        return False

    resp = session.get('http://localhost:5000/getUserInfo')
    resp_json = json.loads(resp.content)
    if 'theme' not in resp_json or resp_json['theme'] != 2 if old_theme == 1 else 1 or resp.status_code != 200:
        return False

    resp = session.post('http://localhost:5000/changeTheme', json={'theme': old_theme})
    if resp.status_code != 200:
        return False

    resp = session.get('http://localhost:5000/getUserInfo')
    resp_json = json.loads(resp.content)
    if 'theme' not in resp_json or resp_json['theme'] != old_theme or resp.status_code != 200:
        return False

    return True


# TODO test admin routes?


def _end(session: Session):
    pass
