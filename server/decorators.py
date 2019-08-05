from flask import redirect, url_for, abort, request, jsonify
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


def validate(**types):
    def decorator(f):

        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method == 'POST':
                if not request.json:
                    return jsonify(schema=describe(types), errors=['No JSON data attached']), 400
                errors = find_errors(types, request.json, kwargs)
                if errors is not None:
                    return jsonify(schema=describe(types), errors=errors), 400
            else:
                for _name in types:
                    kwargs[_name] = None
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def describe(types):
    schema = {}
    for _name, _type in types.items():
        schema[_name] = _type.__name__
    return schema


def find_errors(types, json, kwargs):
    errors = []
    for _name, _type in types.items():
        if _name not in json:
            errors.append(f'{_name} is missing from query')
        elif not isinstance(json[_name], _type):
            errors.append(f'{_name} is of the wrong type, expected {_type.__name__}')
        else:
            kwargs[_name] = json[_name]
    return errors or None
