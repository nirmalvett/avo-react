from flask import redirect, url_for, abort
from functools import wraps
from flask_login import current_user


def check_confirmed(f):
    """
    Check if the user's email is confirmed when requesting deep web pages
    :param f: Takes current user
    :return: If the user is confirmed
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Query the user table and checks there IsConfirmed value
        if current_user.confirmed is False:
            # If the user is Unconfirmed then redirect then to the unconfirmed page
            return redirect(url_for('GeneralRoutes.unconfirmed'))
        return f(*args, **kwargs)

    return decorated_function


def teacher_only(f):
    """
    Check if the user is a teacher
    :param f: Takes current user
    :return: If the user is a teacher allow them in if not return a error page
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Query the User table to find if they are a teacher or not
        if current_user.is_teacher is False:
            # If they are not a teacher return a 400 error
            return abort(401)
        return f(*args, **kwargs)

    return decorated_function


def student_only(f):
    """
    Check if the user is a student
    :param f: Takes current user
    :return: If the user is a teacher allow them in if not return a error page
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Query the user table to find if they are a student
        if current_user.is_teacher is True:
            # If they are a teacher return a 400 error
            return abort(401)
        return f(*args, **kwargs)

    return decorated_function


def admin_only(f):
    """
    Check if the user is a admin
    :param f: Takes current user
    :return: If the user is a admin allow them in if not return a error page
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Query the user table to find if they are a student
        if current_user.is_admin is False:
            # If they are a teacher return a 400 error
            return abort(401)
        return f(*args, **kwargs)

    return decorated_function


