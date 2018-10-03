from flask import Blueprint, abort, jsonify, request
from flask_login import login_required, current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion
from random import SystemRandom, randint
from string import ascii_letters, digits
from datetime import datetime, timedelta
from sqlite3 import connect
import sys
from git import Repo

from server.DecorationFunctions import *

from server.models import *

routes = Blueprint('routes', __name__)


@login_required
@check_confirmed
@routes.route('/changeColor', methods=['POST'])
def change_color():
    if not request.json:
        return abort(400)
    data = request.json
    color = data['color']

    current_user.color = color
    db.session.commit()
    return jsonify(message='updated')


@login_required
@check_confirmed
@routes.route('/changeTheme', methods=['POST'])
def change_theme():
    if not request.json:
        return abort(400)
    data = request.json
    theme = data['theme']
    current_user.theme = theme
    db.session.commit()
    return jsonify(message='updated')


@login_required
@check_confirmed
@teacher_only
@routes.route('/createClass', methods=['POST'])
def create_class():
    if not request.json:
        return abort(400)
    name = request.json['name']
    key = ''.join(SystemRandom().choice(ascii_letters + digits) for _ in range(10))
    new_class = Class(current_user.USER, name, key)
    db.session.add(new_class)
    db.session.commit()
    return jsonify(message='Created!')


@login_required
@routes.route('/getClasses')
def get_classes():

    teach_classes = Class.query.filter(Class.USER == current_user.USER).all()
    enroll_classes = Class.query.filter((Class.CLASS == enrolled.c.CLASS) & (current_user.USER == enrolled.c.USER)).all()
    classes = teach_classes.append(enroll_classes)
    class_list = []
    time = time_stamp(datetime.now())
    for c in classes:
        tests = Test.query.filter(Test.CLASS == c.CLASS).all()
        test_list = []
        for t in tests:
            takes = Takes.query.order_by(Takes.grade).filter((Takes.TEST == t.TEST) & (Takes.USER == current_user.USER) & (Takes.time_submitted > time)).first()
            submitted = list({'takes': takes.TAKES, 'timeSubmitted': takes.time_submitted, 'grade': takes.grade})
            current = None
            if takes is not None:
                current = {'timeStarted': takes.time_started, 'timeSubmitted': takes.time_submitted}
            test_list.append({'id': t.TEST, 'name': t.name, 'open': t.is_open, 'deadline': t.deadline, 'timer': t.timer,
                              'attempts': t.attempts, 'total': t.total, 'submitted': takes.submitted, 'current': current})
        class_list.append({'id': c.CLASS, 'name': c.name, 'enrollKey': c.enroll_key, 'tests': test_list})
    return jsonify(classes=class_list)


@login_required
@check_confirmed
@teacher_only
@routes.route('/getSets')
def get_sets():
    list_of_sets = Set.query.filter((Set.SET == UserViewsSet.SET) & (UserViewsSet.USER == current_user.USER)).all()
    set_list = []
    for s in list_of_sets:
        questions = Question.query.filter(Question.SET == s.SET).all()
        question_list = []
        for q in questions:
            question_list.append({'id': q.QUESTION, 'name': q.name, 'string': q.string, 'total': q.total})
        set_list.append({'id': s.SET, 'name': s.name, 'questions': question_list})
    return jsonify(sets=set_list)


@login_required
@check_confirmed
@routes.route('/enroll', methods=['POST'])
def enroll():
    if not request.json:
        return abort(400)
    key = request.json['key']
    try:
        current_class = Class.query.filter().first()
    except NoResultFound:
        return jsonify(error='Invalid enroll key')
    current_user.TEST_RELATION.append(current_class)
    db.session.commit()
    return jsonify(message='Enrolled!')


@login_required
@check_confirmed
@teacher_only
@routes.route('/openTest', methods=['POST'])
def open_test():
    if not request.json:
        return abort(400)
    test = request.json['test']
    current_test = Test.query.get(test)
    if current_test is None:
        return jsonify(error='No Test Found')
    current_test.is_open = True
    db.session.commit()
    return jsonify(message='Opened!')


@login_required
@routes.route('/closeTest', methods=['POST'])
def close_test():
    if not request.json:
        return abort(400)
    test = request.json['test']
    current_test = Test.query.get(test)
    if current_test is None:
        return jsonify(error='No test found')
    current_test.is_open = False
    db.session.commit()
    return jsonify(message='Closed!')


@login_required
@routes.route('/deleteTest', methods=['POST'])
def delete_test():
    if not request.json:
        return abort(400)
    test = request.json['test']
    current_test = Test.query.get(test)
    if current_test is None:
        return jsonify(error='No Test Found')
    current_test.CLASS = None
    db.session.commit()
    return jsonify(message='Deleted!')


@login_required
@check_confirmed
@routes.route('/getQuestion', methods=['POST'])
def get_question():
    if not request.json:
        return abort(400)
    data = request.json
    question, seed = data['question'], data['seed']
    current_question = Question.query.get(question)
    if current_question is None:
        return jsonify(error='No question found')
    q = AvoQuestion(current_question.string, seed)
    return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types)


@login_required
@routes.route('/getTest', methods=['POST'])
def get_test():
    if not request.json:
        return abort(400)
    data = request.json
    test_id = data['test']
    test = Test.query.get(test_id)
    if test is None:
        return jsonify(error='Test not found')
    takes = Takes.query.filter((Takes.TEST == test.TEST) & (current_user.USER == Takes.USER) & (Takes.time_submitted > datetime.now())).first()
    if takes is None:
        takes = create_takes(test_id, current_user.get_id())
        if takes is None:
            return jsonify(error="Couldn't start test")
    questions = []
    question_ids = eval(test.question_list)
    seeds = eval(takes.seeds)
    for i in range(len(question_ids)):
        current_question = Question.query.get(question_ids[i])
        q = AvoQuestion(current_question.string, seeds[i])
        questions.append({'prompt': q.prompt, 'prompts': q.prompts, 'types': q.types})
    return jsonify(takes=takes.TAKES, time_submitted=takes.time_submitted, answers=eval(takes.answers), questions=questions)


def time_stamp(t):
    return int('{:04d}{:02d}{:02d}{:02d}{:02d}{:02d}'.format(t.year, t.month, t.day, t.hour, t.minute, t.second))


def create_takes(test, user):
    x = Test.query.get(test)
    if x is None:
        return
    takes = Takes.query.filter((Takes.TEST == test.TEST) & (Takes.USER == user.USER)).all()
    if x.attempts != -1 and len(takes) >= x.attempts:
        return
    test_question_list = eval(x.quetion_list)
    seeds = list(map(lambda seed: randint(0, 65536) if seed == -1 else seed, eval(x.seed_list)))
    answer_list = []
    marks_list = []
    for i in test_question_list:
        q = Question.query.get(test_question_list[i])
        marks_list.append([0] * q.string.split('；')[0].count('%'))
        answer_list.append([''] * q.answers)
    t = datetime.now()
    time1 = time_stamp(t)
    time2 = min(time_stamp(t + timedelta(minutes=x.timer)), x.deadline*100)
    takes = Takes(test, user, time1, time2, 0, str(marks_list), str(answer_list), str(seeds))
    db.session.commit()
    return None if takes is None else takes.TAKES


@login_required
@routes.route('/saveTest', methods=['POST'])
def save_test():
    if not request.json:
        return abort(400)
    data = request.json
    class_id, name, deadline, timer, attempts, question_list, seed_list = \
        data['classID'], data['name'], data['deadline'], data['timer'], data['attempts'], data['questionList'],\
        data['seedList']
    total = 0
    for q in question_list:
        current_question = Question.query.get(q)
        total += current_question.total
    test = Test(class_id, name, False, deadline, timer, attempts, question_list, seed_list, total)
    db.session.add(test)
    db.session.commmit()
    return jsonify(test=test)


@login_required
@routes.route('/saveAnswer', methods=['POST'])
def save_answer():
    if not request.json:
        return abort(400)
    data = request.json
    takes, question, answer = data['takes'], data['question'], data['answer']
    time = time_stamp(datetime.now())
    takes_list = Takes.query.get(takes)
    if takes_list is None or takes_list.USER is not current_user.USER or takes_list.deadline < time:
        return jsonify(error='Invalid takes record')
    test = Test.query.get(takes_list.TEST)
    question_id = eval(test.question_list)[question]
    current_question = Question.query.get(question_id)
    q = AvoQuestion(current_question.string, eval(takes_list.seed_list)[question])
    q.get_score(*answer)
    marks = eval(takes_list.marks)
    answers = eval(takes_list.answers)
    marks[question] = q.scores
    takes_list.marks = marks
    answers[question] = answer
    takes_list.answers = answers
    takes_list.grade = sum(map(lambda x: sum(x), marks))
    db.session.commit()
    db.session.close()
    return jsonify(message='Changed successfully!')


@login_required
@routes.route('/submitTest', methods=['POST'])
def submit_test():
    if not request.json:
        return abort(400)
    data = request.json
    takes = data['takes']
    current_takes = Takes.query.get(takes)
    current_takes.time_submitted = time_stamp(datetime.now() - timedelta(seconds=1))
    db.session.commit()
    return jsonify(message='Submitted successfully!')


@login_required
@routes.route('/postTest', methods=['POST'])
def post_test():
    if not request.json:
        return abort(400)
    data = request.json
    takes = data['takes']
    takes_list = Takes.query.get(takes)
    if takes_list is None:
        return jsonify(error='No takes record with that ID')
    marks, answers, seeds = eval(takes_list.marks), eval(takes_list.answers), eval(takes_list.seeds)
    test = Test.query.get(takes.TEST)
    questions = eval(test.question_list)
    question_list = []
    for i in range(len(questions)):
        current_question = Question.query.get(questions[i])
        q = AvoQuestion(current_question.string, seeds[i])
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
    users = User.query.filter((User.USER == enrolled.c.USER) & (Class.CLASS == enrolled.c.CLASS)).all()
    for i in range(len(users)):
        first_name, last_name = users[i].first_name, users[i].last_name
        takes = Takes.query.order_by(Takes.grade).filter((Takes.USER == users[i].USER) & (Takes.TEST == test)).first()
        users[i] = {'user': users[i].USER, 'firstName': first_name, 'lastName': last_name,
                    'tests': {'takes': takes.TAKES, 'timeSubmitted': takes.time_submitted, 'grade': takes.grade}}
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
        return abort(404)
    elif branch == request_branch:
        sys.exit(4)
        return abort(404)
    else:
        return abort(400)
