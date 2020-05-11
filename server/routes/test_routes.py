from statistics import mean, median, stdev
from datetime import datetime
from typing import List, Dict

from flask import Blueprint, jsonify

from server.auth import SectionRelations
from server.decorators import login_required, teacher_only, validate
from server.helpers import from_timestamp, timestamp
from server.models import db, Test, Takes, Question, User, UserSectionType, UserSection

TestRoutes = Blueprint('TestRoutes', __name__)


# Creating tests, managing existing tests


@TestRoutes.route('/saveTest', methods=['POST'])
@teacher_only
@validate(
    sectionID=int, name=str, openTime=[int], deadline=int,
    timer=int, attempts=int, questionList=list, seedList=list,
    hideAnswersUntilDeadline=bool,
)
def save_test(
        section_id: int, name: str, open_time, deadline: int,
        timer: int, attempts: int, question_list: list, seed_list: list,
        hide_answers_until_deadline: bool,
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
    test = Test(
        section_id,
        name,
        False,
        open_time,
        deadline,
        timer,
        attempts,
        str(question_list),
        str(seed_list),
        total,
        hide_answers_until_deadline=hide_answers_until_deadline,
    )
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
        return jsonify(openTime=timestamp(test.open_time))
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
        return jsonify(deadline=timestamp(test.deadline))
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
    test: Test = Test.query.get(test_id)  # Test to generate questions from
    # If the user doesnt teach the class then return error JSON
    if not SectionRelations(test.SECTION).active:
        return jsonify(error="User doesn't teach this class or the user is not enrolled in the class")

    # Get all questions in the test
    test_questions: List[int] = eval(test.question_list)
    questions: List[Question] = Question.query.filter(Question.QUESTION.in_(test_questions)).all()
    questions.sort(key=lambda q: test_questions.index(q.QUESTION))
    del test_questions

    # All students in the class
    students: List[User] = User.query\
        .join(UserSection, User.USER == UserSection.USER)\
        .filter(
        (test.SECTION == UserSection.SECTION) &
        (UserSection.user_type != UserSectionType.TEACHER)
    ).all()
    student_ids = list(map(lambda x: x.USER, students))

    # All takes
    takes: List[Takes] = Takes.query.filter(
        (Takes.TEST == test_id) &
        (Takes.USER.in_(student_ids))
    ).all()

    top_takes_dict: Dict[int, Takes] = {}
    for t in takes:
        if t.USER not in top_takes_dict or top_takes_dict[t.USER].grade < t.grade:
            top_takes_dict[t.USER] = t
    top_takes: List[Takes] = list(top_takes_dict.values())
    del takes
    del top_takes_dict
    del students
    del student_ids

    all_marks: List[List[float]] = list(map(lambda x: eval(x.marks), top_takes))

    if not top_takes:  # if nobody has taken it, return zeroes
        return_questions = list(map(lambda q: {
            'mean': 0,
            'median': 0,
            'standardDeviation': 0,
            'total': q.total,
            'marks': [],
        }, questions))
    else:
        return_questions = []
        for i in range(len(questions)):
            question_grades = sorted(list(map(lambda x: sum(x[i]), all_marks)))  # sorting provides anonymity
            return_questions.append({
                'mean': mean(question_grades),
                'median': median(question_grades),
                'standardDeviation': stdev(question_grades) if len(question_grades) > 1 else 0,
                'total': questions[i].total,
                'marks': question_grades,
            })
    return jsonify(
        questions=return_questions,
        grades=sorted(list(map(lambda x: x.grade, top_takes)))  # sorting provides anonymity
    )
