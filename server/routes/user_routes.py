from flask import Blueprint, jsonify, render_template, send_from_directory, redirect
from flask_login import logout_user, login_user, current_user
from sqlalchemy.orm.exc import NoResultFound
import glob
from server.PasswordHash import check_password
import re
from server.decorators import login_required, validate
from server.auth import send_email, get_url, validate_token
from server.models import db, User, Feedback

UserRoutes = Blueprint('UserRoutes', __name__)


# Routes needed for normal account creation and usage (ordered sequentially)


@UserRoutes.route('/register', methods=['POST'])
@validate(firstName=str, lastName=str, email=str, password=str)
def register(first_name: str, last_name: str, email: str, password: str):
    """
    Registers a new user account
    :return: Confirmation to the client
    """
    if not re.fullmatch(r'[a-zA-Z]{2,}\d*@uwo\.ca+', email):
        # Checks if the email is a UWO if not return an error JSON
        return jsonify(error='Invalid uwo email')
    if len(password) < 8:
        # If the password is les then 8 return error JSON
        return jsonify(error='Password too short')

    user = User.query.filter(User.email == email).first()  # Creates a user object based off of the email entered
    if user is not None:
        if user.salt != '' and user.password != '':
            return jsonify(error='User already exists')
        else:
            user.change_password(password)
            user.first_name = first_name
            user.last_name = last_name
            if not user.confirmed:
                user.confirmed = True
            db.session.commit()
            return jsonify(message='password changed')

    # Create new user instance form data entered and commit to database
    user = User(email, first_name, last_name, password, confirmed=True)
    db.session.add(user)
    db.session.commit()

    url = get_url(email, 'UserRoutes.confirm')
    # send_email(
    #     email,
    #     'Confirm your AvocadoCore Account',
    #     f'<html><body>Hi {user.first_name},<br/><br/>'
    #     f'Thanks for signing up! Please click <a href="{url}">here</a> to activate your account. If you have any '
    #     f'questions or suggestions, please send us an email at contact@avocadocore.com.'
    #     f'<br/><br/>Best wishes,<br/>The AvocadoCore Team</body></html>'
    # )
    send_email(
        email,
        'Welcome to AvocadoCore!',
        f'<html><body>Hi {user.first_name},<br/><br/>'
        f'Thanks for signing up! If you have any '
        f'questions or suggestions, please send us an email at contact@avocadocore.com.'
        f'<br/><br/>Best wishes,<br/>The AvocadoCore Team</body></html>'
    )

    return jsonify(message='email sent')


@UserRoutes.route('/confirm/<token>')
def confirm(token):
    """
    Confirms the users email
    :param token: The token give from the email URL
    :return: The user to the home page
    """
    if token_is_file(token):
        return send_from_directory('../static/dist/', token, conditional=True)
    email = validate_token(token)
    if email is None:
        return "Invalid confirmation link"
    user = User.query.filter(User.email == email).first()  # get user from the email
    if user is None:
        # If there is no user found return an error
        return "There is no accounts associated with the email in that token"

    if not user.confirmed:
        # If the user is not confirm confirm then and commit to database
        user.confirmed = True
        db.session.commit()
    # noinspection PyUnresolvedReferences
    return render_template('/index.html')


@UserRoutes.route('/login', methods=['POST'])
@validate(username=str, password=str)
def login(username: str, password: str):
    """
    Login the user
    :return: Confirmation that the user has been logged in
    """
    try:
        # Try to create the user from the email if not throw error JSON
        user = User.query.filter(User.email == username).one()
    except NoResultFound:
        return jsonify(error='Account does not exist!')
    if not check_password(password, user.salt, user.password):
        # Checks the password if false throw error JSON
        return jsonify(error='Password is incorrect!')
    elif not user.confirmed:
        # If the user hasn't confirmed their email throw error JSON
        return jsonify(error='Account has not been confirmed!')
    else:
        # Else log the user in
        login_user(user)
        return jsonify(
            firstName=current_user.first_name,
            lastName=current_user.last_name,
            isTeacher=current_user.is_teacher,
            isAdmin=current_user.is_admin,
            color=current_user.color,
            theme=current_user.theme,
        )


@UserRoutes.route('/getUserInfo')
def get_user_info():
    """
    Get the current user's info
    :return: The user's info
    """
    try:
        # Returns the current user's data if not logged in return error JSON
        return jsonify(
            firstName=current_user.first_name,
            lastName=current_user.last_name,
            isTeacher=current_user.is_teacher,
            isAdmin=current_user.is_admin,
            color=current_user.color,
            theme=current_user.theme,
        )
    except AttributeError:
        return jsonify(error='User does not exist')


@UserRoutes.route('/logout')
@login_required
def logout():
    """
    Logout the current user
    :return: Confirmation that the user has been logged out
    """
    logout_user()
    return jsonify({})


@UserRoutes.route('/requestPasswordReset', methods=['POST'])
@validate(email=str)
def request_password_reset(email: str):
    user = User.query.filter(User.email == email).first()
    if user is None:
        return jsonify(error="The email you requested is not associated with an AVO account. "
                             "Perhaps it was a typo? Please try again.")

    url = get_url(email, 'UserRoutes.password_reset')
    send_email(
        email,
        "Password Reset Request",
        f'<html><body>Hi,<br/><br/>'
        f'Please click <a href="{url}">here</a> to change your password. If you did not request a password reset, '
        f'you do not need to do anything. This link will expire in one hour.'
        f'<br/><br/>Best wishes,<br/>The AvocadoCore Team</body></html>'
    )

    return jsonify({})


def token_is_file(token):
    files = glob.glob('static/dist/*')
    files = [file.replace('static/dist/', '') for file in files]
    return token in files


@UserRoutes.route('/passwordReset/<token>')
def password_reset(token):
    if token_is_file(token):
        return send_from_directory('../static/dist/', token, conditional=True)
    email = validate_token(token, 3600)
    if email is None:
        return redirect('/?expiredPasswordReset=True', code=302)
        return 'Password reset link expired. Please go to <a href="https://app.avocadocore.com">https://app.avocadocore.com </a> and try requesting a password change.'
    user = User.query.filter(User.email == email).first()
    if user is None:
        return "There is no account associated with the email."
    return render_template('index.html')


@UserRoutes.route('/setup/<token>')
def setup(token):
    if token_is_file(token):
        return send_from_directory('../static/dist/', token, conditional=True)
    email = validate_token(token)
    if email is None:
        return "Invalid Setup Link."
    user = User.query.filter(User.email == email).first()
    if user is None:
        return "There is no account associated with the email."
    return render_template('index.html')


@UserRoutes.route('/resetPassword', methods=['POST'])
@validate(token=str, password=str)
def reset_password(token: str, password: str):
    return pw_change(validate_token(token), password)


@UserRoutes.route('/completeSetup', methods=['POST'])
@validate(token=str, password=str)
def complete_setup(token: str, password: str):
    return pw_change(validate_token(token), password, True)


@UserRoutes.route('/changePassword', methods=['POST'])
@login_required
@validate(oldPassword=str, newPassword=str)
def change_password(old_password: str, new_password: str):
    if not check_password(old_password, current_user.salt, current_user.password):
        return jsonify(error='Old password is incorrect')
    if len(new_password) < 8:
        return jsonify(error='Password too short! Please ensure the password is at least 8 characters.')
    return current_user.change_password(new_password)


def pw_change(email, password, setup_only=False):
    if email is None:
        return jsonify(error='Invalid token')
    user: User = User.query.filter(User.email == email).first()
    if user is None:
        return jsonify(error="There is no account associated with the email.")
    if user.salt != '' and user.password != '' and setup_only:
        return jsonify(error="Password already created")
    if len(password) < 8:
        return jsonify(error='Password too short! Please ensure the password is at least 8 characters.')
    user.change_password(password)
    db.session.commit()
    return jsonify({})


# User settings


@UserRoutes.route('/changeColor', methods=['POST'])
@login_required
@validate(color=int)
def change_color(color: int):
    """
    Changes the current user's color theme
    :return: Confirmation
    """
    # Commit the users's changes to the DB
    current_user.color = color
    db.session.commit()
    return jsonify({})


@UserRoutes.route('/changeTheme', methods=['POST'])
@login_required
@validate(theme=int)
def change_theme(theme: int):
    """
    Changes the current user's theme
    :return: Confirmation of the change
    """
    # Applies the user's changes to the database
    current_user.theme = theme
    db.session.commit()
    return jsonify({})


@UserRoutes.route('/sendFeedback', methods=['POST'])
@login_required
@validate(message=str)
def send_feedback(message: str):
    db.session.add(Feedback(current_user.USER, message))
    db.session.commit()
    return jsonify({})
