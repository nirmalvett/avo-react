from flask import Blueprint, abort, jsonify, request
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from hashlib import sha512
from re import fullmatch
from sqlite3 import connect
from uuid import uuid4
from itsdangerous import URLSafeTimedSerializer, BadSignature
import config

UserRoutes = Blueprint('UserRoutes', __name__)
login_manager = LoginManager()


class User:
    def __init__(self, user):
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
        self.id = user

    def get_id(self):
        return str(self.id)


@login_manager.user_loader
def load_user(user_id):
    return User(user_id)


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
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT * from user WHERE email=?', (email,))
    if db.fetchone() is not None:
        database.close()
        return jsonify(error='User already exists')
    salt = uuid4().hex
    password = sha512(salt.encode() + password.encode()).hexdigest()
    db.execute('INSERT INTO `user`(`email`,`first_name`,`last_name`,`password`,`salt`) VALUES (?,?,?,?,?);',
               (email, first_name, last_name, password, salt))
    database.commit()
    database.close()
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    token = serializer.dumps(email, salt=config.SECURITY_PASSWORD_SALT)
    print(token)
    return jsonify(message='Account created')


@UserRoutes.route('/confirm/<token>')
def confirm(token):
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    try:
        email = serializer.loads(token, salt=config.SECURITY_PASSWORD_SALT)
    except BadSignature:
        return "Invalid confirmation link"
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT user, confirmed FROM user WHERE email=?', (email,))
    user = db.fetchone()
    if user is None:
        return "There is no account associated with the email in that token"
    if user[1] == 0:
        db.execute('UPDATE user SET confirmed=1 WHERE user=?', (user[0],))
        database.commit()
    database.close()
    # noinspection PyUnresolvedReferences
    return render_template('/index.html')


@UserRoutes.route('/login', methods=['POST'])
def login():
    if not request.json:
        return abort(400)
    data = request.json
    username, password = data['username'], data['password']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT user, password, salt, confirmed from user WHERE email=?', (username,))
    user = db.fetchone()
    database.close()
    if user is None:
        return jsonify(error='Account does not exist')
    elif user[1] != sha512(user[2].encode() + password.encode()).hexdigest():
        return jsonify(error='Password is incorrect')
    elif user[3] == 0:
        return jsonify(error='Account has not been confirmed')
    else:
        login_user(User(user[0]))
        return jsonify(message='Successfully logged in')


@login_required
@UserRoutes.route('/logout')
def logout():
    logout_user()
    return jsonify(message='Successfully logged out')


@UserRoutes.route('/getUserInfo')
def get_user_info():
    if current_user.get_id() is None:
        return jsonify(error='User not logged in')
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT first_name, last_name, is_teacher, is_admin, color, theme from user WHERE user=?',
               (current_user.get_id(),))
    user = db.fetchone()
    database.close()
    if user is None:
        return jsonify(error='User does not exist')
    return jsonify(first_name=user[0], last_name=user[1], is_teacher=user[2],
                   is_admin=user[3], color=user[4], theme=user[5])
