from flask import Blueprint, abort, jsonify, request, render_template
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy.orm.exc import NoResultFound
from re import fullmatch
from itsdangerous import URLSafeTimedSerializer, BadSignature
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import config

from server.Encoding.PasswordHash import check_password
from server.DecorationFunctions import *

from server.models import *

UserRoutes = Blueprint('UserRoutes', __name__)
login_manager = LoginManager()

login_manager.login_view = "FileRoutes.serve_sign_in"


@login_manager.user_loader
def load_user(user_id):
    """
    Callback function for Flask Login logs in user
    :param user_id: the id of the user being logged in
    :return: a user object for Flask Login
    """
    return User.query.get(user_id)


@UserRoutes.route('/register', methods=['POST'])
def register():
    """
    Registers a new user account
    :return: Confirmation to the client
    """
    if not request.json:
        # If the request is not json return a 400 error
        return abort(400)
    data = request.json # Data sent from client
    first_name, last_name, email, password = data['first_name'], data['last_name'], data['email'], data['password']
    if not isinstance(first_name, str) or not isinstance(last_name, str) or not isinstance(email, str) or not isinstance(password, str):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify("One or more data is not correct")
    if not fullmatch(r'[a-zA-Z]{2,}\d*@uwo\.ca+', email):
        # Checks if the email is a UWO if not return an error JSON
        return jsonify(error='Invalid uwo email')
    if len(password) < 8:
        # If the password is les then 8 return error JSON
        return jsonify(error='Password too short')

    user = User.query.filter(User.email == email).all() # Creates a user object based off of the email entered
    if len(user) is not 0:
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
    user = User.query.filter(User.email == email).first() # get user from the email
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
        return jsonify(code="email sent")
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    token = serializer.dumps(email, salt=config.SECURITY_PASSWORD_SALT)
    confirm_url = url_for('UserRoutes.password_reset', token=token, _external=True)
    send_email(user.email, "Password Reset Request",
               f'<html><body>Hi {user.first_name},<br/><br/>'
               f'You have requested to change you password Please click <a href="{confirm_url}">here</a> to '
               f'change your password. If you did not request to change your password please ignore this email'
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
        return jsonify(error="Invalid Confirmation Link. Please try requesting password change again.")
    user = User.query.filter(User.email == email).first()  # get user from the email
    if user is None:
        # If there is no user found return an error
        return jsonify(error="There is no account associated with the email.")

    if request.method == 'GET':
        return render_template('/index.html')
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
        user = User.query.filter(User.email == username).first()
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


@UserRoutes.route('/logout')
@login_required
def logout():
    """
    Logout the current user
    :return: Confermation that the user has been logged out
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
    except:
        return jsonify(error='User does not exist')


def teaches_class(class_id):
    """
    Helper function to test if teacher teaches class
    :param class_id: The class ID to test
    :return: True if the user is teaching the class False if not
    """
    current_class = Class.query.get(class_id)  # Gets the class from the class ID
    if current_class is None:
        return False
    if current_user.USER is current_class.USER:
        # If the current user teaches the class then return true if not return False
        return True
    return False


def enrolled_in_class(class_id):
    """
    Checks if the current user is enrolled in a given class
    :param class_id: The class ID to check against
    :return: True if the user is enrolled False if not
    """
    try:
        # Get all classes user is enrolled in
        current_class = Class.query.filter((Class.CLASS == enrolled.c.CLASS) &
                                           (current_user.USER == enrolled.c.USER)).all()
        if len(current_class) is 0:
            return False
        for i in range(len(current_class)):
            if current_class[i].CLASS is class_id:
                return True
        return False
    except NoResultFound:
        return False


def able_edit_set(setID):
    try:
        user_views_set = UserViewsSet.query.filter((setID == UserViewsSet.SET)
                                               & (current_user.USER == UserViewsSet.USER)).first()
    except NoResultFound:
        return False
    return user_views_set.can_edit


def send_email(recipient: str, subject: str, message: str):
    """
    Sends email to a client
    :param recipient: The person to recive the email
    :param subject: The subject of the email
    :param message: HTML of the email
    """
    sender = config.EMAIL # Sets the sender of no-reply
    msg = MIMEMultipart()
    msg['From'], msg['To'], msg['Subject'] = sender, recipient, subject # Sets To From Subject values
    msg.attach(MIMEText(message, 'html'))
    # noinspection SpellCheckingInspection
    # Sends email with given configuration
    server = SMTP('smtp.zoho.com', 587)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(sender, config.EMAIL_PASSWORD)
    server.sendmail(sender, recipient, msg.as_string())
