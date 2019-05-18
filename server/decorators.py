from flask import redirect, url_for, abort
from flask_login import current_user
from functools import wraps


def login_required(f):
    """
    Check if the user's email is confirmed when requesting deep web pages
    :param f: Takes current user
    :return: If the user is confirmed
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            # If they aren't logged in, abort with the 'unauthorized' http status code
            return abort(401)
        elif not current_user.confirmed:
            # If the user is not confirmed, redirect them to the unconfirmed page
            return redirect(url_for('GeneralRoutes.unconfirmed'))
        else:
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
        if not current_user.is_authenticated:
            # If they aren't logged in, abort with the 'unauthorized' http status code
            return abort(401)
        elif not current_user.confirmed:
            # If the user is not confirmed, redirect them to the unconfirmed page
            return redirect(url_for('GeneralRoutes.unconfirmed'))
        elif not current_user.is_admin and not current_user.is_teacher:
            # If they aren't a teacher or an admin, abort with the 'forbidden' http status code
            return abort(403)
        else:
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
        if not current_user.is_authenticated:
            # If they aren't logged in, abort with the 'unauthorized' http status code
            return abort(401)
        elif not current_user.confirmed:
            # If the user is not confirmed, redirect them to the unconfirmed page
            return redirect(url_for('GeneralRoutes.unconfirmed'))
        elif not current_user.is_admin and current_user.is_teacher:
            # If they aren't a student or an admin, abort with the 'forbidden' http status code
            return abort(403)
        else:
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
        if not current_user.is_authenticated:
            # If they aren't logged in, abort with the 'unauthorized' http status code
            return abort(401)
        elif not current_user.confirmed:
            # If the user is not confirmed, redirect them to the unconfirmed page
            return redirect(url_for('GeneralRoutes.unconfirmed'))
        elif not current_user.is_admin:
            # If they aren't an admin, abort with the 'forbidden' http status code
            return abort(403)
        else:
            return f(*args, **kwargs)
    return decorated_function
