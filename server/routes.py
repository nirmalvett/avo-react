from flask import Blueprint, abort, jsonify, request
from flask_login import login_required, current_user
from server.MathCode.question import AvoQuestion
from random import SystemRandom, randint
from string import ascii_letters, digits
from datetime import datetime, timedelta
from sqlite3 import connect
import sys
from git import Repo

routes = Blueprint('routes', __name__)


@login_required
@routes.route('/changeColor', methods=['POST'])
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
@routes.route('/changeTheme', methods=['POST'])
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
@routes.route('/createClass', methods=['POST'])
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
@routes.route('/getClasses')
def get_classes():
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT class, name, enroll_key FROM class WHERE user=?', (current_user.get_id(),))
    classes = db.fetchall()
    db.execute('SELECT class.class, class.name, class.enroll_key FROM class LEFT JOIN enrolled'
               ' on class.class = enrolled.class WHERE enrolled.user=?', (current_user.get_id(),))
    classes += db.fetchall()
    class_list = []
    time = time_stamp(datetime.now())
    for c in classes:
        db.execute('SELECT test, name, is_open, deadline, timer, attempts, total FROM test WHERE class=?',
                   (c[0],))
        tests = db.fetchall()
        test_list = []
        for t in tests:
            db.execute('SELECT takes, time_submitted, grade FROM takes WHERE test=? AND user=? AND time_submitted<?',
                       (t[0], current_user.get_id(), time))
            submitted = list(map(lambda x: {'takes': x[0], 'timeSubmitted': x[1], 'grade': x[2]}, db.fetchall()))
            db.execute('SELECT time_started, time_submitted FROM takes WHERE test=? AND user=? AND time_submitted>?',
                       (t[0], current_user.get_id(), time))
            current = db.fetchone()
            if current is not None:
                current = {'timeStarted': current[0], 'timeSubmitted': current[1]}
            test_list.append({'id': t[0], 'name': t[1], 'open': t[2], 'deadline': str(t[3]), 'timer': t[4],
                              'attempts': t[5], 'total': t[6], 'submitted': submitted, 'current': current})
        class_list.append({'id': c[0], 'name': c[1], 'enrollKey': c[2], 'tests': test_list})
    database.close()
    # Returns a list of objects of the following structure:
    #   {
    #       id: ___,
    #       name: ___,
    #       enrollKey: ___,
    #       tests: [
    #           {
    #               id: ___,
    #               name: ___,
    #               open: ___,
    #               deadline: ___,
    #               timer: ___,
    #               attempts: ___,
    #               total: ___,
    #               submitted: {
    #                   takes: ___,
    #                   timeSubmitted: ___,
    #                   grade: ___,
    #               },
    #               current: {
    #                   timeStarted: ___,
    #                   timeSubmitted: ___,
    #               },
    #           }
    #       ]
    #   }
    return jsonify(classes=class_list)


@login_required
@routes.route('/getSets')
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
@routes.route('/enroll', methods=['POST'])
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
@routes.route('/openTest', methods=['POST'])
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
@routes.route('/closeTest', methods=['POST'])
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
@routes.route('/deleteTest', methods=['POST'])
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
@routes.route('/getQuestion', methods=['POST'])
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
@routes.route('/getTest', methods=['POST'])
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
    if test[1] is False:
        return jsonify(error='Test is Not Open')
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
        return
    test_name, test_is_open, test_deadline, test_timer, test_attempts, test_question_list, test_seed_list = x
    db.execute('SELECT count(*) FROM takes WHERE test=? AND user=?', (test, user))
    if test_attempts != -1 and db.fetchone()[0] >= test_attempts:
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
    database.close()
    return None if takes is None else takes[0]


@login_required
@routes.route('/saveTest', methods=['POST'])
def save_test():
    if not request.json:
        return abort(400)
    data = request.json
    class_id, name, deadline, timer, attempts, question_list, seed_list = \
        data['classID'], data['name'], data['deadline'], data['timer'], data['attempts'], data['questionList'],\
        data['seedList']
    database = connect('avo.db')
    db = database.cursor()
    total = 0
    for q in question_list:
        db.execute('SELECT total FROM question WHERE question=?', [q])
        total += db.fetchone()[0]
    db.execute('INSERT INTO `test`(`class`,`name`,`is_open`,`deadline`,`timer`,`attempts`,'
               '`question_list`,`seed_list`,`total`) VALUES (?,?,0,?,?,?,?,?,?);',
               (class_id, name, deadline, timer, attempts, str(question_list), str(seed_list), total))
    db.execute('SELECT test FROM test WHERE _ROWID_=?', [db.lastrowid])
    test = db.fetchone()[0]
    database.commit()
    database.close()
    return jsonify(test=test)


@login_required
@routes.route('/saveAnswer', methods=['POST'])
def save_answer():
    if not request.json:
        return abort(400)
    data = request.json
    takes, question, answer = data['takes'], data['question'], data['answer']
    time = time_stamp(datetime.now())
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT test, marks, answers, seeds FROM takes WHERE takes=? AND user=? AND time_submitted>?',
               [takes, current_user.get_id(), time])
    takes_list = db.fetchone()
    if takes_list is None:
        return jsonify(error='Invalid takes record')
    answers = eval(takes_list[2])
    answers[question] = answer
    db.execute('UPDATE takes SET answers=? WHERE takes=?', [str(answers), takes])
    database.commit()
    db.execute('SELECT question_list FROM test WHERE test=?', [takes_list[0]])
    question_id = eval(db.fetchone()[0])[question]
    db.execute('SELECT string FROM question WHERE question=?', [question_id])
    question_string = db.fetchone()[0]
    q = AvoQuestion(question_string, eval(takes_list[3])[question])
    q.get_score(*answer)
    marks = eval(takes_list[1])
    marks[question] = q.scores
    grade = sum(map(lambda x: sum(x), marks))
    db.execute('UPDATE takes SET grade=?, marks=? WHERE takes=?', [grade, str(marks), takes])
    database.commit()
    database.close()
    return jsonify(message='Changed successfully!')


@login_required
@routes.route('/submitTest', methods=['POST'])
def submit_test():
    if not request.json:
        return abort(400)
    data = request.json
    takes = data['takes']
    database = connect('avo.db')
    db = database.cursor()
    time = time_stamp(datetime.now() - timedelta(seconds=1))
    db.execute('UPDATE takes SET time_submitted=? WHERE takes=?', (time, takes))
    database.commit()
    database.close()
    return jsonify(message='Submitted successfully!')


@login_required
@routes.route('/postTest', methods=['POST'])
def post_test():
    if not request.json:
        return abort(400)
    data = request.json
    takes = data['takes']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT test, grade, marks, answers, seeds FROM takes WHERE takes=?', [takes])
    takes_list = db.fetchone()
    if takes_list is None:
        return jsonify(error='No takes record with that ID')
    test, grade, marks, answers, seeds = takes_list
    marks, answers, seeds = eval(marks), eval(answers), eval(seeds)
    db.execute('SELECT question_list from test WHERE test=?', [test])
    questions = eval(db.fetchone()[0])
    question_list = []
    for i in range(len(questions)):
        db.execute('SELECT string FROM question WHERE question=?', [questions[i]])
        q = AvoQuestion(db.fetchone()[0], seeds[i])
        q.get_score(*answers[i])
        question_list.append({'prompt': q.prompt, 'prompts': q.prompts, 'explanation': q.explanation, 'types': q.types,
                              'answers': answers[i], 'totals': q.totals, 'scores': q.scores})
    return jsonify(questions=question_list)


@login_required
@routes.route('/getClassTestResults', methods=['POST'])
def get_class_test_results():
    if not request.json:
        return abort(400)
    data = request.json
    test = data['test']
    database = connect('avo.db')
    db = database.cursor()
    db.execute('SELECT class FROM test WHERE test=?', [test])
    cls = db.fetchone()[0]
    db.execute('SELECT user FROM enrolled WHERE class=?', [cls])
    users = list(map(lambda x: x[0], db.fetchall()))
    now = datetime.now()
    for i in range(len(users)):
        db.execute('SELECT first_name, last_name FROM user WHERE user=?', [users[i]])
        names = db.fetchone()
        db.execute('SELECT takes, time_submitted, grade FROM takes WHERE test=? AND user=? AND time_submitted<?',
                   [test, users[i], now])
        users[i] = {'user': users[i], 'firstName': names[0], 'lastName': names[1],
                    'tests': list(map(lambda x: {'takes': x[0], 'timeSubmitted': x[1], 'grade': x[2]}, db.fetchall()))}
    return jsonify(results=users)


# noinspection SpellCheckingInspection
@routes.route('/irNAcxNHEb8IAS2xrvkqYk5sGVRjT3GA', methods=['POST'])
def shutdown():
    """
    Shuts down the app given and update from Gitlab (updating done externally)
    :return: Exits the system
    """
    repo = Repo(".")
    branch = repo.active_branch
    branch = branch.name

    if not request.json:
        # If the request isn't json return a 400 error
        return abort(400)

    if request.headers['X-Gitlab-Token'] != 'eXJqUQzlIYbyMBp7rAw2TfqVXG7CuzFB':
        return abort(400)

    content = request.get_json()
    ref = content.get('ref').split('/')
    request_branch = ref[len(ref) - 1]
    # sys.exit(4) is the specific exit code number needed to exit gunicorn
    if branch == request_branch:
        sys.exit(4)
    else:
        return abort(400)
