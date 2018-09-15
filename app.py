from flask import request, abort, jsonify
from flask_login import login_required, current_user
from sqlite3 import connect

from random import SystemRandom
from string import ascii_letters, digits

from server.MathCode.question import AvoQuestion

from server import app


@login_required
@app.route('/changeColor', methods=['POST'])
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
@app.route('/changeTheme', methods=['POST'])
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


@login_required
@app.route('/createClass', methods=['POST'])
def create_class():
    if not request.json:
        return abort(400)
    name = request.json['name']
    database = connect('avo.db')
    db = database.cursor()
    key = ''.join(SystemRandom().choice(ascii_letters + digits) for _ in range(10))
    db.execute('INSERT INTO `class`(`user`,`name`,`enroll_key`) VALUES (?,?,?);', (current_user.get_id(), name, key))
    database.commit()
    database.close()
    return jsonify(message='Created!')


@login_required
@app.route('/getClasses')
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
        db.execute('SELECT test, name, is_open, deadline, timer, attempts, is_assignment FROM test WHERE class=?',
                   (c[0],))
        tests = db.fetchall()
        test_list = []
        for t in tests:
            test_list.append({'id': t[0], 'name': t[1], 'open': t[2], 'deadline': t[3],
                              'timer': t[4], 'attempts': t[5], 'is_assignment': t[6]})
        class_list.append({'id': c[0], 'name': c[1], 'enrollKey': c[2], 'tests': test_list})
    database.close()
    return jsonify(classes=class_list)


@login_required
@app.route('/getSets')
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


@login_required
@app.route('/openTest', methods=['POST'])
def open_test():
    if not request.json:
        return abort(400)
    test = request.json['test']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('UPDATE test SET is_open=1 WHERE test=?', (test,))
    database.commit()
    database.close()
    return jsonify(message='Opened!')


@login_required
@app.route('/closeTest', methods=['POST'])
def close_test():
    if not request.json:
        return abort(400)
    test = request.json['test']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('UPDATE test SET is_open=0 WHERE test=?', (test,))
    database.commit()
    database.close()
    return jsonify(message='Closed!')


@login_required
@app.route('/deleteTest', methods=['POST'])
def delete_test():
    if not request.json:
        return abort(400)
    test = request.json['test']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('UPDATE test SET class=NULL WHERE test=?', (test,))
    database.commit()
    database.close()
    return jsonify(message='Deleted!')


@login_required
@app.route('/getQuestion', methods=['POST'])
def get_question():
    if not request.json:
        return abort(400)
    data = request.json
    question, seed = data['question'], data['seed']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT string FROM question WHERE question=?', (question,))
    question = db.fetchone()
    if question is None:
        return jsonify(error='No question found')
    q = AvoQuestion(question[0], seed)
    return jsonify(prompt=q.prompt, prompts=q.prompts)


if __name__ == '__main__':
    app.run()
