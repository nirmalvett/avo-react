from flask import Blueprint, abort, jsonify, request, make_response
from flask_login import login_required, current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion
from random import randint
from datetime import datetime, timedelta
import sys
from git import Repo
import paypalrestsdk
from yaml import load
import statistics

import config
from server.DecorationFunctions import *
from server.auth import teaches_class, enrolled_in_class, able_edit_set
from server.models import *

routes = Blueprint('routes', __name__)

yaml_file = open("config.yaml", 'r')
yaml_obj = load(yaml_file)
yaml_file.close()
print(">>> PayPal is set to " + str(yaml_obj['paypal_mode']) + " <<<")

# PayPal API Configuration
paypalrestsdk.configure(
    {
        'mode': yaml_obj['paypal_mode'],
        'client_id': config.PAYPAL_ID,
        'client_secret': config.PAYPAL_SECRET
    }
)
del yaml_obj


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

    # Gets all user Takes
    users_takes = db.session.execute("SELECT CLASS.CLASS, TEST.TEST, takes.grade, takes.time_started, takes.time_submitted, takes.TAKES"
                                    " FROM CLASS"
                                    " INNER JOIN enrolled ON enrolled.CLASS = CLASS.CLASS"
                                    " INNER JOIN USER ON enrolled.USER = USER.USER"
                                    " INNER JOIN TEST ON TEST.CLASS = enrolled.CLASS"
                                    " INNER JOIN takes ON TEST.TEST = takes.TEST AND takes.USER = USER.USER"
                                    " WHERE USER.USER = " + str(current_user.USER) + " ORDER BY TEST.TEST;")

    # Gets all classes with averages and STDEV
    users_class_stats = db.session.execute("SELECT CLASS, enroll_key, class_name, TEST, test_name, is_open, deadline, timer, "
                                           "attempts,total, round(AVG(grade) / total * 100, 2) AS average,round(STDDEV(grade) / total * 100, 2) AS stdev, "
                                           "COUNT(grade) AS student_count "
                                           "FROM (SELECT CLASS.CLASS, CLASS.enroll_key, CLASS.name AS class_name, TEST.TEST, TEST.name AS test_name, "
                                           "TEST.is_open, TEST.deadline, TEST.timer, TEST.attempts, TEST.total, MAX(takes.grade) AS grade "
                                           "FROM CLASS INNER JOIN enrolled ON enrolled.CLASS = CLASS.CLASS INNER JOIN USER u1 "
                                           "ON enrolled.USER = u1.USER INNER JOIN TEST ON TEST.CLASS = enrolled.CLASS INNER JOIN takes "
                                           "ON takes.TEST = TEST.TEST INNER JOIN USER u2 ON takes.USER = u2.USER AND NOT u2.is_teacher = 1 "
                                           "WHERE  u1.USER = " + str(current_user.USER) + " GROUP  BY takes.USER, takes.TEST) AS d GROUP  BY TEST; ")

    users_median = db.session.execute("SELECT TEST, AVG(g.grade) AS median FROM (SELECT a.grade AS grade,"
                                      "TEST, IF(@testindex = TEST, @rowindex:=@rowindex + 1, @rowindex:=0) AS rowindex, "
                                      "IF(@testindex = TEST, @testindex:=@testindex, @testindex:=TEST) AS testindex "
                                      "FROM (SELECT takes.TEST, MAX(takes.grade) AS grade FROM CLASS "
                                      "INNER JOIN enrolled ON enrolled.CLASS = CLASS.CLASS INNER JOIN USER u1 ON enrolled.USER = u1.USER "
                                      "INNER JOIN TEST ON TEST.CLASS = enrolled.CLASS INNER JOIN takes ON takes.TEST = TEST.TEST "
                                      "INNER JOIN USER u2 ON takes.USER = u2.USER AND NOT u2.is_teacher = 1 WHERE "
                                      "u1.USER = " + str(current_user.USER) + " GROUP BY takes.USER , takes.TEST " 
                                      "ORDER BY takes.TEST , grade) AS a) AS g, (SELECT @rowindex:=0, @testindex:=- 1) r "
                                      "WHERE g.rowindex IN (FLOOR(@rowindex / 2) , CEIL(@rowindex / 2)) GROUP BY TEST; ")

    class_list = []  # Data to return to client
    current_time = datetime.now()  # Current time
    class_id = -1

    test_list = []

    current_class = users_class_stats.fetchone()  # Get the next row of user_median
    result_median = users_median.fetchone()

    while current_class is not None:
        # While there are still results in the test gather data
        # For each row in both queries get all the stats
        if result_median.TEST is not current_class.TEST:
            # If the CLASS IDs are not the same return error JSON
            return jsonify(error="Query 2 and 3 went wrong")
        if current_class.deadline < current_time:
            # If the deadline has passed close the test
            test = Test.query.get(current_class.TEST)  # Get current test
            test.is_open = False
            db.session.commit()

            current_test = {
                        'id': current_class.TEST,
                        'name': current_class.class_name,
                        'open': False,
                        'deadline': time_stamp(current_class.deadline),
                        'timer': current_class.timer,
                        'attempts': current_class.attempts,
                        'total': current_class.total,
                        'classAverage': current_class.average,
                        'classMedian': current_class.class_median,
                        'classSize': current_class.student_count,
                        'standardDeviation': current_class.stdev
                            }
        else:
            # The test deadline has not passed
            current_test = {
                        'id': current_class.TEST,
                        'name': current_class.class_name,
                        'open': False,
                        'deadline': time_stamp(current_class.deadline),
                        'timer': current_class.timer,
                        'attempts': current_class.attempts,
                        'total': current_class.total,
                        'classAverage': current_class.average,
                        'classMedian': current_class.class_median,
                        'classSize': current_class.student_count,
                        'standardDeviation': current_class.stdev
            }
        submitted = []  # Submitted Takes in the test
        current = None
        for result_take in users_takes:
            # For each takes result find if its the current attempt or older attempt
            if result_take.TEST is result_median.TEST:
                # If the current result test are the same add data to takes array
                if current_class.time_submitted >= current_time:
                    # If this is the current takes instance make it the current attempt
                    # Else add it to the submitted list
                    current = {'timeStarted': time_stamp(result_take.time_started),
                               'timeSubmitted': time_stamp(result_take.time_submitted)}
                else:
                    submitted.append({'takes': result_take.TAKES,
                                      'timeSubmitted': time_stamp(result_take.time_submitted),
                                      'grade': result_take.grade})

        current_test['submitted'] = submitted
        current_test['current'] = current
        test_list.append(current_test)



    return jsonify(classes=class_list)


@routes.route('/testStats', methods=['POST'])
@login_required
@check_confirmed
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
    del test_id
    del data

    # If the user doesnt teach the class then return error JSON
    if not teaches_class(test.CLASS) and not enrolled_in_class(test.CLASS):
        return jsonify(error="User doesn't teach this class or the user is not enrolled in the class")
    students = User.query.filter((User.USER == enrolled.c.USER) & (test.CLASS == enrolled.c.CLASS)).all()  # All students in the class
    test_marks_total = []  # List of test marks
    question_marks = []  # 2D array with first being student second being question mark

    for s in range(len(students)):
        # For each student get best takes and add to test_marks array
        takes = Takes.query.order_by(Takes.grade).filter(
            (Takes.TEST == test.TEST) & (Takes.USER == students[s].USER)).all()  # Get current students takes
        if len(takes) is not 0:
            # If the student has taken the test get best takes and add to the array of marks
            takes = takes[len(takes) - 1]  # Get best takes instance
            test_marks_total.append(takes.grade)
            question_marks.append(eval(takes.marks))  # append the mark array to the student mark array
            del takes
    del students
    question_total_marks = []  # Each students mark per question

    if len(question_marks) is 0:
        # If none has taken the test return default values
        test_questions = eval(test.question_list)  # List of questions in test
        test_question_marks = []
        question = Question.query.filter(Question.QUESTION.in_(test_questions)).all()  # Get all questions in the test
        if len(test_questions) is not len(question):
            # If a question could not be found return an error
            return jsonify(error="One or more questions not found")
        for i in range(len(test_questions)):  # for each question in the test
            # for each question append the total
            test_question_marks.append(
                {
                    'numberStudents': 0,
                    'questionMean': 0,
                    'questionMedian': 0,
                    'questionSTDEV': 0,
                    'questionMark': question[i].total,
                    'topMarksPerStudent': []
                }
            )
        return jsonify(numberStudents=0, testMean=0, testMedian=0, testSTDEV=0, questions=test_question_marks, topMarkPerStudent=[],
                       totalMark=[])

    for i in range(len(question_marks[0])):
        # For the length of the test array go through each student and append the marks to the arrays
        current_question_mark = []  # Students marks for each question 2D array
        for j in range(len(question_marks)):
            # For each question get the max mark
            student_question_total = 0  # Question total mark
            for k in range(len(question_marks[0][i])):
                # Per each student get the question mark and add to question analytics
                student_question_total += question_marks[j][i][k]
            current_question_mark.append(student_question_total)
        question_total_marks.append(current_question_mark)
    del question_marks

    test_questions = eval(test.question_list)  # List of questions in test
    test_question_marks = []
    question = Question.query.filter(Question.QUESTION.in_(test_questions)).all()  # All questions in test
    for i in range(len(test_questions)):
        # For each question in the test get the question and append the total
        test_question_marks.append(question[i].total)
    question_analytics = []  # Array to return to client of analytics
    del test_questions

    for i in range(len(question_total_marks)):
        # For each question calculate mean median and stdev
        if len(question_total_marks[i]) > 0:
            current_question = {'questionMean': round(statistics.mean(question_total_marks[i]), 2),
                                'questionMedian': statistics.median(question_total_marks[i]),
                                'topMarksPerStudent': question_total_marks[i],
                                'totalMark': test_question_marks[i]
                                }
        else:
            current_question = {'questionMean': 0,
                                'questionMedian': 0,
                                'topMarksPerStudent': question_total_marks[i],
                                'totalMark': test_question_marks[i]
                                }
        if len(question_total_marks[i]) > 1:
            current_question['questionSTDEV'] = statistics.stdev(question_total_marks[i])
        else:
            current_question['questionSTDEV'] = 0
        question_analytics.append(current_question)
    test_mean, test_median, test_stdev = 0, 0, 0  # Overall test analytics
    if len(test_marks_total) is not 0:
        test_mean = statistics.mean(test_marks_total)
        test_median = statistics.median(test_marks_total)
        if len(test_marks_total) > 1:
            test_stdev = statistics.stdev(test_marks_total)
    return jsonify(
        numberStudents=len(test_marks_total), testMean=round(test_mean, 2), testMedian=round(test_median, 2),
        testSTDEV=round(test_stdev, 2), questions=question_analytics, topMarkPerStudent=test_marks_total,
        totalMark=test.total
    )


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
            question_list.append({
                'id': q.QUESTION,
                'name': q.name,
                'string': q.string,
                'total': q.total,
                'answers': q.answers
            })
        set_list.append({
            'id': s.SET,
            'name': s.name,
            'can_edit': able_edit_set(s.SET),
            'questions': question_list
        })
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
    db.session.add(new_set)
    db.session.commit()
    user_views_set = UserViewsSet(current_user.USER, new_set.SET, True)  # New user_views_set to be created
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
    try:
        user_views_set = UserViewsSet.query.filter((UserViewsSet.SET == ID) & (UserViewsSet.USER == current_user.USER)).first()  # user_views_set to delete
    except NoResultFound:
        return jsonify(code="Updated")
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
    print("sanity check")
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
    if current_user.is_teacher:
        # If the user is a teacher enroll them into the class
        if not teaches_class(current_class.CLASS):
            # If the teacher does not teach the class return JSON of success
            current_user.CLASS_ENROLLED_RELATION.append(current_class)
        return jsonify(message='Enrolled')
    transaction = Transaction.query.filter((Transaction.USER == current_user.USER) &
                                           (Transaction.CLASS == current_class.CLASS)).all()  # Checks if the user has a free trial
    free_trial = True
    for i in range(len(transaction)):
        # For each transaction see if it starts with a free trial string
        trans_string = transaction[i].TRANSACTION
        if trans_string.startswith("FREETRIAL-"):
            # If the transaction string starts with free trial set the availability of free trail to false
            free_trial = False
    if current_class.price_discount == 0.00 or current_class.price_discount == 0:
        # Append current user to the class
        current_user.CLASS_ENROLLED_RELATION.append(current_class)
        db.session.commit()
        return jsonify(message='Enrolled!')
    else:
        return jsonify(id=current_class.CLASS, price=current_class.price, discount=current_class.price_discount,
                       tax=round(current_class.price_discount * 0.13, 2),
                       totalprice=round(current_class.price_discount * 1.13, 2), freeTrial=free_trial)


@routes.route('/changeMark', methods=['POST'])
@login_required
@check_confirmed
@teacher_only
def change_mark():
    """
    Changes the mark for a given quiz
    Expects {'takeId': int, 'totalMark': int, 'markArray': int}
    :return: {success: True} if successful otherwise an error object
    """
    if not request.json:
        return abort(400)

    data = request.json  # Data from client
    take_id, mark_array = data['takeId'], data['markArray']

    if not isinstance(take_id, int) or not isinstance(mark_array, list):
        # If any data is wrong format return error JSON
        return jsonify(error="one or more invalid data points")
    takes = Takes.query.get(take_id)  # takes object to update
    # Check if the test of the take is in the class that the account is teaching
    test = Test.query.get(takes.TEST)  # Test that takes is apart of
    question_array = eval(test.question_list)  # List of questions in the test
    if not teaches_class(test.CLASS):
        # If User does not teach class return error JSON
        return jsonify(error="User does not teach this class")
    del test
    question = Question.query.filter(Question.QUESTION.in_(question_array)).all()  # Questions in test
    takes_marks_array = eval(takes.marks)
    new_mark = 0
    if len(takes_marks_array) == len(mark_array):
        # If the length of the test are the same compare each question
        for i in range(len(takes_marks_array)):
            # For each question compare the parts match
            if not len(takes_marks_array[i]) == len(mark_array[i]):
                # If the length of parts are different return error JSON
                return jsonify(error="Non matching marks")
            else:
                # else calculate the total mark and per question mark
                question_mark = 0  # Mark of the current question
                for j in range(len(mark_array[i])):
                    # For each part add up total and compare to question in database
                    question_mark += mark_array[i][j]
                if question[i].total < question_mark:
                    # If the new total is greater then question total return error JSON
                    return jsonify(error="Over 100% in a question")
                else:
                    # Else add the current question mark to total_mark
                    new_mark += question_mark

    # Update Data in Database
    takes.marks = str(mark_array)
    takes.grade = new_mark
    db.session.commit()
    return jsonify(success=True)


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
        AvoQuestion(string, 0, [])
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
    question_id, name = data['id'], data['name']
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
        AvoQuestion(string, 0, [])
    except:
        return jsonify(error="Question could not be created")
    # Update data for database
    question.string = string
    question.answers = answers
    question.total = total

    db.session.commit()
    return jsonify(code="Question updated")


@routes.route('/getAllQuestions', methods=['GET'])
@login_required
@check_confirmed
@admin_only
def get_all_questions():
    """
    Gets all questions in the database and returns
    :return: List of all questions
    """
    question_list = Question.query.all()
    question_array = []
    for q in question_list:
        question_array.append(
            {
                'QUESTION': q.QUESTION,
                'SET': q.SET,
                'name': q.name,
                'string': q.string,
                'answers': q.answers,
                'total': q.total
            }
        )
    return jsonify(questions=question_array)


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
    seed = data['seed']
    if 'answers' in data:
        # If answers were provided then test answers
        answers = data['answers']  # answers from client
        if not isinstance(string, str) or not isinstance(seed, int) or not isinstance(answers, list):
            # Checks if all data given is of correct type if not return error JSON
            return jsonify(error="One or more data is not correct")
        try:
            # Try to create and mark the question if it fails return error JSON
            q = AvoQuestion(string, seed, answers)
        except Exception as e:
            return jsonify(error="Question failed to be created", message=str(e))
        return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types, points=q.scores)
    else:
        # if no answers were provided make false answers
        if not isinstance(string, str) or not isinstance(seed, int):
            # Checks if all data given is of correct type if not return error JSON
            return jsonify(error="One or more data is not correct")
        try:
            # Try to create and mark the question if fails return error JSON
            q = AvoQuestion(string, seed, [])
        except Exception as e:
            return jsonify(error="Question failed to be created", message=str(e))
        var_list = {}
        if isinstance(q.var_list, list):
            for i in range(len(q.var_list)):
                var_list['$' + str(i+1)] = repr(q.var_list[i])
        else:
            for k in q.var_list:
                var_list[k] = repr(q.var_list[k])
        return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types, explanation=q.explanation, variables=var_list)


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
        questions_in_test = Question.query.filter(Question.QUESTION.in_(question_ids)).all()   # All questions in test
        for i in range(len(question_ids)):
            # For each question id get the question data and add to question list
            q = AvoQuestion(questions_in_test[i].string, seeds[i])
            questions.append({'prompt': q.prompt, 'prompts': q.prompts, 'types': q.types})
        return jsonify(
            takes=takes.TAKES,
            timer=timer,
            time_submitted=takes.time_submitted,
            answers=eval(takes.answers),
            questions=questions,
            deadline=test.deadline  # if it's unlimited time then we need deadline
        )
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
    seeds = list(map(lambda seed: randint(0, 65535) if seed == -1 else seed, eval(x.seed_list)))  # Generates seeds of test
    answer_list = []  # Answers of takes instance
    marks_list = []  # Marks of takes instance
    questions_in_test = Question.query.filter(Question.QUESTION.in_(test_question_list)).all()  # Questions in test
    for i in range(len(test_question_list)):
        # For each question in test add in mark values per question
        q = questions_in_test[i]  # Current question
        marks_list.append([0] * len(AvoQuestion(q.string, 0, []).totals))
        answer_list.append([''] * q.answers)
    # We want to figure out what the new time should be
    t = datetime.now()  # Get current time
    if x.timer == -1:  # CASE 1: We have unlimited time selected, so the deadline is 100 years from now
        time2 = min(t + timedelta(minutes=52560000), x.deadline) # Time submitted based off timer
    else:  # CASE 2: We have a limited amount of time so figure out when the end date and time should be
        time2 = min(t + timedelta(minutes=x.timer), x.deadline) # Time submitted based off timer

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
    questions = Question.query.filter(Question.QUESTION.in_(question_list)).all()  # All question in test
    for i in range(len(question_list)):
        # For each question calculate the mark and add to the total
        current_question = questions[i]  # Get the current question from the database
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
    data = request.json  # Data from client
    test, timer, name, deadline, attempts = data['test'], data['timer'], data['name'], data['deadline'], data['attempts']
    if not isinstance(test, int):
        return jsonify(error="Invalid Input: Test needs to be an int, Test is " + str(type(test)))
    if not isinstance(timer, int):
        return jsonify(error="Invalid Input: Timer needs to be an int, " + str(type(timer)))
    if not isinstance(name, str):
        return jsonify(error="Invalid Input: Name needs to be an int, " + str(type(name)))
    if not isinstance(deadline, str):
        return jsonify(error="Invalid Input: Deadline needs to be a str, Deadline is type: " + str(type(deadline)))
    if not isinstance(attempts, int):
        return jsonify(error="Invalid Input: Attempts needs to be an int, " + str(type(attempts)))
    deadline = deadline[0:4] + "-" + deadline[4:6] + "-" + deadline[6:8] + ' ' + deadline[8:10] + ':' + deadline[10:]
    deadline = datetime.strptime(str(deadline), '%Y-%m-%d %H:%M')
    test = Test.query.get(test)  # Gets the test object
    if not teaches_class(test.CLASS):
        # If the teacher doesn't teach the class the test is in return error
        return jsonify(error="User does not teach class")

    # Updates Test data
    test.deadline = deadline
    test.timer = timer
    test.name = name
    test.attempts = attempts

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
    if takes_list.time_submitted < datetime.now():
        return jsonify(error="Test time has passed")
    test = Test.query.get(takes_list.TEST)  # Test of that instance of takes
    question_id = eval(test.question_list)[question]  # List of question IDs from test
    current_question = Question.query.get(question_id)  # Current question being modified
    # Update the question mark and answer in the takes instance
    answers = eval(takes_list.answers)
    answers[question] = answer
    takes_list.answers = str(answers)
    db.session.commit()
    q = AvoQuestion(current_question.string, eval(takes_list.seeds)[question], answer)
    marks = eval(takes_list.marks)
    marks[question] = q.scores
    # Update with new values and commit to DataBase
    takes_list.marks = str(marks)
    takes_list.grade = sum(map(lambda x: sum(x), marks))
    db.session.commit()
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
    time = datetime.now()
    if test.deadline < time:
        # If test deadline has passed close test return error JSON
        return jsonify(error="Test deadline has passed")
    if current_takes.time_submitted < time:
        return jsonify(error="Test already has been submitted")
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
        if datetime.now() <= takes_list.time_submitted:
            return jsonify(error="Test not submitted yet")
        questions = eval(test.question_list)
        question_list = []
        question_objects_in_test = Question.query.filter(Question.QUESTION.in_(questions)).all()  # Questions in test
        for i in range(len(questions)):
            # For each question mark question with answer and add to list then return
            current_question = question_objects_in_test[i]
            q = AvoQuestion(current_question.string, seeds[i], answers[i])
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


@routes.route('/pay', methods=['POST'])
@login_required
@check_confirmed
@student_only
def create_payment():
    """
    Creates PayPal payment in the database for enrolling user in class
    :return: Transaction ID to the client side PayPal
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)

    # Data from the client
    data = request.json
    class_id = data['classID']
    if not isinstance(class_id, int):
        # If data is not correct formatting return error JSON
        return jsonify(error="One or more data is not correct")

    existing_tid = TransactionProcessing.query.filter((class_id == TransactionProcessing.CLASS) &
                                                      (current_user.USER == TransactionProcessing.USER)).first()
    if existing_tid is not None:
        # If the user has already tried the payment find payment and return
        try:
            # Try to find payment from PayPal
            payment = paypalrestsdk.Payment.find(existing_tid.TRANSACTIONPROCESSING)
            if payment.state == 'created':
                # iF payment is found return Transaction ID
                return jsonify({'tid': existing_tid.TRANSACTIONPROCESSING})
            else:
                # Else remove payment from database
                db.session.remove(existing_tid)
                db.session.commit()
        except paypalrestsdk.ResourceNotFound:
            # If error is found remove from database
            db.session.remove(existing_tid)
            db.session.commit()

    current_class = Class.query.filter(class_id == Class.CLASS).all()  # Get class

    if len(current_class) is 0:
        # If class is not found return error JSON
        return jsonify(error="No class found")

    if enrolled_in_class(current_class[0].CLASS):
        # If user is already enrolled return error JSON
        return jsonify(error="User Already In Class")

    # Create Payment with PayPal
    payment = paypalrestsdk.Payment(
        {
            'intent': 'sale',
            'payer': {
                'payment_method': 'paypal'
            },
            'redirect_urls': {
                # todo have to enable auto return in the paypal account
                'return_url': 'http://' + config.HOSTNAME + '/',
                # todo when cancelled remove tid from mapping table
                'cancel_url': 'http://' + config.HOSTNAME + '/'
            },
            'transactions': [
                {
                    'amount': {
                        'total': "{:10.2f}".format(round(current_class[0].price_discount * 1.13, 2)),
                        'currency': 'CAD'
                    },
                    'description': "Description that actually describes the product, don't flake on this because"
                                   'it can be used against us for charge back cases.',
                    'item_list': {
                        'items': [
                            {
                                'name': 'Avo ' + current_class[0].name,
                                'price': "{:10.2f}".format(round(current_class[0].price_discount * 1.13, 2)),
                                'currency': 'CAD',
                                'quantity': 1
                            }
                        ]
                    }
                }
            ]
        }
    )

    if payment.create():
        # If Payment created create new transaction in database and return Transaction ID
        new_transaction = TransactionProcessing(payment.id, current_class[0].CLASS, current_user.USER)
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({'tid': payment.id})
    else:
        # If PayPal encounters error return error JSON
        return jsonify(error='Unable to create payment')


@routes.route('/postPay', methods=['POST'])
@login_required
@check_confirmed
@student_only
def confirm_payment():
    """
    If user pays then enroll them in class
    :return: confirmation of payment being processed
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)

    # Data from client
    data = request.json
    tid, payer = data['tid'], data['payerID']
    if not isinstance(tid, str) or not isinstance(payer, str):
        # If data isn't correct return error JSON
        return jsonify(error="One or more data is not correct")

    transaction = Transaction.query.get(tid)  # Attempt to get transaction from the Transaction ID
    if transaction is not None:
        # If transaction not found return error JSON
        return jsonify("User Already Enrolled")
    payment = paypalrestsdk.Payment.find(tid)  # Find payment from PayPal
    if not payment.execute({'payer_id': payer}):
        # If payment cant be processed return error JSON
        return jsonify(error=payment.error)
    transaction_processing = TransactionProcessing.query.get(tid)  # find transaction in transaction processing table
    if transaction_processing is None:
        # If not found return error JSON
        return jsonify(error="No Trans Id Found")
    time = datetime.now() + timedelta(weeks=32)  # Create expiration of enrolling
    transaction = Transaction(tid, current_user.USER,
                              transaction_processing.CLASS, time)  # Create new transaction in table
    # commit changes to database
    db.session.add(transaction)
    db.session.delete(transaction_processing)
    if not enrolled_in_class(transaction_processing.CLASS):
        # If current user user not enrolled in class enroll them in class
        enrolled_relation = Class.query.get(transaction_processing.CLASS)
        current_user.CLASS_ENROLLED_RELATION.append(enrolled_relation)
    db.session.commit()
    return jsonify(code="Processed")


@routes.route('/cancel', methods=['POST'])
def cancel_order():
    """
    Cancel Payment by removing from Transaction Processing Table
    :return: Confirmation
    """
    if not request.json:
        # If the request is not JSON return a 400 error
        return abort(400)

    tid = request.json['tid']  # Data from client
    transaction_processing = TransactionProcessing.query.get(tid)
    if transaction_processing is None:
        # If transaction is not in database return error json
        return jsonify(error="Transaction not found")

    # Remove data from database
    db.session.delete(transaction_processing)
    db.session.commit()
    return jsonify(code="Cancelled")


@routes.route('/freeTrial', methods=['POST'])
@login_required
@check_confirmed
@student_only
def free_trial():
    """
    Generate free trial for class
    :return:  Confirmation of free trial
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)

    # Data from client
    data = request.json
    class_id = data['classID']
    if not isinstance(class_id, int):
        # If data isn't correct return error JSON
        return jsonify(error="One or more data is not correct")
    try:
        # See if current class exists
        current_class = Class.query.get(class_id)
    except:
        return jsonify(error="No class found")
    if current_class is None:
        return jsonify(error="No class found")
    transaction = Transaction.query.filter((current_user.USER == Transaction.USER) &
                                           (current_class.CLASS == Transaction.CLASS)).all()  # Get transaction
    if len(transaction) > 0:
        # If transaction not found return error JSON
        return jsonify(error="Free Trial Already Taken")
    free_trial_string = "FREETRIAL-" + str(current_class.CLASS) \
                        + "-" + str(current_user.USER)  # Generate free trial string
    time = datetime.now() + timedelta(weeks=2)
    new_transaction = Transaction(free_trial_string, current_user.USER,
                                  current_class.CLASS, time)  # create new transaction in database
    # Commit to database and enroll student
    db.session.add(new_transaction)
    current_user.CLASS_ENROLLED_RELATION.append(current_class)
    db.session.commit()
    return jsonify(code="Success")


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

    if request.headers['X-Gitlab-Token'] != config.SHUTDOWN_TOKEN:
        return abort(400)

    content = request.get_json()
    ref = content.get('ref').split('/')
    request_branch = ref[len(ref) - 1]
    # sys.exit(4) is the specific exit code number needed to exit gunicorn
    if branch == request_branch:
        sys.exit(4)
    else:
        return abort(400)
