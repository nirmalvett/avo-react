from flask import redirect, url_for, abort, request, jsonify
from flask_login import current_user
from functools import wraps
from re import sub


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
    """
    This function validates the incoming types in post requests, and passes them as parameters. The parameters it
    passes will be converted to conform to pep8 standards, by inserting underscores and changing the letter case.
    :param types: The keys are variable names, and the values are one of the following:
        If it is a type, the parameter is required to exist and be that type
        If it is a [type], the parameter is required to be that type if it exists, but it might not exist
        If it is None, it can be any type, but must exist. [None] is invalid.
    :return: A decorated function
    """
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
                for k in types:
                    kwargs[convert_case(k)] = None
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def describe(types):
    schema = {}
    for _name, _type in types.items():
        if isinstance(_type, list):
            schema[_name] = _type[0].__name__
        else:
            schema[_name] = _type.__name__
    return schema


def find_errors(types, json, kwargs):
    errors = []
    for _name, _type in types.items():
        if isinstance(_type, type):
            if _name not in json:
                errors.append(f'{_name} is missing from query')
            elif not isinstance(json[_name], _type):
                errors.append(f'{_name} is of the wrong type, expected {_type.__name__}')
            else:
                kwargs[convert_case(_name)] = json[_name]
        elif isinstance(_type, list) and len(_type) == 1 and isinstance(_type[0], type):
            if _name not in json:
                kwargs[convert_case(_name)] = None
            elif isinstance(json[_name], _type[0]):
                kwargs[convert_case(_name)] = json[_name]
            else:
                errors.append(f'{_name} is of the wrong type, expected {_type[0].__name__}')
        elif _type is None:
            kwargs[convert_case(_name)] = json[_name]
        else:
            raise TypeError()
    return errors or None


def convert_case(js_name: str) -> str:
    return sub(r'[A-Z]+', lambda x: '_' + x[0].lower(), js_name).lstrip('_')
