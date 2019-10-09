from flask import Blueprint, jsonify, request
from flask_login import current_user

from server.MathCode.question import AvoQuestion
from random import randint
from datetime import datetime, timedelta
import statistics

from server.decorators import login_required, teacher_only, validate
from server.auth import SectionRelations
from server.helpers import timestamp, from_timestamp
from server.models import db, Test, Takes, Question, User, DataStore, Section, UserSectionType, UserSection

TestRoutes = Blueprint('TestRoutes', __name__)


# Creating tests, managing existing tests


@TestRoutes.route('/saveTest', methods=['POST'])
@teacher_only
@validate(
    classID=int, name=str, openTime=[int], deadline=int,
    timer=int, attempts=int, questionList=list, seedList=list
)
def save_test(
        class_id: int, name: str, open_time, deadline: int,
        timer: int, attempts: int, question_list: list, seed_list: list
):
    """
    Save a test created by teacher
    :return: The new test
    """
    if timer < -1:
        return jsonify(error="timer can not be negative time")
    elif attempts < -1:
        return jsonify(error="the number of attempts can not be negative")
    elif UserSectionType.TEACHER not in SectionRelations(class_id).active:
        return jsonify(error="User doesn't teach this class")
    elif len(question_list) == 0:
        return jsonify(error="Can't submit a test with zero questions")
    deadline = from_timestamp(deadline)
    open_time = from_timestamp(open_time)
    if open_time is not None and open_time >= deadline:
        return jsonify(error="Deadline must be after the automatic open time."
                             " Please adjust the test settings and try again.")
    total = 0  # Total the test is out of

    questions = Question.query.filter(Question.QUESTION.in_(question_list)).all()  # All question in test
    for q in question_list:
        # For each question calculate the mark and add to the total
        # Get the current question from the database
        current_question = next((x for x in questions if x.QUESTION == q), None)
        if current_question is None:
            return jsonify(error="Question Not Found")
        total += current_question.total
    test = Test(class_id, name, False, open_time, deadline, timer, attempts, str(question_list), str(seed_list), total)
    db.session.add(test)
    db.session.commit()
    return jsonify(testID=test.TEST)


@TestRoutes.route('/changeTest', methods=['POST'])
@teacher_only
@validate(testID=int, timer=int, name=str, openTime=[int], deadline=int, attempts=int)
def change_test(test_id: int, timer: int, name: str, open_time: str, deadline: str, attempts: int):
    """
    Changes the Deadline Timer and Name of specified test
    :return: Confirmation that data has been updated
    """
    deadline = from_timestamp(deadline)
    if attempts < -1:
        return jsonify(error="Number of attempts can not be negative")
    if timer < -1:
        return jsonify(error="Timer can not be negative")
    open_time = from_timestamp(open_time)
    if open_time is not None and open_time >= deadline:
        return jsonify(error="open time is past the deadline")
    test = Test.query.get(test_id)
    if UserSectionType.TEACHER not in SectionRelations(test.SECTION).active:
        return jsonify(error="User does not teach class")

    # Updates Test data
    test.open_time = open_time
    test.deadline = deadline
    test.timer = timer
    test.name = name
    test.attempts = attempts

    db.session.commit()
    return jsonify({})


@TestRoutes.route('/deleteTest', methods=['POST'])
@teacher_only
@validate(testID=int)
def delete_test(test_id: int):
    """
    Delete Test
    :return: Confirmation that test has been deleted
    """
    test = Test.query.get(test_id)  # Get the test
    if test is None:
        # If test isn't found return error JSON else set class to none and return
        return jsonify(error='No Test Found')
    if UserSectionType.TEACHER in SectionRelations(test.SECTION).active:
        test.SECTION = None
        db.session.commit()
        return jsonify({})
    else:
        return jsonify(error="User doesn't teach this class")


@TestRoutes.route('/openTest', methods=['POST'])
@teacher_only
@validate(testID=int)
def open_test(test_id: int):
    """
    Open a test to be taken
    :return: Confirmation that it is open
    """
    test = Test.query.get(test_id)  # Get the test
    if test is None:
        # If test cant be found return error json if not set to open and return
        return jsonify(error='No Test Found')
    if UserSectionType.TEACHER in SectionRelations(test.SECTION).active:
        # If the user teaches the class the test is in open it
        if test.deadline < datetime.now():
            return jsonify(error="Deadline has already passed test can't be opened")
        test.is_open = True
        db.session.commit()
        return jsonify({})
    else:
        return jsonify(error="User doesn't teach this class")


@TestRoutes.route('/closeTest', methods=['POST'])
@teacher_only
@validate(testID=int)
def close_test(test_id: int):
    """
    Close selected test
    :return: Confirmation that test is closed
    """
    test = Test.query.get(test_id)  # Get the test
    if test is None:
        # If test doesn't exist then return error JSON if not close test and return
        return jsonify(error='No test found')
    if UserSectionType.TEACHER in SectionRelations(test.SECTION).active:
        # If the user teaches the class the test is in close it
        test.is_open = False
        db.session.commit()
        return jsonify({})
    else:
        return jsonify(error="User doesn't teach this class")


# Taking a test


@TestRoutes.route('/getTest', methods=['POST'])
@login_required
@validate(testID=int)
def get_test(test_id: int):
    """
    Get test data for client
    :return: Data of test
    """
    test = Test.query.get(test_id)  # Test requested
    if test is None:
        # If no test found return error json
        return jsonify(error='Test not found')
    if SectionRelations(test.SECTION).active:
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
        store_questions = []
        store_answers = []
        for i in range(len(question_ids)):
            # For each question id get the question data and add to question list
            current_question = next((x for x in questions_in_test if x.QUESTION == question_ids[i]), None)
            store_questions.append(current_question.string)
            store_answers.append(current_question.answers)
            q = AvoQuestion(current_question.string, seeds[i])
            questions.append({'prompt': q.prompt, 'prompts': q.prompts, 'types': q.types})
        tests_before = Takes.query.filter(
            (current_user.USER == Takes.USER)
        ).count()
        current_tests_before = Takes.query.filter(
            ((current_user.USER == Takes.USER) & (test.TEST == Takes.TEST))
        ).count()
        store = DataStore(current_user.get_id(), {
            'takes': takes.TAKES,
            'time_started': takes.time_started.timestamp(),
            'time_submitted': takes.time_submitted.timestamp(),
            'answers': takes.answers,
            'questions': store_questions,
            'total_answers': store_answers,
            'seeds': takes.seeds,
            'ip': get_ip(),
            'test': takes.TEST,
            'marks': takes.marks,
            'grade': takes.grade,
            'tests_done_before': tests_before,
            'current_tests_done_before': current_tests_before
        }, 'GET_TEST')
        db.session.add(store)
        db.session.commit()
        return jsonify(
            takes=takes.TAKES,
            time_submitted=timestamp(takes.time_submitted),
            answers=eval(takes.answers),
            questions=questions
        )
    elif not SectionRelations(test.SECTION).active:
        return jsonify(error="User doesn't have access to that section")
    else:
        return jsonify(error="Free Trial Expired")


@TestRoutes.route('/saveAnswer', methods=['POST'])
@login_required
@validate(takesID=int, question=int, answer=list)
def save_answer(takes_id: int, question: int, answer: list):
    """
    Save a users answer to a question
    :return: Confirmation that the question has been saved
    """
    takes = Takes.query.get(takes_id)  # Instance of takes to add answer to
    if takes is None:
        return jsonify(error='Invalid takes record')
    if takes.USER != current_user.USER:
        return jsonify(error='User does not own takes record')
    if takes.time_submitted < datetime.now():
        return jsonify(error="deadline has passed")
    test = Test.query.get(takes.TEST)  # Test of that instance of takes
    question_id = eval(test.question_list)[question]  # List of question IDs from test
    current_question = Question.query.get(question_id)  # Current question being modified
    # Update the question mark and answer in the takes instance
    answers = eval(takes.answers)
    answers[question] = answer
    takes.answers = str(answers)
    db.session.commit()
    try:
        q = AvoQuestion(current_question.string, eval(takes.seeds)[question], answer)
        marks = eval(takes.marks)
        marks[question] = q.scores
        # Update with new values and commit to DataBase
        takes.marks = str(marks)
        takes.grade = sum(map(lambda x: sum(x), marks))
        db.session.commit()
    except:
        print(f'unable to change mark for takes {takes.TAKES}')
        return jsonify(message='answer saved, but an error occurred while grading')
    tests_before = Takes.query.filter(
        (current_user.USER == Takes.USER)
    ).count()
    current_tests_before = Takes.query.filter(
        ((current_user.USER == Takes.USER) & (test.TEST == Takes.TEST))
    ).count()
    store = DataStore(current_user.get_id(), {
        'takes': takes_id,
        'time_started': takes.time_started.timestamp(),
        'time_submitted': takes.time_submitted.timestamp(),
        'question': current_question.string,
        'total_answers': current_question.answers,
        'total': current_question.total,
        'seed': eval(takes.seeds)[question],
        'answer': answer,
        'marks': takes.marks,
        'grade': takes.grade,
        'ip': get_ip(),
        'test': takes.TEST,
        'tests_done_before': tests_before,
        'current_tests_done_before': current_tests_before
    }, 'SAVE_ANSWER')
    db.session.add(store)
    db.session.commit()
    return jsonify(message='answer saved')


@TestRoutes.route('/submitTest', methods=['POST'])
@login_required
@validate(takesID=int)
def submit_test(takes_id: int):
    """
    Submit a takes to the DataBase
    :return: Confirmation that the takes has been updated
    """
    # Get current takes and update submit time and commit to DataBase
    takes = Takes.query.get(takes_id)
    test = Test.query.get(takes.TEST)
    time = datetime.now()
    if test.deadline + timedelta(seconds=60) < time:
        # If test deadline has passed close test return error JSON
        return jsonify(error="Test deadline has passed")
    if (takes.time_submitted + timedelta(seconds=60)) < time:
        return jsonify(error="Test already has been submitted")
    takes.time_submitted = datetime.now() - timedelta(seconds=1)
    db.session.commit()

    test = Test.query.get(takes.TEST)
    question_ids = eval(test.question_list)
    questions_in_test = Question.query.filter(Question.QUESTION.in_(question_ids)).all()

    store_questions = []
    store_answers = []
    for i in range(len(question_ids)):
        # For each question id get the question data and add to question list
        current_question = next((x for x in questions_in_test if x.QUESTION == question_ids[i]), None)
        store_questions.append(current_question.string)
        store_answers.append(current_question.answers)
    tests_before = Takes.query.filter(
        (current_user.USER == Takes.USER)
    ).count()
    current_tests_before = Takes.query.filter(
        ((current_user.USER == Takes.USER) & (test.TEST == Takes.TEST))
    ).count()
    store = DataStore(current_user.get_id(), {
        'takes': takes.TAKES,
        'time_started': takes.time_started.timestamp(),
        'time_submitted': takes.time_submitted.timestamp(),
        'answers': takes.answers,
        'questions': store_questions,
        'total_answers': store_answers,
        'seeds': takes.seeds,
        'ip': get_ip(),
        'test': takes.TEST,
        'marks': takes.marks,
        'grade': takes.grade,
        'tests_done_before': tests_before,
        'current_tests_done_before': current_tests_before
    }, 'SUBMIT_TEST')
    db.session.add(store)
    db.session.commit()
    return jsonify({})


# Reviewing results of a test


@TestRoutes.route('/postTest', methods=['POST'])
@login_required
@validate(takesID=int)
def post_test(takes_id: int):
    """
    Generate the post test screen
    :return: The post test screen data
    """
    takes = Takes.query.get(takes_id)  # Get current instance of takes
    if takes is None:
        # If takes cant be found return error JSON
        return jsonify(error='No takes record with that ID')
    # Get data from takes and get test from takes
    marks, answers, seeds, = eval(takes.marks), eval(takes.answers), eval(takes.seeds)
    test = Test.query.get(takes.TEST)
    if SectionRelations(test.SECTION).active:
        if datetime.now() <= takes.time_submitted:
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
@validate(testID=int)
def test_stats(test_id: int):
    """
    Generate Stats on a per Question basis of a given test
    :return: Test stats data
    """
    test = Test.query.get(test_id)  # Test to generate questions from
    # If the user doesnt teach the class then return error JSON
    if not SectionRelations(test.SECTION).active:
        return jsonify(error="User doesn't teach this class or the user is not enrolled in the class")
    # All students in the class
    students = User.query.filter(
        (User.USER == UserSection.USER) &
        (test.SECTION == UserSection.SECTION) &
        (UserSection.user_type != UserSectionType.TEACHER)
    ).all()
    current_section = Section.query.get(test.SECTION)
    test_marks_total = []  # List of test marks
    question_marks = []  # 2D array with first being student second being question mark

    for s in range(len(students)):
        # For each student get best takes and add to test_marks array
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
@validate(takesID=int, markArray=list)
def change_mark(takes_id: int, mark_array: list):
    """
    Changes the mark for a given quiz
    Expects {'takeId': int, 'totalMark': int, 'markArray': int}
    :return: {success: True} if successful otherwise an error object
    """
    takes = Takes.query.get(takes_id)  # takes object to update
    # Check if the test of the take is in the class that the account is teaching
    test = Test.query.get(takes.TEST)  # Test that takes is apart of
    question_array = eval(test.question_list)  # List of questions in the test
    if UserSectionType.TEACHER not in SectionRelations(test.SECTION).active:
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


def get_ip():
    if 'HTTP_X_FORWARDED_FOR' in request.headers:
        return request.headers['HTTP_X_FORWARDED_FOR']
    else:
        return request.remote_addr
