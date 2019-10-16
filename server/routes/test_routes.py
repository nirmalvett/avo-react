import statistics
from datetime import datetime

from flask import Blueprint, jsonify

from server.auth import SectionRelations
from server.decorators import login_required, teacher_only, validate
from server.helpers import from_timestamp
from server.models import db, Test, Takes, Question, User, Section, UserSectionType, UserSection

TestRoutes = Blueprint('TestRoutes', __name__)


# Creating tests, managing existing tests


@TestRoutes.route('/saveTest', methods=['POST'])
@teacher_only
@validate(
    sectionID=int, name=str, openTime=[int], deadline=int,
    timer=int, attempts=int, questionList=list, seedList=list
)
def save_test(
        section_id: int, name: str, open_time, deadline: int,
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
    elif UserSectionType.TEACHER not in SectionRelations(section_id).active:
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
    test = Test(section_id, name, False, open_time, deadline, timer, attempts, str(question_list), str(seed_list), total)
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
        test.open_time = datetime.now()
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
        test.deadline = datetime.now()
        db.session.commit()
        return jsonify({})
    else:
        return jsonify(error="User doesn't teach this class")


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
