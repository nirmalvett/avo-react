from flask import Flask, render_template, send_file, request, abort, jsonify
from flask_login import login_required, current_user, login_user, logout_user, LoginManager
from sqlite3 import connect
from hashlib import sha512

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')
app.secret_key = 'NobodyWillEverGuessThis'
login_manager = LoginManager()
login_manager.init_app(app)


@app.route('/')
@app.route('/signin')
def serve_sign_in():
    return render_template('/index.html')


@app.route('/favicon.ico')
def serve_icon():
    return send_file('../static/favicon.ico')


@app.route('/student/<section>')
@app.route('/teacher/<section>')
def serve_homepage(section):
    return render_template('index.html')


@app.route('/<path:path>/dist/<filename>')
def serve_static_file(path, filename):
    return send_file('../static/dist/' + filename)


@app.route('/login', methods=['POST'])
def login():
    if not request.json:
        return abort(400)
    data = request.json
    username, password = data['username'], data['password']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT user, password, salt, first_name, last_name, is_teacher from user WHERE email=?', (username,))
    user = db.fetchone()
    database.close()
    if user is None:
        return jsonify(error='Account does not exist')
    if user[1] != sha512(user[2].encode() + password.encode()).hexdigest():
        return jsonify(error='Password is incorrect')
    login_user(User(user[0]))
    return jsonify(first_name=user[3], last_name=user[4], type=(user[5] == 1))


@login_required
@app.route('/get_user_info')
def get_user_info():
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT first_name, last_name, is_teacher, is_admin from user WHERE user=?', (current_user.id,))
    user = db.fetchone()
    database.close()
    return jsonify(first_name=user[0], last_name=user[1], is_teacher=user[2], is_admin=user[3])


@app.route('/get_classes')
@login_required
def get_classes():
    return jsonify()


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


if __name__ == '__main__':
    app.run()
