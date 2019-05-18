from flask import Blueprint, jsonify, request, render_template
from flask_login import login_required, logout_user, login_user
from itsdangerous import URLSafeTimedSerializer, BadSignature
from sqlalchemy.orm.exc import NoResultFound

from server.Encoding.PasswordHash import check_password
import re

import config
from server.decorators import *
from server.auth import send_email
from server.models import *

UserRoutes = Blueprint('UserRoutes', __name__)


@UserRoutes.route('/changeColor', methods=['POST'])
@login_required
@check_confirmed
def change_color():
    """
    Changes the current user's color theme
    :return: Confirmation
    """
    if not request.json:
        # If the request isn't JSON return a 400 error
        return abort(400)
    data = request.json  # Data from client
    color = data['color']
    if not isinstance(color, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")

    # Commit the users's changes to the DB
    current_user.color = color
    db.session.commit()
    return jsonify(message='updated')


@UserRoutes.route('/changeTheme', methods=['POST'])
@login_required
@check_confirmed
def change_theme():
    """
    Changes the current user's theme
    :return: Confirmation of the change
    """
    if not request.json:
        # If the request isn't JSON return a 400 error
        return abort(400)
    data = request.json  # Data from the client
    theme = data['theme']
    if not isinstance(theme, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    # Applies the user's changes to the database
    current_user.theme = theme
    db.session.commit()
    return jsonify(message='updated')


@UserRoutes.route('/removeAccount', methods=['POST'])
@login_required
@check_confirmed
@admin_only
def remove_account():
    if not request.json:
        return abort(400)
    data = request.json
    user_id = data['userID']

    if not isinstance(user_id, int):
        return jsonify(error="One or more data types are not correct")
    try:
        user = User.query.filter(User.USER == user_id).first()
    except NoResultFound:
        return jsonify(error="No user found")
    if user is None:
        return jsonify(error="No user found")
    class_list = Class.query.filter((Class.CLASS == Transaction.CLASS) &
                                    (user.USER == Transaction.USER)).all()
    takes = Takes.query.filter(Takes.USER == user.USER).all()
    if user.is_teacher:
        teaches_list = Class.query.filter(Class.USER == user.USER).all()
        for i in teaches_list:
            i.USER = None
        db.session.commit()
    for i in takes:
        db.session.delete(i)
    db.session.commit()
    for i in class_list:
        user.TRANSACTION_RELATION.remove(i)
    db.session.commit()
    db.session.delete(user)
    db.session.commit()
    return jsonify("All User Data Removed")


@UserRoutes.route('/register', methods=['POST'])
def register():
    """
    Registers a new user account
    :return: Confirmation to the client
    """
    if not request.json:
        # If the request is not json return a 400 error
        return abort(400)
    data = request.json  # Data sent from client
    first_name, last_name, email, password = data['first_name'], data['last_name'], data['email'], data['password']
    if not isinstance(first_name, str) or not isinstance(last_name, str) or not \
            isinstance(email, str) or not isinstance(password, str):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify("One or more data is not correct")
    if not re.fullmatch(r'[a-zA-Z]{2,}\d*@uwo\.ca+', email):
        # Checks if the email is a UWO if not return an error JSON
        return jsonify(error='Invalid uwo email')
    if len(password) < 8:
        # If the password is les then 8 return error JSON
        return jsonify(error='Password too short')

    user = User.query.filter(User.email == email).all()  # Creates a user object based off of the email entered
    if len(user) != 0:
        # If no user is found then return error JSON
        return jsonify(error='User already exists')

    # Create new user instance form data entered and commit to database
    user = User(email, first_name, last_name, password, False, 9, 0)
    db.session.add(user)
    db.session.commit()
    # Generates the confirmation email and sends it to the user's email
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    token = serializer.dumps(email, salt=config.SECURITY_PASSWORD_SALT)
    confirm_url = url_for('UserRoutes.confirm', token=token, _external=True)
    send_email(email, 'Confirm your AvocadoCore Account',
               f'<html><body>Hi {user.first_name},<br/><br/>'
               f'Thanks for signing up! Please click <a href="{confirm_url}">here</a> to '
               f'activate your account. If you have any questions or suggestions for how we can improve, please send '
               f'us an email at contact@avocadocore.com.'
               f'<br/><br/>Best wishes,<br/>The AvocadoCore Team</body></html>')
    return jsonify(message='Account created')


@UserRoutes.route('/confirm/<token>')
def confirm(token):
    """
    Confirms the users email
    :param token: The token give from the email URL
    :return: The user to the home page
    """
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    try:
        # check if the token is valid if not return error
        email = serializer.loads(token, salt=config.SECURITY_PASSWORD_SALT)
    except BadSignature:
        return "Invalid confirmation link"
    user = User.query.filter(User.email == email).first()  # get user from the email
    if user is None:
        # If there is no user found return an error
        return "There is no account associated with the email in that token"

    if not user.confirmed:
        # If the user is not confirm confirm then and commit to database
        user.confirmed = True
        db.session.commit()
    # noinspection PyUnresolvedReferences
    return render_template('/index.html')


@UserRoutes.route('/requestPasswordReset', methods=['POST'])
def request_password_reset():

    if not request.json:
        return abort(400)

    email = request.json['email']
    try:
        user = User.query.filter(User.email == email).first()
    except NoResultFound:
        return jsonify(error="The email you requested is not associated with an AVO account. "
                             "Perhaps it was a typo? Please try again.")
    if user is None:
        return jsonify(error="The email you requested is not associated with an AVO account. "
                             "Perhaps it was a typo? Please try again.")
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    token = serializer.dumps(email, salt=config.SECURITY_PASSWORD_SALT)
    confirm_url = url_for('UserRoutes.password_reset', token=token, _external=True)
    send_email(user.email, "Password Reset Request",
               f'<html><body>Hi {user.first_name},<br/><br/>'
               f'You have requested to change you password. Please click <a href="{confirm_url}">here</a> to '
               f'change your password. If you did not request to change your password please ignore this email. '
               f'This link will expire in an hour'
               f'<br/><br/>Best wishes,<br/>The AvocadoCore Team</body></html>'
               )
    return jsonify(code="email sent")


@UserRoutes.route('/passwordReset/<token>', methods=['GET', 'POST'])
def password_reset(token):
    """
    Render Reset page and change users password
    :param token: gotten from email from user
    :return: redirect to login
    """
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    try:
        # check if the token is valid if not return error
        email = serializer.loads(token, salt=config.SECURITY_PASSWORD_SALT, max_age=3600)
    except BadSignature:
        return "Invalid Confirmation Link. Please try requesting password change again."
    user = User.query.filter(User.email == email).first()  # get user from the email
    if user is None:
        # If there is no user found return an error
        return "There is no account associated with the email."

    if request.method == 'GET':
        return render_template('index.html')
    elif request.method == 'POST':
        password = request.json['password']
        # Method is POST change password
        if len(password) < 8:
            # If the password is les then 8 return error JSON
            return jsonify(error='Password too short! Please ensure the password is at least 8 characters.')
        salt = generate_salt()
        hashed_password = hash_password(password, salt)
        user.password = hashed_password
        user.salt = salt
        db.session.commit()
        return jsonify(code="Password Successfully Updated!")
    else:
        return jsonify(error='An unexpected error occurred. Reference #1j29')


@UserRoutes.route('/login', methods=['POST'])
def login():
    """
    Login the user
    :return: Confirmation that the user has been logged in
    """
    if not request.json:
        # If the request isn't JSON return a 400 error
        return abort(400)
    data = request.json  # Data from the client
    username, password = data['username'], data['password']
    if not isinstance(username, str) or not isinstance(password, str):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify("One or more data is not correct")
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
        return jsonify(first_name=current_user.first_name, last_name=current_user.last_name,
                       is_teacher=current_user.is_teacher, is_admin=current_user.is_admin,
                       color=current_user.color, theme=current_user.theme)


@UserRoutes.route('/adminLogin/<user_id>', methods=['GET'])
@login_required
@check_confirmed
@admin_only
def admin_login(user_id):
    user_id = int(user_id)
    logout_user()
    try:
        # Try to create the user from the email if not throw error JSON
        user = User.query.filter(User.USER == user_id).one()
    except NoResultFound:
        return jsonify(error='Account does not exist!')
    if not user.confirmed:
        # If the user hasn't confirmed their email throw error JSON
        return jsonify(error='Account has not been confirmed!')
    else:
        # Else log the user in
        login_user(user)
        return redirect('/')


@UserRoutes.route('/logout')
@login_required
def logout():
    """
    Logout the current user
    :return: Confirmation that the user has been logged out
    """
    logout_user()
    return jsonify(message='Successfully logged out')


@UserRoutes.route('/getUserInfo')
def get_user_info():
    """
    Get the current user's info
    :return: The user's info
    """
    try:
        # Returns the current user's data if not logged in return error JSON
        return jsonify(first_name=current_user.first_name, last_name=current_user.last_name,
                       is_teacher=current_user.is_teacher, is_admin=current_user.is_admin,
                       color=current_user.color, theme=current_user.theme)
    except AttributeError:
        return jsonify(error='User does not exist')
