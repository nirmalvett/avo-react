from flask import Flask, render_template, send_file, request, abort, jsonify
from flask_login import login_required, current_user, login_user, logout_user, LoginManager
from sqlite3 import connect
from hashlib import sha512
from uuid import uuid4
from itsdangerous import URLSafeTimedSerializer, BadSignature
from re import fullmatch
# noinspection PyUnresolvedReferences
import config as config

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')
app.secret_key = config.SECRET_KEY
login_manager = LoginManager()
login_manager.init_app(app)


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


@app.route('/favicon.ico')
def serve_icon():
    return send_file('../static/favicon.ico')


@app.route('/')
def serve_sign_in():
    # noinspection PyUnresolvedReferences
    return render_template('/index.html')


# noinspection PyUnusedLocal
@app.route('/<path:path>/dist/<filename>')
def serve_static_file(path, filename):
    return send_file('../static/dist/' + filename)


@app.route('/confirm/<token>')
def confirm(token):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
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
    login_user(User(user[0]))  # This is probably not a good idea but whatever I'll remove it later
    # noinspection PyUnresolvedReferences
    return render_template('/index.html')


@app.route('/register', methods=['POST'])
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
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    token = serializer.dumps(email, salt=config.SECURITY_PASSWORD_SALT)
    print(token)
    return jsonify(message='Account created')


@app.route('/login', methods=['POST'])
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
@app.route('/logout')
def logout():
    logout_user()
    return jsonify(message='Successfully logged out')


@login_required
@app.route('/change_color', methods=['POST'])
def change_color():
    if not request.json:
        return abort(400)
    data = request.json
    color = data['color']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('UPDATE user SET color=? WHERE user=?', (color, current_user.id))
    database.commit()
    database.close()
    return jsonify(message='updated')


@login_required
@app.route('/change_theme', methods=['POST'])
def change_theme():
    if not request.json:
        return abort(400)
    data = request.json
    theme = data['theme']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('UPDATE user SET theme=? WHERE user=?', (theme, current_user.id))
    database.commit()
    database.close()
    return jsonify(message='updated')


@app.route('/get_user_info')
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


@login_required
@app.route('/create_class', methods=['POST'])
def create_class():
    if not request.json:
        return abort(400)
    name = request.json['name']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('INSERT INTO `class`(`user`,`name`,`enroll_key`) VALUES (?,?,?);', (current_user.get_id(), name, name))
    database.commit()
    database.close()
    return jsonify(message='Created!')


@login_required
@app.route('/get_classes')
def get_classes():
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT class, name, enroll_key FROM class WHERE user=?', (current_user.get_id(),))
    classes = db.fetchall()
    db.execute('SELECT class.class, class.name, class.enroll_key FROM class LEFT JOIN enrolled'
               ' on class.class = enrolled.class WHERE enrolled.user=?', (current_user.get_id(),))
    classes += db.fetchall()
    class_list = []
    for c in classes:
        db.execute('SELECT test, name, is_open FROM test WHERE class=?', (c[0],))
        tests = db.fetchall()
        test_list = []
        for t in tests:
            test_list.append({'id': t[0], 'name': t[1], 'open': t[2]})
        class_list.append({'id': c[0], 'name': c[1], 'enrollKey': c[2], 'tests': test_list})
    database.close()
    return jsonify(classes=class_list)


@login_required
@app.route('/get_sets')
def get_sets():
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT `set`.[set], `set`.name FROM `set` LEFT JOIN user_views_set on '
               '`set`.[set] = user_views_set.[set] WHERE user_views_set.user=?', (current_user.get_id(),))
    sets = db.fetchall()
    set_list = []
    for s in sets:
        db.execute('SELECT question, name, string, total FROM question WHERE `set`=?', (s[0],))
        questions = db.fetchall()
        question_list = []
        for q in questions:
            question_list.append({'id': q[0], 'name': q[1], 'string': q[2], 'total': q[3]})
        set_list.append({'id': s[0], 'name': s[1], 'questions': question_list})
    database.close()
    return jsonify(sets=set_list)


@login_required
@app.route('/enroll', methods=['POST'])
def enroll():
    if not request.json:
        return abort(400)
    key = request.json['key']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT class FROM class WHERE enroll_key=?', (key,))
    c = db.fetchone()
    if c is None:
        return jsonify(error='Invalid enroll key')
    db.execute('INSERT INTO `enrolled`(`user`,`class`) VALUES (?,?);', (current_user.get_id(), c[0]))
    database.commit()
    database.close()
    return jsonify(message='Enrolled!')


if __name__ == '__main__':
    app.run()
