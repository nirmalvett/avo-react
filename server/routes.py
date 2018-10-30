from flask import Blueprint, abort, jsonify, request
from flask_login import login_required, current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion
from random import randint
from datetime import datetime, timedelta
import sys
from git import Repo

from server.DecorationFunctions import *

from server.models import *

routes = Blueprint('routes', __name__)


@login_required
@check_confirmed
@routes.route('/changeColor', methods=['POST'])
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

    # Commit the users's changes to the DB
    current_user.color = color
    db.session.commit()
    return jsonify(message='updated')


@login_required
@check_confirmed
@routes.route('/changeTheme', methods=['POST'])
def change_theme():
    """
    Changes the current user's theme
    :return: Confirmation of the change
    """
    if not request.json:
        # If the request isn't JSON return a 400 error
        return abort(400)
    data = request.json # Data from the client
    theme = data['theme']
    # Applies the user's changes to the database
    current_user.theme = theme
    db.session.commit()
    return jsonify(message='updated')


@login_required
@check_confirmed
@teacher_only
@routes.route('/createClass', methods=['POST'])
def create_class():
    """
    Creates a class with the current user as the teacher
    :return: Confirmation that the class was created
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    name = request.json['name']  # Name of the new class
    new_class = Class(current_user.USER, name)  # Class to be created
    # Add to database and commit
    db.session.add(new_class)
    db.session.commit()
    return jsonify(message='Created!')


@login_required
@check_confirmed
@routes.route('/getClasses')
def get_classes():
    """
    Get the current users classes available to them
    :return: A list of class data
    """
    teach_classes = []  # The classes the current user teaches
    if current_user.is_teacher is True:
        # If the current user is a teacher query the data base for teaching classes
        teach_classes = Class.query.filter(Class.USER == current_user.USER).all()
    enroll_classes = Class.query.filter((Class.CLASS == enrolled.c.CLASS) & (current_user.USER == enrolled.c.USER)).all()  # Classes the current user is enrolled in
    classes = teach_classes + enroll_classes  # append the class lists together
    class_list = []  # List of class data to return to the client
    if classes is not None:
        # If the current user has a relation with any class parse the data to lists
        for c in classes:
            # for every class get the tests and takes and append them
            tests = Test.query.filter(Test.CLASS == c.CLASS).all()
            test_list = []  # List of tests in the class
            for t in tests:
                # For every test get all the takes and append them
                takes = Takes.query.order_by(Takes.time_started).filter((Takes.TEST == t.TEST) & (Takes.USER == current_user.USER)).all()
                submitted = []  # List of takes indexes
                current = None  # Current instance of takes
                for ta in takes:
                    # For each instance of takes append the data
                    if ta is not None:
                        # If the takes value is not empty append the data if not append a null value
                        current = {'timeStarted': time_stamp(ta.time_started), 'timeSubmitted': time_stamp(ta.time_submitted)}
                        submitted.append({'takes': ta.TAKES, 'timeSubmitted': time_stamp(ta.time_submitted), 'grade': ta.grade})
                test_list.append({'id': t.TEST, 'name': t.name, 'open': t.is_open, 'deadline': time_stamp(t.deadline), 'timer': t.timer,
                                  'attempts': t.attempts, 'total': t.total, 'submitted': submitted, 'current': current})
            class_list.append({'id': c.CLASS, 'name': c.name, 'enrollKey': c.enroll_key, 'tests': test_list})
    return jsonify(classes=class_list)


@login_required
@check_confirmed
@teacher_only
@routes.route('/getSets')
def get_sets():
    """
    Get the list of Sets available to the user
    :return: The list of sets
    """
    list_of_sets = Set.query.filter((Set.SET == UserViewsSet.SET) & (UserViewsSet.USER == current_user.USER)).all()  # Get list of avalible sets for current user
    set_list = []  # List of sets to send back to the user
    for s in list_of_sets:
        # For each set append the data
        questions = Question.query.filter(Question.SET == s.SET).all()  # Get all questions in set
        question_list = []  # Question data to return to client
        for q in questions:
            # For each question append the data
            question_list.append({'id': q.QUESTION, 'name': q.name, 'string': q.string, 'total': q.total})
        set_list.append({'id': s.SET, 'name': s.name, 'questions': question_list})
    return jsonify(sets=set_list)


@login_required
@check_confirmed
@routes.route('/enroll', methods=['POST'])
def enroll():
    """
    Enroll the current user in a class
    :return: Confirmation
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    key = request.json['key'] # Data sent from user
    try:
        # Find class with said enroll key if no class found return error json
        current_class = Class.query.filter(Class.enroll_key == key).first()
    except NoResultFound:
        return jsonify(error='Invalid enroll key')
    # Append current user to the class
    current_user.CLASS_ENROLLED_RELATION.append(current_class)
    db.session.commit()
    return jsonify(message='Enrolled!')


@login_required
@check_confirmed
@teacher_only
@routes.route('/openTest', methods=['POST'])
def open_test():
    """
    Open a test to be taken
    :return: Confirmation that it is open
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    test = request.json['test']  # Data from client
    current_test = Test.query.get(test)  # Get the test
    if current_test is None:
        # If test cant be found return error json if not set to open and return
        return jsonify(error='No Test Found')
    current_test.is_open = True
    db.session.commit()
    return jsonify(message='Opened!')


@login_required
@check_confirmed
@teacher_only
@routes.route('/closeTest', methods=['POST'])
def close_test():
    """
    Close selected test
    :return: Confirmation that test is closed
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    test = request.json['test']  # Test to close
    current_test = Test.query.get(test) # Get the test
    if current_test is None:
        # If test doesn't exist then return error JSON if not close test and return
        return jsonify(error='No test found')
    current_test.is_open = False
    db.session.commit()
    return jsonify(message='Closed!')


@login_required
@check_confirmed
@teacher_only
@routes.route('/deleteTest', methods=['POST'])
def delete_test():
    """
    Delete Test
    :return: Confirmation that test has been deleted
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    test = request.json['test']  # Test to be deleted
    current_test = Test.query.get(test)  # Get the test
    if current_test is None:
        # If test isn't found return error JSON else set class to none and return
        return jsonify(error='No Test Found')
    current_test.CLASS = None
    db.session.commit()
    return jsonify(message='Deleted!')


@login_required
@check_confirmed
@routes.route('/getQuestion', methods=['POST'])
def get_question():
    """
    Get question data for client
    :return: Question data
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    question, seed = data['question'], data['seed']  # Data from client
    current_question = Question.query.get(question)  # Get question from database
    if current_question is None:
        # If the question isn't found return error json if not return to client
        return jsonify(error='No question found')
    q = AvoQuestion(current_question.string, seed)
    return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types)


@login_required
@check_confirmed
@routes.route('/getTest', methods=['POST'])
def get_test():
    """
    Get test data for client
    :return: Data of test
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    test_id = data['test']  # Data of test requested
    test = Test.query.get(test_id)  # Test requested
    if test is None:
        # If no test found return error json
        return jsonify(error='Test not found')
    if test.is_open is False:
        # If test is not open then return error JSON
        return jsonify(error='This set of questions has not been opened by your instructor yet')
    takes = Takes.query.filter((Takes.TEST == test.TEST) & (current_user.USER == Takes.USER) & (Takes.time_submitted > datetime.now())).first()  # Get the most current takes
    if takes is None:
        # If student has not taken the test create a takes instance
        takes = create_takes(test_id, current_user.get_id())
        if takes is None:
            # If takes still fails return error JSON
            return jsonify(error="Couldn't start test")
    questions = []  # Questions in test
    question_ids = eval(test.question_list)  # IDs of questions in test
    seeds = eval(takes.seeds)  # Seeds of questions in test if -1 gen random seed
    for i in range(len(question_ids)):
        # For each question id get the question data and add to question list
        current_question = Question.query.get(question_ids[i])
        q = AvoQuestion(current_question.string, seeds[i])
        questions.append({'prompt': q.prompt, 'prompts': q.prompts, 'types': q.types})
    return jsonify(takes=takes.TAKES, time_submitted=takes.time_submitted, answers=eval(takes.answers), questions=questions)


def time_stamp(t):
    """
    Casts DateTime object to int
    :param t: DateTime
    :return: int representation of DateTime
    """
    return int('{:04d}{:02d}{:02d}{:02d}{:02d}{:02d}'.format(t.year, t.month, t.day, t.hour, t.minute, t.second))


def create_takes(test, user):
    """
    Creates a new instance of takes
    :param test: Test to create takes of
    :param user: User creating takes of
    :return: takes object
    """
    x = Test.query.get(test)  # Test object to create takes instance of
    if x is None:
        # If test not found return
        return
    takes = Takes.query.filter((Takes.TEST == test) & (Takes.USER == user)).all()  # Get all instances of takes by that user from that test
    if x.attempts != -1 and len(takes) >= x.attempts:
        # If the user has taken more attempts then allowed return
        return
    test_question_list = eval(x.question_list)  # Question list of test
    seeds = list(map(lambda seed: randint(0, 65536) if seed == -1 else seed, eval(x.seed_list)))  # Generates seeds of test
    answer_list = []  # Answers of takes instance
    marks_list = []  # Marks of takes instance
    for i in range(len(test_question_list)):
        # For each question in test add in mark values per question
        q = Question.query.get(test_question_list[i])  # Current question
        marks_list.append([0] * q.string.split('；')[0].count('%'))
        answer_list.append([''] * q.answers)
    t = datetime.now()  # Get current time
    time2 = min(t + timedelta(minutes=x.timer), x.deadline)  # Time submitted based off timer
    # Add all data to takes object and add to database
    takes = Takes(test, user, t, time2, 0, str(marks_list), str(answer_list), str(seeds))
    db.session.add(takes)
    db.session.commit()
    return None if takes is None else takes


@login_required
@check_confirmed
@routes.route('/saveTest', methods=['POST'])
def save_test():
    """
    Save a test created by teacher
    :return: The new test
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    class_id, name, deadline, timer, attempts, question_list, seed_list = \
        data['classID'], data['name'], data['deadline'], data['timer'], data['attempts'], data['questionList'],\
        data['seedList']  # Data from the client
    deadline = str(deadline)  # Deadline of the test converting to datetime
    deadline = deadline[0:4] + "-" + deadline[4:6] + "-" + deadline[6:8] + ' ' + deadline[8:10] + ':' + deadline[10:]
    deadline = datetime.strptime(str(deadline), '%Y-%m-%d %I:%M')
    total = 0  # Total the test is out of
    for q in question_list:
        # For each question calculate the mark and add to the total
        current_question = Question.query.get(q)  # Get the current question from the database
        if current_question is None:
            return jsonify(error="Question Not Found PLease Try Again")
        total += current_question.total
    # Add the test to the database
    test = Test(class_id, name, False, deadline, timer, attempts, str(question_list), str(seed_list), total)
    db.session.add(test)
    db.session.commit()
    return jsonify(test=test.TEST)


@login_required
@check_confirmed
@routes.route('/saveAnswer', methods=['POST'])
def save_answer():
    """
    Save a users answer to a question
    :return: Confirmation that the question has been saved
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    takes, question, answer = data['takes'], data['question'], data['answer']  # Data from user
    takes_list = Takes.query.get(takes)  # Instance of takes to add answer to
    if takes_list is None or takes_list.USER is not current_user.USER:
        # If takes instance cant be found or is not the same as current user return error JSON
        return jsonify(error='Invalid takes record')
    test = Test.query.get(takes_list.TEST)  # Test of that instance of takes
    question_id = eval(test.question_list)[question]  # List of question IDs from test
    current_question = Question.query.get(question_id)  # Current question being modified
    # Update the question mark and answer in the takes instance
    q = AvoQuestion(current_question.string, eval(takes_list.seeds)[question])
    q.get_score(*answer)
    marks = eval(takes_list.marks)
    answers = eval(takes_list.answers)
    marks[question] = q.scores
    # UPdate with new values and commit to DataBase
    takes_list.marks = str(marks)
    answers[question] = answer
    takes_list.answers = str(answers)
    takes_list.grade = sum(map(lambda x: sum(x), marks))
    db.session.commit()
    db.session.close()
    return jsonify(message='Changed successfully!')


@login_required
@check_confirmed
@routes.route('/submitTest', methods=['POST'])
def submit_test():
    """
    Submit a takes to the DataBase
    :return: Confirmation that the takes has been updated
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    takes = data['takes']  # Data from client
    # Get current takes and update submit stime and commit to DataBase
    current_takes = Takes.query.get(takes)
    current_takes.time_submitted = time_stamp(datetime.now() - timedelta(seconds=1))
    db.session.commit()
    return jsonify(message='Submitted successfully!')


@login_required
@check_confirmed
@check_confirmed
@routes.route('/postTest', methods=['POST'])
def post_test():
    """
    Generate the post test screen
    :return: The post test screen data
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    takes = data['takes']  # Data from client
    takes_list = Takes.query.get(takes)  # Get current instance of takes
    if takes_list is None:
        # If takes cant be found return error JSON
        return jsonify(error='No takes record with that ID')
    # Get data from takes and get test from takes
    marks, answers, seeds = eval(takes_list.marks), eval(takes_list.answers), eval(takes_list.seeds)
    test = Test.query.get(takes_list.TEST)
    questions = eval(test.question_list)
    question_list = []
    for i in range(len(questions)):
        # For each question mark question with answer and add to list then return
        current_question = Question.query.get(questions[i])
        q = AvoQuestion(current_question.string, seeds[i])
        q.get_score(*answers[i])
        question_list.append({'prompt': q.prompt, 'prompts': q.prompts, 'explanation': q.explanation, 'types': q.types,
                              'answers': answers[i], 'totals': q.totals, 'scores': q.scores})
    return jsonify(questions=question_list)


@login_required
@check_confirmed
@teacher_only
@routes.route('/getClassTestResults', methods=['POST'])
def get_class_test_results():
    """
    Get test results for a test for teacher
    :return: test results data
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    test = data['test']  # Data from client
    users = User.query.filter((User.USER == enrolled.c.USER) & (Class.CLASS == enrolled.c.CLASS)).all()  # All users in class
    for i in range(len(users)):
        # For each user get user data and best takes instance and present append to list then return
        first_name, last_name = users[i].first_name, users[i].last_name
        takes = Takes.query.order_by(Takes.grade).filter((Takes.USER == users[i].USER) & (Takes.TEST == test)).first()
        users[i] = {'user': users[i].USER, 'firstName': first_name, 'lastName': last_name,
                    'tests': [{'takes': takes.TAKES, 'timeSubmitted': takes.time_submitted, 'grade': takes.grade}]}
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
