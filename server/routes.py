from flask import Blueprint, abort, jsonify, request, make_response
from flask_login import login_required, current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion
from random import randint
from datetime import datetime, timedelta
import sys
from git import Repo

from server.DecorationFunctions import *
from server.auth import teaches_class, enrolled_in_class, able_edit_set

from server.models import *
import random
import statistics
routes = Blueprint('routes', __name__)


@routes.route('/changeColor', methods=['POST'])
@login_required
@check_confirmed
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
    if not isinstance(color, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")

    # Commit the users's changes to the DB
    current_user.color = color
    db.session.commit()
    return jsonify(message='updated')


@routes.route('/changeTheme', methods=['POST'])
@login_required
@check_confirmed
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
    if not isinstance(theme, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    # Applies the user's changes to the database
    current_user.theme = theme
    db.session.commit()
    return jsonify(message='updated')


@routes.route('/createClass', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def create_class():
    """
    Creates a class with the current user as the teacher
    :return: Confirmation that the class was created
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    name = request.json['name']  # Name of the new class
    if not isinstance(name, str):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    new_class = Class(current_user.USER, name)  # Class to be created
    # Add to database and commit
    db.session.add(new_class)
    db.session.commit()
    return jsonify(message='Created!')


@routes.route('/getClasses')
@login_required
@check_confirmed
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
            student_list = User.query.filter((User.USER == enrolled.c.USER) & (c.CLASS == enrolled.c.CLASS)).all() # Get all users in class
            test_list = []  # List of tests in the class
            time = datetime.now()  # Current time
            for t in tests:
                # For every test get all the takes and append them
                takes = Takes.query.order_by(Takes.time_started).filter((Takes.TEST == t.TEST) & (Takes.USER == current_user.USER)).all()
                submitted = []  # List of takes indexes
                current = None  # Current instance of takes
                for ta in takes:
                    # For each instance of takes append the data
                    if ta is not None:
                        # If the takes value is not empty append the data if not append a null value
                        if ta.time_submitted > time:
                            # If the time submitted in the takes is greater then current time its the current attempt
                            # Else add it to past attempts
                            current = {'timeStarted': time_stamp(ta.time_started), 'timeSubmitted': time_stamp(ta.time_submitted)}
                        else:
                            submitted.append({'takes': ta.TAKES, 'timeSubmitted': time_stamp(ta.time_submitted), 'grade': ta.grade})
                marks_array = []  # Array of marks to sort to find Median
                for s in student_list:
                    # For each student get best takes and calculate averages
                    takes = Takes.query.order_by(Takes.grade).filter(
                        (Takes.TEST == t.TEST) & (Takes.USER == s.USER)).all()  # Get all takes and sort by greatest grade
                    if len(takes) is not 0:
                        # If the student has taken the test then add best instance to mean and median
                        marks_array.append((takes[len(takes) - 1].grade / t.total) * 100)  # Add mark to mark array
                # Calculate the data
                if len(marks_array) is 0:
                    # If there are no marks in the test set values to 0 else calculate values
                    class_median, class_mean, class_stdev = 0, 0, 0
                else:
                    # Calculate the values
                    class_median = statistics.median(marks_array)
                    class_mean = statistics.mean(marks_array)
                    class_stdev = 0
                    if len(marks_array) > 1:
                        # If there are more then two marks a stdev will be calculated
                        class_stdev = statistics.stdev(marks_array)
                if t.deadline < datetime.now():
                    # If the deadline has passed then set the is_open value to False
                    t.is_open = False
                    db.session.commit()
                    test_list.append(
                        {
                            'id': t.TEST,
                            'name': t.name,
                            'open': t.is_open,
                            'deadline': time_stamp(t.deadline),
                            'timer': t.timer,
                            'attempts': t.attempts,
                            'total': t.total,
                            'submitted': submitted,
                            'current': current,
                            'classAverage': class_mean,
                            'classMedian': class_median,
                            'classSize': len(marks_array),
                            'standardDeviation': class_stdev,
                        }
                    )
                else:
                    test_list.append(
                        {
                            'id': t.TEST,
                            'name': t.name,
                            'open': t.is_open,
                            'deadline': time_stamp(t.deadline),
                            'timer': t.timer,
                            'attempts': t.attempts,
                            'total': t.total,
                            'submitted': submitted,
                            'current': current,
                            'classAverage': class_mean,
                            'classMedian': class_median,
                            'classSize': len(marks_array),
                            'standardDeviation': class_stdev,
                        })
            class_list.append({'id': c.CLASS, 'name': c.name, 'enrollKey': c.enroll_key, 'tests': test_list})
    return jsonify(classes=class_list)


@routes.route('testStats', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def test_stats():
    """
    Generate Stats on a per Question basis of a given test
    :return: Test stats data
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json  # Data from client
    test_id = data['id']
    if not isinstance(test_id, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    test = Test.query.get(test_id)  # Test to generate questions from
    if not teaches_class(test.CLASS):
        # If the user doesnt teach the class then return error JSON
        return jsonify(error="User doesn't teach this class")
    students = User.query.filter((User.USER == enrolled.c.USER) & (test.CLASS == enrolled.c.CLASS)).all()  # All students in the class
    test_mean, test_median, test_stdev = 0, 0, 0  # Overall test analytics
    question_mean, question_medaian, question_stdev = [], [], []  # Per Question analytics
    test_question_list = eval(test.question_list)  # Question list of test

    for s in students:
        # For each student get best takes and calculate analytics
        takes = Takes.query.order_by(Takes.grade).filter(
            (Takes.TEST == test.TEST) & (Takes.USER == s.USER)).all()  # Get current students takes
        return jsonify(error="placeholder")
    return jsonify(error="placeholder")


@routes.route('/getSets')
@login_required
@check_confirmed
@teacher_only
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


@routes.route('/newSet', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def create_set():
    """
    Creates a new set
    :return: validation that the set has been added
    """
    if not request.json:
        return abort(400)

    data = request.json  # Data from client
    name = data['name']
    if not isinstance(name, str):
        # If data isn't correct return error JSON
        return jsonify(error="One or more data is not correct")
    new_set = Set(name)  # New set to be created
    user_views_set = UserViewsSet(current_user.USER, set.SET, True)  # New user_views_set to be created
    # Add data to database
    db.session.add(new_set)
    db.session.add(user_views_set)
    db.session.commit()
    return jsonify(id=new_set.SET)


@routes.route('/renameSet', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def rename_set():
    """
    Renames a set
    :return: validation that the set has been updated
    """
    if not request.json:
        return abort(400)

    data = request.json  # Data from client
    id, name = data['id'], data['name']
    if not isinstance(id, int) or not isinstance(name, str):
        # If data isn't correct return error JSON
        return jsonify(error="One or more data is not correct")
    if not able_edit_set(id):
        # if the user isn't able to edit this set return an error JSON
        return jsonify(error="User not able to modify this data")
    new_set = Set.query.get(id)  # Set to be updated
    new_set.name = name
    # Add change to database
    db.session.commit()
    return jsonify(code="Updated")


@routes.route('/deleteSet', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def delete_set():
    """
    Deletes a set
    :return: validation that the set has been Deleted
    """
    if not request.json:
        return abort(400)

    data = request.json  # Data from client
    ID = data['id']
    if not isinstance(ID, int):
        # If data isn't correct return error JSON
        return jsonify(error="One or more data is not correct")
    user_views_set = UserViewsSet.query.get(ID)  # user_views_set to delete
    # Add change to database
    db.session.delete(user_views_set)
    db.session.commit()
    return jsonify(code="Updated")


@routes.route('/enroll', methods=['POST'])
@login_required
@check_confirmed
def enroll():
    """
    Enroll the current user in a class
    :return: Confirmation
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    key = request.json['key']  # Data sent from user
    if not isinstance(key, str):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    try:
        # Find class with said enroll key if no class found return error json
        current_class = Class.query.filter(Class.enroll_key == key).first()
    except NoResultFound:
        return jsonify(error='Invalid enroll key')
    if current_class is None:
        # If no class is found return error JSON
        return jsonify(error='Invalid enroll key')
    # Append current user to the class
    current_user.CLASS_ENROLLED_RELATION.append(current_class)
    db.session.commit()
    return jsonify(message='Enrolled!')


@routes.route('/openTest', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def open_test():
    """
    Open a test to be taken
    :return: Confirmation that it is open
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    test = request.json['test']  # Data from client
    if not isinstance(test, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    current_test = Test.query.get(test)  # Get the test
    if current_test is None:
        # If test cant be found return error json if not set to open and return
        return jsonify(error='No Test Found')
    if teaches_class(current_test.CLASS):
        # If the user teaches the class the test is in open it
        if current_test.deadline < datetime.now():
            return jsonify(error="Deadline has already passed test can't be opened")
        current_test.is_open = True
        db.session.commit()
        return jsonify(message='Opened!')
    else:
        return jsonify(error="User doesn't teach this class")


@routes.route('/closeTest', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def close_test():
    """
    Close selected test
    :return: Confirmation that test is closed
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    test = request.json['test']  # Test to close
    if not isinstance(test, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    current_test = Test.query.get(test) # Get the test
    if current_test is None:
        # If test doesn't exist then return error JSON if not close test and return
        return jsonify(error='No test found')
    if teaches_class(current_test.CLASS):
        # If the user teaches the class the test is in close it
        current_test.is_open = False
        db.session.commit()
        return jsonify(message='Closed!')
    else:
        return jsonify(error="User doesn't teach this class")


@routes.route('/deleteTest', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def delete_test():
    """
    Delete Test
    :return: Confirmation that test has been deleted
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    test = request.json['test']  # Test to be deleted
    if not isinstance(test, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    current_test = Test.query.get(test)  # Get the test
    if current_test is None:
        # If test isn't found return error JSON else set class to none and return
        return jsonify(error='No Test Found')
    if teaches_class(current_test.CLASS):
        current_test.CLASS = None
        db.session.commit()
        return jsonify(message='Deleted!')
    else:
        return jsonify(error="User doesn't teach this class")


@routes.route('/getQuestion', methods=['POST'])
@login_required
@check_confirmed
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
    if not isinstance(question, int) or not isinstance(seed, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    current_question = Question.query.get(question)  # Get question from database
    if current_question is None:
        # If the question isn't found return error json if not return to client
        return jsonify(error='No question found')
    q = AvoQuestion(current_question.string, seed)
    return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types)


@routes.route('/newQuestion', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def new_question():
    """
    Creates new Question and adds to set
    :return: ID of new question
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    set_id, name, string, answers, total = data['set'], data['name'], data['string'], data['answers'], data['total']
    if not isinstance(set_id, int) or not isinstance(name, str) or not isinstance(string, str) or not isinstance(answers, int) or not isinstance(total, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    if not able_edit_set(set_id):
        # If the user is not allowed to edit the set return error json
        return jsonify(error="User not able to edit Set")
    try:
        # Fill out question
        q = AvoQuestion(string)
        answers_array = []
        for i in range(answers):
            # Fill the array with blank answers
            answers_array.append("")
        q.get_score(*answers_array)
    except:
        return jsonify(error="Question Failed to build")
    # Add Question to database
    question = Question(set_id, name, string, answers, total)
    db.session.add(question)
    db.session.commit()

    return jsonify(id=question.QUESTION)


@routes.route('/renameQuestion', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def rename_question():
    """
    Renames question
    :return: Confirmation that Question has been updated
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json  # Data from client
    question_id, name = data['id'], data['string']
    if not isinstance(question_id, int) or not isinstance(name, str):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    question = Question.query.get(question_id)
    if not able_edit_set(question.SET):
        return jsonify(error="User not able to edit SET")
    question.name = name
    db.session.commit()
    return jsonify(code="Updated")


@routes.route('/editQuestion', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def edit_question():
    """
    Update Question data
    :return: Confirmation that question has been updated
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json  # Data from client
    question_id, string, answers, total = data['id'], data['string'], data['answers'], data['total']
    if not isinstance(question_id, int) or not isinstance(string, str) or not isinstance(answers, int) or not isinstance(total, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    question = Question.query.get(question_id)
    if not able_edit_set(question.SET):
        return jsonify(error="User not able to edit SET")
    try:
        # Try to run the question to see if it works
        q = AvoQuestion(string)
        answers_array = []
        for i in range(answers):
            # Create a blank answer array to test the question
            answers_array.append("")
        q.get_score(*answers_array)
    except:
        return jsonify(error="Question could not be created")
    # Update data for database
    question.string = string
    question.answers = answers
    question.total = total

    db.session.commit()
    return jsonify(code="Question updated")


@routes.route('/deleteQuestion', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def delete_question():
    """
    Removes Question Set Link
    :return: Confirmation that question has been removed
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json  # Data from client
    question_id = data['id']
    if not isinstance(question_id, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    question = Question.query.get(question_id)
    if not able_edit_set(question.SET):
        return jsonify(error="User not able to edit SET")
    question.SET = None
    db.session.commit()
    return jsonify(code="Updated")


@routes.route('/sampleQuestion', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def sample_question():
    """
    Generates sample question
    :return: data of generated question
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json  # Data from client
    string = data['string']
    try:
        # If answers were provided then test answers
        answers = data['answers'] # answers from client
        if not isinstance(string, str) or not isinstance(answers, list):
            # Checks if all data given is of correct type if not return error JSON
            return jsonify(error="One or more data is not correct")
        try:
            # Try to create and mark the question if it fails return error JSON
            q = AvoQuestion(string)
            q.get_score(*answers)
        except:
            return jsonify(error="Question failed to be created")
        return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types, points=q.scores)
    except:
        # if no answers were provided make false answers
        if not isinstance(string, str):
            # Checks if all data given is of correct type if not return error JSON
            return jsonify(error="One or more data is not correct")
        try:
            # Try to create and mark the question if fails return error JSON
            q = AvoQuestion(string)
            answers = []  # Array to hold placeholder answers
            for i in range(len(answers)):
                # Fill the array with blank answers
                answers.append("")
            q.get_score(*answers)
        except:
            return jsonify(error="Question failed to be created")
        return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types)


@routes.route('/getTest', methods=['POST'])
@login_required
@check_confirmed
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
    if not isinstance(test_id, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    test = Test.query.get(test_id)  # Test requested
    if test is None:
        # If no test found return error json
        return jsonify(error='Test not found')
    if teaches_class(test.CLASS) or enrolled_in_class(test.CLASS):
        if test.is_open is False:
            # If test is not open then return error JSON
            return jsonify(error='This set of questions has not been opened by your instructor yet')
        if test.deadline < datetime.now():
            # If deadline has passed set test to closed and return error JSON
            test.is_open = False
            db.session.commit()
            return jsonify(error='The deadline has passed for this test')
        takes = Takes.query.filter((Takes.TEST == test.TEST) & (current_user.USER == Takes.USER) & (Takes.time_submitted > datetime.now())).first()  # Get the most current takes
        timer = 0
        if takes is None:
            # If student has not taken the test create a takes instance
            takes = create_takes(test_id, current_user.get_id())
            if takes is None:
                # If takes still fails return error JSON
                return jsonify(error="Couldn't start test")
        else:
            takes.time_started = datetime.now()
            db.session.commit()
        questions = []  # Questions in test
        question_ids = eval(test.question_list)  # IDs of questions in test
        seeds = eval(takes.seeds)  # Seeds of questions in test if -1 gen random seed
        timer = takes.time_submitted - takes.time_started
        timer = timer.total_seconds() / 60
        for i in range(len(question_ids)):
            # For each question id get the question data and add to question list
            current_question = Question.query.get(question_ids[i])
            q = AvoQuestion(current_question.string, seeds[i])
            questions.append({'prompt': q.prompt, 'prompts': q.prompts, 'types': q.types})
        return jsonify(takes=takes.TAKES, timer=timer, time_submitted=takes.time_submitted, answers=eval(takes.answers), questions=questions)
    else:
        return jsonify(error="User doesn't have access to that Class")


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


@routes.route('/saveTest', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
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
    if not isinstance(class_id, int) or not isinstance(name, str) or not isinstance(deadline, str) or not \
            isinstance(timer, str) or not isinstance(attempts, str) or not isinstance(question_list, list) or not \
            isinstance(seed_list, list):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    if not teaches_class(class_id):
        return jsonify(error="User doesn't teach this class")
    if len(question_list) is 0:
        return jsonify(error="Can't Submit A Test WIth Zero Questions")
    deadline = deadline[0:4] + "-" + deadline[4:6] + "-" + deadline[6:8] + ' ' + deadline[8:10] + ':' + deadline[10:]
    deadline = datetime.strptime(str(deadline), '%Y-%m-%d %H:%M')
    total = 0  # Total the test is out of
    for q in question_list:
        # For each question calculate the mark and add to the total
        current_question = Question.query.get(q)  # Get the current question from the database
        if current_question is None:
            return jsonify(error="Question Not Found PLease Try Again")
        total += current_question.total
    # Add the test to the database
    test = Test(class_id, name, False, deadline, int(timer), int(attempts), str(question_list), str(seed_list), total)
    db.session.add(test)
    db.session.commit()
    return jsonify(test=test.TEST)


@routes.route('/changeTest', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def change_test():
    """
    Changes the Deadline Timer and Name of specified test
    :return: Confirmation that data has been updated
    """
    if not request.json:
        # If the request isn't JSON return a 400 error
        return abort(400)
    data = request.json # Data from client
    test, timer, name, deadline = data['test'], data['timer'], data['name'], data['deadline']
    if not isinstance(test, int) or not isinstance(timer, int) or not isinstance(name, str) or not \
            isinstance(deadline, datetime):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    test = Test.query.get(test) # Gets the test object
    if not teaches_class(test.CLASS):
        # If the teacher doesn't teach the class the test is in return error
        return jsonify(error="User does not teach class")
    # Updates Test data
    test.deadline = deadline
    test.timer = timer
    test.name = name

    db.session.commit()
    return jsonify(code="Test Updated")


@routes.route('/saveAnswer', methods=['POST'])
@login_required
@check_confirmed
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
    if not isinstance(takes, int) or not isinstance(question, int) or not isinstance(answer, list):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
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
    # Update with new values and commit to DataBase
    takes_list.marks = str(marks)
    answers[question] = answer
    takes_list.answers = str(answers)
    takes_list.grade = sum(map(lambda x: sum(x), marks))
    db.session.commit()
    db.session.close()
    return jsonify(message='Changed successfully!')


@routes.route('/submitTest', methods=['POST'])
@login_required
@check_confirmed
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
    if not isinstance(takes, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    # Get current takes and update submit time and commit to DataBase
    current_takes = Takes.query.get(takes)
    test = Test.query.get(current_takes.TEST)
    if test.deadline < datetime.now():
        # If test deadline has passed close test return error JSON
        return jsonify(error="Test deadline has passed")
    current_takes.time_submitted = time_stamp(datetime.now() - timedelta(seconds=1))
    db.session.commit()
    return jsonify(message='Submitted successfully!')


@routes.route('/postTest', methods=['POST'])
@login_required
@check_confirmed
@check_confirmed
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
    if not isinstance(takes, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    takes_list = Takes.query.get(takes)  # Get current instance of takes
    if takes_list is None:
        # If takes cant be found return error JSON
        return jsonify(error='No takes record with that ID')
    # Get data from takes and get test from takes
    marks, answers, seeds, = eval(takes_list.marks), eval(takes_list.answers), eval(takes_list.seeds)
    test = Test.query.get(takes_list.TEST)
    if enrolled_in_class(test.CLASS) or teaches_class(test.CLASS):
        questions = eval(test.question_list)
        question_list = []
        for i in range(len(questions)):
            # For each question mark question with answer and add to list then return
            current_question = Question.query.get(questions[i])
            q = AvoQuestion(current_question.string, seeds[i])
            q.get_score(*answers[i])
            question_list.append({'prompt': q.prompt, 'prompts': q.prompts, 'explanation': q.explanation,
                                  'types': q.types, 'answers': answers[i], 'totals': q.totals, 'scores': marks[i]})
        return jsonify(questions=question_list)
    else:
        return jsonify(error="User isn't in class")


@routes.route('/getClassTestResults', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
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
    if not isinstance(test, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    current_test = Test.query.get(test)
    if not teaches_class(current_test.CLASS):
        return jsonify(error="User doesn't teach class")
    users = User.query.filter((User.USER == enrolled.c.USER) & (current_test.CLASS == enrolled.c.CLASS)).all()  # All users in class
    for i in range(len(users)):
        # For each user get user data and best takes instance and present append to list then return
        first_name, last_name = users[i].first_name, users[i].last_name
        takes = Takes.query.filter((Takes.USER == users[i].USER) & (Takes.TEST == test)).order_by(Takes.grade).all()
        if len(takes) is 0:
            # If the student hasn't taken the test then return default values else return the marks
            users[i] = {'user': users[i].USER, 'firstName': first_name, 'lastName': last_name,
                        'tests': []}
        else:
            users[i] = {'user': users[i].USER, 'firstName': first_name, 'lastName': last_name,
                        'tests': [{'takes': takes[len(takes) - 1].TAKES,
                                   'timeSubmitted': time_stamp(takes[len(takes) - 1].time_submitted),
                                   'grade': takes[len(takes) - 1].grade}]}
    return jsonify(results=users)


@routes.route('/CSV/ClassMarks/<classid>')
@login_required
@check_confirmed
@teacher_only
def csv_class_marks(classid):
    """
    Generate a CSV file of the class marks
    :param classid: The ID of the class to generate marks
    :return: A CSV file of the class marks
    """

    if not teaches_class(classid):
        # If the teacher is not in the class return a 400 error page
        return abort(400)
    # Query the database for data on the test class and students data
    output_class = Class.query.get(classid)
    student_array = User.query.join(enrolled).join(Class).filter(
        (enrolled.c.CLASS == classid) & (enrolled.c.USER == User.USER)).all()
    test_array = Test.query.filter(Test.CLASS == classid).all()
    test_name_list = []  # An array of the test names
    output_string = '\"Email\" '  # The output for the file

    for i in range(len(test_array)):
        # For each test add the names to the array and update the file string
        test_name_list.append(test_array[i].name)
        output_string = output_string + ', \"' + str(test_array[i].name) + '\" '

    for i in range(len(student_array)):
        # For each student get there best mark on each test and add it to the array
        current_string = '\n' + '\"' + str(student_array[i].email) + '\"'  # A string for each line of the file

        for j in range(len(test_array)):
            # For each test get the best mark and add it to the array
            mark = Takes.query.join(User).join(Test).filter(
                (Takes.TEST == test_array[j].TEST) & (student_array[i].USER == User.USER)).all()
            try:
                # Get the best mark f they havn't taken the test add a value as such
                top_mark = 0
                for k in range(len(mark)):
                    # For each mark compare the grade and if its greater add it to the string
                    if mark[k].grade >= top_mark:
                        top_mark = k
                current_string = current_string + ', ' + str(mark[top_mark].grade) + ' / ' + str(
                    test_array[i].total)
            except IndexError:
                current_string = current_string + ', ' + 'Test Not Taken'
        output_string = output_string + current_string

    response = make_response(output_string)
    response.headers["Content-Disposition"] = "attachment; filename=" + output_class.name + ".csv"
    return response  # Return the file to the user


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
