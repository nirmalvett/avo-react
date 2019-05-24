from flask import Blueprint, jsonify, request, abort
from flask_login import current_user

from server.MathCode.question import AvoQuestion
from random import randint
from datetime import datetime, timedelta
import statistics

from server.decorators import login_required, teacher_only
from server.auth import teaches_class, enrolled_in_class, access_to_class
from server.models import db, Class, Test, Takes, Question, User, Transaction

TestRoutes = Blueprint('TestRoutes', __name__)


# Creating tests, managing existing tests


@TestRoutes.route('/saveTest', methods=['POST'])
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
    class_id, name, open_time, deadline, timer, attempts, question_list, seed_list = \
        data['classID'], data['name'], data['openTime'], data['deadline'], data['timer'], data['attempts'], data['questionList'],\
        data['seedList']  # Data from the client
    if not isinstance(class_id, int) or not isinstance(name, str) or not (
            isinstance(open_time, str) or open_time is None) or not isinstance(deadline, str) or not \
            isinstance(timer, str) or not isinstance(attempts, str) or not isinstance(question_list, list) or not \
            isinstance(seed_list, list):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    if not teaches_class(class_id):
        return jsonify(error="User doesn't teach this class")
    if len(question_list) == 0:
        return jsonify(error="Can't Submit A Test WIth Zero Questions")
    deadline = deadline[0:4] + "-" + deadline[4:6] + "-" + deadline[6:8] + ' ' + deadline[8:10] + ':' + deadline[10:]
    deadline = datetime.strptime(str(deadline), '%Y-%m-%d %H:%M')
    if open_time is not None:
        # If there is an open time format it to a datetime
        open_time = open_time[0:4] + "-" + open_time[4:6] + "-" + open_time[6:8] + ' ' \
                    + open_time[8:10] + ':' + open_time[10:]
        open_time = datetime.strptime(str(open_time), '%Y-%m-%d %H:%M')
        if open_time >= deadline:
            # The deadline is before the open time
            return jsonify(error="open time is past the deadline")
    total = 0  # Total the test is out of

    questions = Question.query.filter(Question.QUESTION.in_(question_list)).all()  # All question in test
    for i in range(len(question_list)):
        # For each question calculate the mark and add to the total
        # Get the current question from the database
        current_question = next((x for x in questions if x.QUESTION == question_list[i]), None)
        if current_question is None:
            return jsonify(error="Question Not Found PLease Try Again")
        total += current_question.total
    # Add the test to the database
    test = Test(class_id, name, False, open_time, deadline, int(timer), int(attempts), str(question_list), str(seed_list), total)
    db.session.add(test)
    db.session.commit()
    return jsonify(test=test.TEST)


@TestRoutes.route('/changeTest', methods=['POST'])
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
    test, timer, name, open_time, deadline, attempts =\
        data['test'], data['timer'], data['name'], data['openTime'], data['deadline'], data['attempts']
    if not isinstance(test, int):
        return jsonify(error="Invalid Input: Test needs to be an int, Test is " + str(type(test)))
    if not isinstance(timer, int):
        return jsonify(error="Invalid Input: Timer needs to be an int, " + str(type(timer)))
    if not isinstance(name, str):
        return jsonify(error="Invalid Input: Name needs to be an int, " + str(type(name)))
    if not (isinstance(open_time, str) or open_time is None):
        return jsonify(error="Invalid Input: open_time needs to be a str")
    if not isinstance(deadline, str):
        return jsonify(error="Invalid Input: Deadline needs to be a str, Deadline is type: " + str(type(deadline)))
    if not isinstance(attempts, int):
        return jsonify(error="Invalid Input: Attempts needs to be an int, " + str(type(attempts)))
    deadline = deadline[0:4] + "-" + deadline[4:6] + "-" + deadline[6:8] + ' ' + deadline[8:10] + ':' + deadline[10:]
    deadline = datetime.strptime(str(deadline), '%Y-%m-%d %H:%M')
    if open_time is not None:
        open_time = open_time[0:4] + "-" + open_time[4:6] + "-" + open_time[6:8] + ' ' \
                    + open_time[8:10] + ':' + open_time[10:]
        open_time = datetime.strptime(str(open_time), '%Y-%m-%d %H:%M')
        if open_time >= deadline:
            # The deadline is before the open time
            return jsonify(error="open time is past the deadline")
    test = Test.query.get(test)  # Gets the test object
    if not teaches_class(test.CLASS):
        # If the teacher doesn't teach the class the test is in return error
        return jsonify(error="User does not teach class")

    # Updates Test data
    test.open_time = open_time
    test.deadline = deadline
    test.timer = timer
    test.name = name
    test.attempts = attempts

    db.session.commit()
    return jsonify(code="Test Updated")


@TestRoutes.route('/deleteTest', methods=['POST'])
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


@TestRoutes.route('/openTest', methods=['POST'])
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


@TestRoutes.route('/closeTest', methods=['POST'])
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
    current_test = Test.query.get(test)  # Get the test
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


# Taking a test


@TestRoutes.route('/getTest', methods=['POST'])
@login_required
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
    if teaches_class(test.CLASS) or access_to_class(test.CLASS):
        if test.is_open is False:
            # If test is not open then return error JSON
            return jsonify(error='This set of questions has not been opened by your instructor yet')
        if test.deadline < datetime.now():
            # If deadline has passed return error JSON
            return jsonify(error='The deadline has passed for this test')
        takes = Takes.query.filter(
            (Takes.TEST == test.TEST) & (current_user.USER == Takes.USER) & (Takes.time_submitted > datetime.now())
        ).first()  # Get the most current takes
        if takes is None:
            # If student has not taken the test create a takes instance
            takes = create_takes(test_id, current_user.get_id())
            if takes is None:
                # If takes still fails return error JSON
                return jsonify(error="Couldn't start test")
        questions = []  # Questions in test
        question_ids = eval(test.question_list)  # IDs of questions in test
        seeds = eval(takes.seeds)  # Seeds of questions in test if -1 gen random seed
        questions_in_test = Question.query.filter(Question.QUESTION.in_(question_ids)).all()  # All questions in test
        for i in range(len(question_ids)):
            # For each question id get the question data and add to question list
            current_question = next((x for x in questions_in_test if x.QUESTION == question_ids[i]), None)
            q = AvoQuestion(current_question.string, seeds[i])
            questions.append({'prompt': q.prompt, 'prompts': q.prompts, 'types': q.types})
        return jsonify(
            takes=takes.TAKES,
            time_submitted=int(takes.time_submitted.timestamp()*1000),
            answers=eval(takes.answers),
            questions=questions
        )
    else:
        if access_to_class(test.CLASS):
            return jsonify(error="User doesn't have access to that Class")
        return jsonify(error="Free Trial Expired")


@TestRoutes.route('/saveAnswer', methods=['POST'])
@login_required
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
    if takes_list is None or takes_list.USER != current_user.USER:
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


@TestRoutes.route('/submitTest', methods=['POST'])
@login_required
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
    if test.deadline + timedelta(seconds=60) < time:
        # If test deadline has passed close test return error JSON
        return jsonify(error="Test deadline has passed")
    if (current_takes.time_submitted + timedelta(seconds=60)) < time:
        return jsonify(error="Test already has been submitted")
    current_takes.time_submitted = datetime.now() - timedelta(seconds=1)
    db.session.commit()
    return jsonify(message='Submitted successfully!')


# Reviewing results of a test


@TestRoutes.route('/postTest', methods=['POST'])
@login_required
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
            current_question = next((x for x in question_objects_in_test if x.QUESTION == questions[i]), None)
            q = AvoQuestion(current_question.string, seeds[i], answers[i])
            question_list.append({'prompt': q.prompt, 'prompts': q.prompts, 'explanation': q.explanation,
                                  'types': q.types, 'answers': answers[i], 'totals': q.totals, 'scores': marks[i]})
        return jsonify(questions=question_list)
    else:
        return jsonify(error="User isn't in class")


@TestRoutes.route('/testStats', methods=['POST'])
@login_required
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
    # All students in the class
    students = User.query.filter((User.USER == Transaction.USER) & (test.CLASS == Transaction.CLASS)).all()
    current_class = Class.query.get(test.CLASS)
    test_marks_total = []  # List of test marks
    question_marks = []  # 2D array with first being student second being question mark

    for s in range(len(students)):
        # For each student get best takes and add to test_marks array
        if students[s].USER != current_class.USER:
            takes = Takes.query.order_by(Takes.grade).filter(
                (Takes.TEST == test.TEST) & (Takes.USER == students[s].USER)).all()  # Get current students takes
            if len(takes) != 0:
                # If the student has taken the test get best takes and add to the array of marks
                takes = takes[len(takes) - 1]  # Get best takes instance
                test_marks_total.append(takes.grade)
                question_marks.append(eval(takes.marks))  # append the mark array to the student mark array
                del takes
    del students
    question_total_marks = []  # Each students mark per question

    if len(question_marks) == 0:
        # If none has taken the test return default values
        test_questions = eval(test.question_list)  # List of questions in test
        test_question_marks = []
        question = Question.query.filter(Question.QUESTION.in_(test_questions)).all()  # Get all questions in the tes
        for i in range(len(test_questions)):  # for each question in the test
            # for each question append the total
            current_question = next((x for x in question if x.QUESTION == test_questions[i]), 0)
            test_question_marks.append(
                {
                    'numberStudents': 0,
                    'questionMean': 0,
                    'questionMedian': 0,
                    'questionSTDEV': 0,
                    'questionMark': current_question.total,
                    'topMarksPerStudent': []
                }
            )
        return jsonify(numberStudents=0, testMean=0, testMedian=0, testSTDEV=0, questions=test_question_marks,
                       topMarkPerStudent=[], totalMark=[])

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
        current_question = next((x for x in question if x.QUESTION == test_questions[i]), 0)
        test_question_marks.append(current_question.total)
    question_analytics = []  # Array to return to client of analytics
    del test_questions

    for i in range(len(question_total_marks)):
        # For each question calculate mean median and standard deviation
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
    test_mean, test_median, test_st_dev = 0, 0, 0  # Overall test analytics
    if len(test_marks_total) != 0:
        test_mean = statistics.mean(test_marks_total)
        test_median = statistics.median(test_marks_total)
        if len(test_marks_total) > 1:
            test_st_dev = statistics.stdev(test_marks_total)
    return jsonify(
        numberStudents=len(test_marks_total), testMean=round(test_mean, 2), testMedian=round(test_median, 2),
        testSTDEV=round(test_st_dev, 2), questions=question_analytics, topMarkPerStudent=test_marks_total,
        totalMark=test.total
    )


@TestRoutes.route('/changeMark', methods=['POST'])
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


# Helpers


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
    # Get all instances of takes by that user from that test
    takes = Takes.query.filter((Takes.TEST == test) & (Takes.USER == user)).all()
    if x.attempts != -1 and len(takes) >= x.attempts:
        # If the user has taken more attempts then allowed return
        return
    test_question_list = eval(x.question_list)  # Question list of test
    # Generates seeds of test
    seeds = list(map(lambda seed: randint(0, 65535) if seed == -1 else seed, eval(x.seed_list)))
    answer_list = []  # Answers of takes instance
    marks_list = []  # Marks of takes instance
    questions_in_test = Question.query.filter(Question.QUESTION.in_(test_question_list)).all()  # Questions in test
    for i in range(len(test_question_list)):
        # For each question in test add in mark values per question
        q = next((x for x in questions_in_test if x.QUESTION == test_question_list[i]), None)  # Current question
        marks_list.append([0] * len(AvoQuestion(q.string, 0, []).totals))
        answer_list.append([''] * q.answers)
    # We want to figure out what the new time should be
    t = datetime.now()  # Get current time
    if x.timer == -1:  # CASE 1: We have unlimited time selected, so the deadline is 100 years from now
        time2 = x.deadline  # Time submitted based off timer
    else:  # CASE 2: We have a limited amount of time so figure out when the end date and time should be
        time2 = min(t + timedelta(minutes=x.timer), x.deadline)  # Time submitted based off timer

    # Add all data to takes object and add to database
    takes = Takes(test, user, t, time2, 0, str(marks_list), str(answer_list), str(seeds))
    db.session.add(takes)
    db.session.commit()
    return None if takes is None else takes
