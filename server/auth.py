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
    return User.query.get(user_id)


@UserRoutes.route('/register', methods=['POST'])
def register():
    if not request.json:
        return abort(400)
    data = request.json
    # Todo: validate arguments
    first_name, last_name, email, password = data['first_name'], data['last_name'], data['email'], data['password']
    if not fullmatch(r'[a-zA-Z]{2,}\d*@uwo\.ca+', email):
        return jsonify(error='Invalid uwo email')
    if len(password) < 8:
        return jsonify(error='Password too short')

    user = User.query.filter(User.email == email).all()
    if len(user) is not 0:
        return jsonify(error='User already exists')

    user = User(email, first_name, last_name, password, False, 9, 0)
    db.session.add(user)
    db.session.commit()
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
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    try:
        email = serializer.loads(token, salt=config.SECURITY_PASSWORD_SALT)
    except BadSignature:
        return "Invalid confirmation link"
    user = User.query.filter(User.email == email).first()
    if user is None:
        return "There is no account associated with the email in that token"

    if not user.confirmed:
        user.confirmed = True
        db.session.commit()
    # noinspection PyUnresolvedReferences
    return render_template('/index.html')


# Tested
@UserRoutes.route('/login', methods=['POST'])
def login():
    if not request.json:
        return abort(400)
    data = request.json
    username, password = data['username'], data['password']
    try:
        user = User.query.filter(User.email == username).one()
    except NoResultFound:
        return jsonify(error='Account does not exist!')
    if not check_password(password, user.salt, user.password):
        return jsonify(error='Password is incorrect!')
    elif not user.confirmed:
        return jsonify(error='Account has not been confirmed!')
    else:
        login_user(user)
        return jsonify(message='Successfully logged in')


@login_required
@UserRoutes.route('/logout')
def logout():
    logout_user()
    return jsonify(message='Successfully logged out')


# Tested
@UserRoutes.route('/getUserInfo')
def get_user_info():
    try:
        return jsonify(first_name=current_user.first_name, last_name=current_user.last_name,
                       is_teacher=current_user.is_teacher, is_admin=current_user.is_admin,
                       color=current_user.color, theme=current_user.theme)
    except:
        return jsonify(error='User does not exist')


def teaches_class(class_id):
    current_class = Class.query.get(class_id)
    if current_user.USER is current_class.USER:
        return True
    return False


def enrolled_in_class(class_id):
    current_class = Class.query.filter((enrolled.c.CLASS == class_id) & (current_user == enrolled.c.USER)).all()
    if len(current_class) is 0:
        return False
    return True


def send_email(recipient: str, subject: str, message: str):
    sender = 'no-reply@avocadocore.com'
    msg = MIMEMultipart()
    msg['From'], msg['To'], msg['Subject'] = sender, recipient, subject
    msg.attach(MIMEText(message, 'html'))
    # noinspection SpellCheckingInspection
    server = SMTP('smtp.zoho.com', 587)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(sender, '@henrikiscontributingtoconvo@1')
    server.sendmail(sender, recipient, msg.as_string())
