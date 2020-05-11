from datetime import datetime, timedelta
from random import randint

from flask import Blueprint, jsonify, request
from flask_login import current_user

from server.MathCode.question import AvoQuestion
from server.auth import SectionRelations
from server.decorators import login_required, teacher_only, validate
from server.helpers import timestamp
from server.models import db, Test, Takes, Question, UserSectionType, DataStore
from server.question_helpers.answer_factory import get_prompt_prompts_types, answer_question, get_explanations

TakesRoutes = Blueprint('TakesRoutes', __name__)


@TakesRoutes.route('/getTest', methods=['POST'])
@login_required
@validate(testID=int)
def get_test(test_id: int):
    """
    Get test data for client
    :return: Data of test
    """
    test = Test.query.get(test_id)
    if test is None:
        return jsonify(error='Test not found')
    if not SectionRelations(test.SECTION).active:
        return jsonify(error='You do not have an active subscription to that section')
    if test.open_time is not None and test.open_time > datetime.now():
        return jsonify(error='This set of questions has not been opened by your instructor yet')
    if test.deadline < datetime.now():
        return jsonify(error='The deadline has passed for this test')
    takes = Takes.query.filter(
        (Takes.TEST == test.TEST) & (current_user.USER == Takes.USER) & (Takes.time_submitted > datetime.now())
    ).first()
    if takes is None:
        takes = create_takes(test, current_user.USER)
        if takes is None:
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
        # math
        if not current_question.config:
            q = AvoQuestion(current_question.string, seeds[i])
            questions.append({'prompt': q.prompt, 'prompts': q.prompts, 'types': q.types})
        # simple
        else:
            prompt, prompts, types = get_prompt_prompts_types(current_question)
            questions.append({'prompt': prompt, 'prompts': prompts, 'types': types})
    tests_before = Takes.query.filter(current_user.USER == Takes.USER).count()
    current_tests_before = Takes.query.filter(
        ((current_user.USER == Takes.USER) & (test.TEST == Takes.TEST))
    ).count()
    store = DataStore(current_user.USER, {
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


@TakesRoutes.route('/saveAnswer', methods=['POST'])
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
        # math
        if not current_question.config:
            q = AvoQuestion(current_question.string, eval(takes.seeds)[question], answer)
            marks = eval(takes.marks)
            marks[question] = q.scores
            # Update with new values and commit to DataBase
            takes.marks = str(marks)
            takes.grade = sum(map(lambda x: sum(x), marks))
            db.session.commit()
        # simple
        else:
            results = answer_question(current_question.config, iter(answer))
            scores = [sum(1 if x else 0 for x in results)/len(results)]
            marks = eval(takes.marks)
            marks[question] = scores
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
    store = DataStore(current_user.USER, {
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


@TakesRoutes.route('/submitTest', methods=['POST'])
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
    store = DataStore(current_user.USER, {
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


@TakesRoutes.route('/postTest', methods=['POST'])
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
            # math
            if not current_question.config:
                q = AvoQuestion(current_question.string, seeds[i], answers[i])
                question_list.append({'prompt': q.prompt, 'prompts': q.prompts, 'explanation': q.explanation,
                                      'types': q.types, 'answers': answers[i], 'totals': q.totals, 'scores': marks[i],
                                      'hideAnswersUntilDeadline': test.hide_answers_until_deadline,
                                      'deadline': test.deadline})
            # simple
            else:
                prompt, prompts, types = get_prompt_prompts_types(current_question)
                explanations = get_explanations(current_question.config)
                totals = [1]
                question_list.append(
                    {'prompt': prompt, 'prompts': prompts, 'explanation': explanations,
                     'types': types, 'answers': answers[i], 'totals': totals, 'scores': marks[i],
                     'correctAnswer': current_question.config.get('correct_answer'),
                     'hideAnswersUntilDeadline': test.hide_answers_until_deadline, 'deadline': test.deadline})
        return jsonify(questions=question_list)
    else:
        return jsonify(error="User isn't in class")


@TakesRoutes.route('/changeMark', methods=['POST'])
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


# helpers


def create_takes(test, user):
    """
    Creates a new instance of takes
    :param test: Test to create takes of
    :param user: User creating takes of
    :return: takes object
    """
    takes = Takes.query.filter((Takes.TEST == test.TEST) & (Takes.USER == user)).all()
    if test.attempts != -1 and len(takes) >= test.attempts:
        return
    test_question_list = eval(test.question_list)
    seeds = list(map(lambda seed: randint(0, 65535) if seed == -1 else seed, eval(test.seed_list)))
    answer_list = []
    marks_list = []
    questions_in_test = Question.query.filter(Question.QUESTION.in_(test_question_list)).all()
    for test_question in test_question_list:
        # For each question in test add in mark values per question
        current_question = next((x for x in questions_in_test if x.QUESTION == test_question), None)
        # math
        if not current_question.config:
            marks_list.append([0] * len(AvoQuestion(current_question.string, 0, []).totals))
            answer_list.append([''] * current_question.answers)
        # simple
        else:
            marks_list.append([0] * current_question.answers)
            answer_list.append([''] * current_question.answers)

    now = datetime.now()
    if test.timer == -1:
        time2 = test.deadline
    else:
        time2 = min(now + timedelta(minutes=test.timer), test.deadline)
    takes = Takes(test.TEST, user, now, time2, 0, str(marks_list), str(answer_list), str(seeds))
    db.session.add(takes)
    db.session.commit()
    return takes


def get_ip():
    if 'HTTP_X_FORWARDED_FOR' in request.headers:
        return request.headers['HTTP_X_FORWARDED_FOR']
    else:
        return request.remote_addr
