from flask import request, abort, jsonify
from flask_login import login_required, current_user
from sqlite3 import connect

from random import SystemRandom, randint
from string import ascii_letters, digits
from datetime import datetime, timedelta

from server.MathCode.question import AvoQuestion

from server import app
# from server.models import *


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
    # current_user.color = color
    # db.session.commit()
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
            test_list.append({'id': t[0], 'name': t[1], 'open': t[2], 'deadline': str(t[3]),
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
    return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types)


@login_required
@app.route('/getTest', methods=['POST'])
def get_test():
    if not request.json:
        return abort(400)
    data = request.json
    test_id = data['test']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT name, is_open, deadline, timer, attempts, question_list, seed_list FROM test WHERE test=?',
               (test_id,))
    test = db.fetchone()
    if test is None:
        return jsonify(error='Test not found')
    db.execute('SELECT takes, time_submitted, answers, seeds from takes WHERE test=? AND user=? AND time_submitted>?',
               (test_id, current_user.get_id(), time_stamp(datetime.now())))
    takes = db.fetchone()
    if takes is None:
        takes = create_takes(test_id, current_user.get_id())
        if takes is None:
            return jsonify(error="Couldn't start test")
        db.execute('SELECT takes, time_submitted, answers, seeds from takes WHERE takes=?', [takes])
        takes = db.fetchone()
    questions = []
    question_ids = eval(test[5])
    seeds = eval(takes[3])
    for i in range(len(question_ids)):
        db.execute('SELECT string FROM question WHERE question=?', [question_ids[i]])
        q = AvoQuestion(db.fetchone()[0], seeds[i])
        questions.append({'prompt': q.prompt, 'prompts': q.prompts, 'types': q.types})
    database.close()
    return jsonify(takes=takes[0], time_submitted=takes[1], answers=eval(takes[2]), questions=questions)


def time_stamp(t):
    return int('{:04d}{:02d}{:02d}{:02d}{:02d}{:02d}'.format(t.year, t.month, t.day, t.hour, t.minute, t.second))


def create_takes(test, user):
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT name, is_open, deadline, timer, attempts, question_list, seed_list FROM test WHERE test=?',
               [test])
    x = db.fetchone()
    if x is None:
        print(1)
        return
    test_name, test_is_open, test_deadline, test_timer, test_attempts, test_question_list, test_seed_list = x
    db.execute('SELECT count(*) FROM takes WHERE test=? AND user=?', (test, user))
    if test_attempts != -1 and db.fetchone()[0] >= test_attempts:
        print(2)
        return
    test_question_list = eval(test_question_list)
    seeds = list(map(lambda seed: randint(0, 65536) if seed == -1 else seed, eval(test_seed_list)))
    answer_list = []
    marks_list = []
    for i in test_question_list:
        db.execute('SELECT string, answers FROM question WHERE question=?', (i,))
        q = db.fetchone()
        marks_list.append([0] * q[0].split('；')[0].count('%'))
        answer_list.append([''] * q[1])
    t = datetime.now()
    time1 = time_stamp(t)
    time2 = min(time_stamp(t + timedelta(minutes=test_timer)), test_deadline*100)
    db.execute('INSERT INTO `takes`(`test`,`user`,`time_started`,`time_submitted`,`marks`,`answers`,`seeds`) '
               'VALUES (?,?,?,?,?,?,?);', (test, user, time1, time2, str(marks_list), str(answer_list), str(seeds)))
    database.commit()
    db.execute('SELECT takes FROM takes WHERE user=? AND time_started=?', (user, str(time1)))
    takes = db.fetchone()
    print(takes)
    database.close()
    print(3)
    return None if takes is None else takes[0]


@login_required
@app.route('/saveTest', methods=['POST'])
def save_test():
    if not request.json:
        return abort(400)
    data = request.json
    class_id, name, deadline, timer, attempts, is_assignment, question_list, seed_list = \
        data['classID'], data['name'], data['deadline'], data['timer'], data['attempts'], data['isAssignment'], \
        data['questionList'], data['seedList']
    database = connect('avo.db')
    db = database.cursor()
    total = 0
    for q in question_list:
        db.execute('SELECT total FROM question WHERE question=?', [q])
        total += db.fetchone()[0]
    db.execute('INSERT INTO `test`(`class`,`name`,`is_open`,`deadline`,`timer`,`attempts`,`is_assignment`,'
               '`question_list`,`seed_list`,`total`) VALUES (?,?,0,?,?,?,?,?,?,?);',
               (class_id, name, deadline, timer, attempts, is_assignment, str(question_list), str(seed_list), total))
    db.execute('SELECT test FROM test WHERE _ROWID_=?', [db.lastrowid])
    test = db.fetchone()[0]
    database.commit()
    database.close()
    return jsonify(test=test)


if __name__ == '__main__':
    # db.create_all(app=app)
    app.run()
