from datetime import datetime
from typing import List

from flask import Blueprint, jsonify, make_response
from flask_login import current_user
from sqlalchemy.sql import text

from server.auth import SectionRelations
from server.decorators import login_required, teacher_only, validate
from server.helpers import timestamp
from server.models import db, Message, Section, Takes, Test, User, UserSection, UserSectionType

SectionRoutes = Blueprint('SectionRoutes', __name__)

with open('server/SQL/test_stats.sql', 'r') as sql:
    test_stats_sql = sql.read()
with open('server/SQL/test_medians.sql', 'r') as sql:
    test_medians_sql = sql.read()

# Routes for managing sections


@SectionRoutes.route('/createSection', methods=['POST'])
@teacher_only
@validate(courseID=int, name=str)
def create_section(course_id: int, name: str):
    """
    Creates a section with the current user as the teacher
    :return: Confirmation that the section was created
    """
    s = Section(course_id, name, True, 0)
    db.session.add(s)
    db.session.flush()
    db.session.add(UserSection(current_user.USER, s.SECTION, UserSectionType.TEACHER, None, None))
    db.session.commit()
    return jsonify({})


@SectionRoutes.route('/home', methods=['POST'])
@login_required
def home():
    sections: List[Section] = Section.query.filter(
        (current_user.USER == UserSection.USER) & (UserSection.SECTION == Section.SECTION)
    ).all()
    messages: List[Message] = Message.query.filter(
        (current_user.USER == UserSection.USER) & (UserSection.SECTION == Message.SECTION)
    ).all()
    tests: List[Test] = Test.query.filter(
        (current_user.USER == UserSection.USER) & (UserSection.SECTION == Test.SECTION)
    ).all()

    return_sections = []
    for section in sections:
        return_messages = list(map(lambda x: {
            'user': x.USER_RELATION.email,
            'header': x.header,
            'body': x.body,
            'timestamp': timestamp(x.timestamp),
        }, filter(lambda x: x.SECTION == section.SECTION, messages)))
        return_tests = list(map(lambda x: {
            'testID': x.TEST,
            'name': x.name,
            'deadline': timestamp(x.deadline),
        }, filter(lambda x: x.SECTION == section.SECTION, tests)))
        return_sections.append({
            'sectionID': section.SECTION,
            'name': section.name,
            'messages': return_messages,
            'tests': return_tests
        })

    return jsonify(sections=return_sections)


@SectionRoutes.route('/getSections')
@login_required
def get_sections():
    """
    Get the current users sections available to them
    :return: A list of section data
    """

    now = datetime.now()

    # Get data for courses that the user is enrolled in
    users_sections = Section.query.filter(
        (UserSection.USER == current_user.USER) & (UserSection.SECTION == Section.SECTION)
    ).all()
    users_tests: List[Test] = Test.query.filter(
        (current_user.USER == UserSection.USER) & (UserSection.SECTION == Test.SECTION)
    ).all()
    users_takes: List[Takes] = Takes.query.filter(
        (current_user.USER == UserSection.USER) &
        (UserSection.SECTION == Test.SECTION) &
        (Test.TEST == Takes.TEST) &
        (current_user.USER == Takes.USER)
    ).all()
    users_test_stats = db.session.execute(text(test_stats_sql), params={'user': current_user.USER}).fetchall()
    users_medians = db.session.execute(text(test_medians_sql), params={'user': current_user.USER}).fetchall()

    sections = {}
    for s in users_sections:
        sections[s.SECTION] = {
            'sectionID': s.SECTION,
            'enrollKey': s.enroll_key,
            'name': s.name,
            'tests': {}
        }

    for t in users_tests:
        if t.open_time is not None:
            # If the test has an open time check if it should auto open
            if t.open_time is not None and not t.is_open and t.open_time <= now < t.deadline:
                # If the test is withing the open time and deadline open the test and disable the open time
                test_update = Test.query.get(t.TEST)
                test_update.open_time = None
                test_update.is_open = True
                db.session.commit()
        if t.is_open and t.deadline < now:
            # If the test does not have an open time check the deadline param
            test_update = Test.query.get(t.TEST)
            test_update.is_open = False
            db.session.commit()

        sections[t.SECTION]['tests'][t.TEST] = {
            'testID': t.TEST,
            'name': t.name,
            'open': bool(((t.open_time is not None and t.open_time >= now) or t.is_open) and t.deadline > now),
            'openTime': timestamp(t.open_time),
            'deadline': timestamp(t.deadline),
            'timer': t.timer,
            'attempts': t.attempts,
            'total': t.total,
            'submitted': [],
            'current': None,
            'sectionAverage': 0,
            'sectionMedian': 0,
            'sectionSize': 0,
            'standardDeviation': 0,
        }

    for t in users_takes:
        if t.TEST_RELATION.SECTION in sections and t.TEST in sections[t.TEST_RELATION.SECTION]['tests']:
            test = sections[t.TEST_RELATION.SECTION]['tests'][t.TEST]
            if t.time_submitted < now:
                test['submitted'].append({
                    'takesID': t.TAKES,
                    'timeSubmitted': timestamp(t.time_submitted),
                    'grade': t.grade
                })
                if test['attempts'] >= len(test['submitted']):
                    test['open'] = False
            else:
                test['current'] = {
                    'timeStarted': timestamp(t.time_started),
                    'timeSubmitted': timestamp(t.time_submitted)
                }

    for s in users_test_stats:
        if s.SECTION in sections and s.TEST in sections[s.SECTION]['tests']:
            test = sections[s.SECTION]['tests'][s.TEST]
            test['sectionAverage'] = float(s.average)
            test['sectionSize'] = int(s.student_count)
            test['standardDeviation'] = float(s.stdev)

    for m in users_medians:
        if m.SECTION in sections and m.TEST in sections[m.SECTION]['tests']:
            sections[m.SECTION]['tests'][m.TEST]['sectionMedian'] = float(m.median)

    for s in sections:
        sections[s]['tests'] = list(sections[s]['tests'].values())

    sections = list(sections.values())
    return jsonify(sections=sections)


@SectionRoutes.route('/getSectionTestResults', methods=['POST'])
@teacher_only
@validate(testID=int)
def get_section_test_results(test_id: int):
    """
    Get test results for a test for teacher
    :return: test results data
    """
    current_test = Test.query.get(test_id)
    if UserSectionType.TEACHER not in SectionRelations(current_test.SECTION).active:
        return jsonify(error="User doesn't teach section")
    # All users in section
    users = User.query.filter((User.USER == UserSection.USER) & (current_test.SECTION == UserSection.SECTION)).all()
    results = []
    for user in users:
        # For each user get user data and best takes instance and present append to list then return
        takes = Takes.query.filter((Takes.USER == user.USER) & (Takes.TEST == test_id)).order_by(Takes.grade).all()
        results.append({
            'userID': user.USER,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'tests': [] if len(takes) == 0 else [{
                'takesID': takes[-1].TAKES,
                'timeSubmitted': timestamp(takes[-1].time_submitted),
                'grade': takes[-1].grade
            }]
        })
    return jsonify(results=results)


@SectionRoutes.route('/CSV/SectionMarks/<section_id>')
@teacher_only
def csv_section_marks(section_id):
    """
    Generate a CSV file of the section marks
    :param section_id: The ID of the section to generate marks
    :return: A CSV file of the section marks
    """
    if UserSectionType.TEACHER not in SectionRelations(section_id).active:
        return jsonify(error="User does not teach section")
    # Query the database for data on the test section and students data
    student_array: List[User] = User.query.filter(
        (UserSection.SECTION == section_id) & (UserSection.USER == User.USER)
    ).all()
    test_array: List[Test] = Test.query.filter(Test.SECTION == section_id).all()
    output_string = '"Email" '  # The output for the file

    for test in test_array:
        # For each test add the names to the array and update the file string
        output_string += f', "{test.name}" '
    for student_i in student_array:
        # For each student get their best mark on each test and add it to the array
        current_string = f'\n"{student_i.email}"'  # A string for each line of the file

        for test in test_array:
            takes = Takes.query.filter((Takes.TEST == test.TEST) & (student_i.USER == Takes.USER)).all()
            if takes:
                top_mark = max(map(lambda x: x.grade, takes))
                current_string += f', {top_mark} / {test.total}'
            else:
                current_string += ', Test Not Taken'
        output_string = output_string + current_string

    response = make_response(output_string)
    response.headers["Content-Disposition"] = f"attachment; filename={Section.query.get(section_id).name}.csv"
    return response  # Return the file to the user


@SectionRoutes.route('/getSectionData', methods=['POST'])
@teacher_only
@validate(sectionID=int)
def get_section_data(section_id: int):
    if UserSectionType.TEACHER not in SectionRelations(section_id).active:
        return jsonify(error="User does not teach the section")
    students = User.query.filter((UserSection.SECTION == section_id) & (UserSection.USER == User.USER)).all()
    tests = Test.query.filter(Test.SECTION == section_id).all()
    test_names = list(map(lambda x: x.name, tests))
    test_totals = list(map(lambda x: x.total, tests))
    test_data = {}
    for student in students:
        top_marks = []
        for test in tests:
            takes_list = Takes.query.filter((Takes.TEST == test.TEST) & (student.USER == Takes.USER)).all()
            if len(takes_list) != 0:
                top_marks.append(max(map(lambda x: x.grade, takes_list)))
            else:
                top_marks.append(None)
        test_data[student.email] = top_marks
    return jsonify(names=test_names, totals=test_totals, data=test_data)
