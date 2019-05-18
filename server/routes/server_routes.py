from flask import Blueprint, jsonify, request, abort
from server.MathCode.question import AvoQuestion
import sys
from git import Repo
import re

import config
from server.decorators import admin_only
from server.models import db, User, Class, Test, Question, Set

ServerRoutes = Blueprint('ServerRoutes', __name__)


# noinspection SpellCheckingInspection
@ServerRoutes.route('/irNAcxNHEb8IAS2xrvkqYk5sGVRjT3GA', methods=['POST'])
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


@ServerRoutes.route('/validateDatabase')
@admin_only
def validate():
    err_invalid_email = []
    err_missing_pk_user = []
    err_invalid_password = []
    err_invalid_salt = []
    err_not_confirmed = []
    err_student_teaching = []
    errors = []

    users = User.query.all()
    regex = re.compile(r'[a-z]{2,8}\d{0,4}@uwo\.ca')
    i = 1
    for user in users:
        if not regex.match(user.email):
            err_invalid_email.append(user.USER)
        while i < user.USER:
            err_missing_pk_user.append(i)
            i += 1
        i += 1
        if len(user.password) != 128:
            err_invalid_password.append(user.USER)
        if len(user.salt) != 32:
            err_invalid_salt.append(user.USER)
        if not user.confirmed:
            err_not_confirmed.append(user.USER)

    classes = db.session.execute(
        "SELECT USER.USER, CLASS.CLASS FROM CLASS INNER JOIN USER ON USER.USER = CLASS.USER"
        " WHERE USER.is_teacher = FALSE"
    ).fetchall()
    for c in classes:
        err_student_teaching.append(c)

    classes = Class.query.all()
    i = 1
    for c in classes:
        if not re.fullmatch(r'\w{10}', c.enroll_key):
            errors.append(f'Invalid enroll key for class {c.CLASS}')
        while i < c.CLASS:
            errors.append(f'Missing primary key in class table: {i}')
            i += 1
        i += 1

    questions = Question.query.all()
    q_array = list(range(questions[-1].QUESTION + 1))
    i = 1
    for q in questions:
        while i < q.QUESTION:
            errors.append(f'Missing primary key in question table: {i}')
            i += 1
        i += 1
        q_array[q.QUESTION] = q
        parts = q.string.split('；')
        if q.SET is None:
            errors.append(f"Question {q.QUESTION} has been deleted")
        if len(parts) != 9:
            errors.append(f"Question {q.QUESTION} has a deprecated/invalid string")
        else:
            try:
                AvoQuestion(q.string)
            except Exception:
                errors.append(f"Question {q.QUESTION} can't be generated")
            if len(parts[4].split('，')) != q.answers:
                errors.append(f"Question {q.QUESTION}'s answers field count is incorrect")
            if sum(map(lambda x: float(x), parts[5].split('，'))) != q.total:
                errors.append(f"Question {q.QUESTION}'s total is incorrect")

    tests = Test.query.all()
    i = 1
    for t in tests:
        while i < t.TEST:
            errors.append(f'Missing primary key in test table: {i}')
            i += 1
        i += 1
        if t.timer == 0 or t.timer < -1 or t.timer > 240:
            errors.append(f'Test {t.TEST} has a timer of {t.timer}')
        if t.attempts == 0 or t.attempts < -1 or t.attempts > 5:
            errors.append(f'Test {t.TEST} allows {t.attempts} attempts')
        question_list = eval(t.question_list)
        seed_list = eval(t.seed_list)
        if len(question_list) != len(seed_list):
            errors.append(f"Test {t.TEST}'s seed list is a different length than it's question list")
        if any(map(lambda x: x < -1 or x > 65535, seed_list)):
            errors.append(f"Test {t.TEST} has one or more invalid seeds")
        try:
            if t.total != sum(map(lambda q: q_array[q].total, question_list)):
                errors.append(f"Test {t.TEST} has the wrong total")
        except IndexError:
            errors.append(f"Test {t.TEST} has a nonexistent question")

    # takes = db.session.execute(
    #     "SELECT takes.TAKES, takes.time_started, takes.time_submitted, takes.answers, takes.marks, takes.grade,"
    #     " takes.seeds, TEST.question_list FROM takes INNER JOIN TEST ON TEST.TEST = takes.TEST ORDER BY takes.TAKES"
    # ).fetchall()
    # i = 1
    # for t in takes:
    #     takes_id, time_started, time_submitted, answers, marks, grade, seeds, questions = t
    #     while i < takes_id:
    #         errors.append(f'Missing primary key in takes table: {i}')
    #         i += 1
    #     i += 1
    #     if (time_submitted - time_started).seconds < 30:
    #         errors.append(f'Takes {takes_id} is less than 30 seconds')
    #     try:
    #         answers = eval(answers)
    #         marks = eval(marks)
    #         questions = eval(questions)
    #         seeds = eval(seeds)
    #         if grade != sum(map(lambda x: sum(x), marks)):
    #             errors.append(f"Takes {takes_id}'s scores add up to the correct total")
    #         if len(answers) != len(marks) or any(map(lambda x: len(answers[x]) != len(marks[x]), range(len(marks)))):
    #             errors.append(f"Takes {takes_id}'s answers don't line up with the scores")
    #         elif len(answers) != len(questions):
    #             errors.append(f"Takes {takes_id}'s has the wrong number of answers")
    #         elif any(map(lambda x: len(answers[x]) != q_array[questions[x]].answers, range(len(answers)))):
    #             errors.append(f"Takes {takes_id}'s has the wrong number of answers in one of the parts")
    #         else:
    #             for j in range(len(answers)):
    #                 if AvoQuestion(q_array[questions[j]].string, seeds[j], answers[j]).scores != marks[j]:
    #                     errors.append(f"Takes {takes_id} question {j+1}'s mark has been changed")
    #             pass
    #     except Exception:
    #         errors.append(f"List parsing failed for takes {takes_id}")

    sets = Set.query.all()
    i = 1
    for s in sets:
        while i < s.SET:
            errors.append(f'Missing primary key in set table: {i}')
            i += 1
        i += 1

    too_many_attempts = db.session.execute(
        "SELECT * FROM ("
        "SELECT USER, TEST, COUNT(*) AS COUNT, attempts FROM ("
        "SELECT takes.USER, takes.TEST, TEST.attempts FROM takes INNER JOIN TEST ON takes.TEST = TEST.TEST"
        ") AS q GROUP BY USER, TEST"
        ") as r WHERE COUNT>attempts AND attempts!=-1 ORDER BY USER, TEST;"
    ).fetchall()
    for t in too_many_attempts:
        errors.append(f'User {t[0]} took test {t[1]} {t[2]} times, but only {t[3]} are allowed')

    enrolled_in_own_class = db.session.execute(
        "SELECT CLASS.USER, CLASS.CLASS FROM CLASS"
        " INNER JOIN enrolled ON CLASS.CLASS=enrolled.CLASS AND CLASS.USER=enrolled.USER;"
    )
    for e in enrolled_in_own_class:
        errors.append(f'User {e[0]} is enrolled in class {e[1]}, which they also teach')

    enrolled_in_multiple_classes = db.session.execute(
        "SELECT USER, COUNT FROM ("
        "SELECT COUNT(*) AS COUNT, USER, is_teacher, is_admin FROM ("
        "SELECT USER.USER, is_teacher, is_admin FROM USER INNER JOIN enrolled ON USER.USER = enrolled.USER"
        ") AS q GROUP BY USER"
        ") as r WHERE COUNT>1 AND is_teacher=0 AND is_admin=0 ORDER BY USER;"
    )
    for e in enrolled_in_multiple_classes:
        errors.append(f'User {e[0]} is enrolled in {e[1]} classes')

    result = {}
    if len(err_invalid_email) > 0:
        result["Invalid email"] = err_invalid_email
    if len(err_invalid_password) > 0:
        result["Invalid password"] = err_invalid_password
    if len(err_invalid_salt) > 0:
        result["Invalid salt"] = err_invalid_salt
    if len(err_not_confirmed) > 0:
        result["Not confirmed"] = err_not_confirmed
    if len(err_missing_pk_user) > 0:
        result["Missing primary key in USER table"] = err_missing_pk_user
    if len(err_student_teaching) > 0:
        result["Student teaching class"] = err_student_teaching
    if len(errors) > 0:
        result["Other"] = errors
    return jsonify(result)
