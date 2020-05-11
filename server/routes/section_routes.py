from datetime import datetime
from typing import List

from flask import Blueprint, jsonify, make_response
from flask_login import current_user
from sqlalchemy.sql import text

from server.auth import SectionRelations
from server.decorators import login_required, teacher_only, validate
from server.helpers import timestamp
from server.models import db, Announcement, Section, Takes, Test, User, UserSection, UserSectionType

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
    sections: List[Section] = Section\
        .query\
        .join(UserSection, UserSection.SECTION == Section.SECTION)\
        .filter(current_user.USER == UserSection.USER)\
        .all()

    announcements: List[Announcement] = Announcement.query\
        .join(UserSection, UserSection.SECTION == Announcement.SECTION)\
        .filter(current_user.USER == UserSection.USER)\
        .all()
    tests: List[Test] = Test.query\
        .join(UserSection, UserSection.SECTION == Test.SECTION)\
        .filter(current_user.USER == UserSection.USER)\
        .all()

    return_sections = []
    for section in sections:
        return_announcements = list(map(lambda x: {
            'user': x.USER_RELATION.email,
            'header': x.header,
            'body': x.body,
            'timestamp': timestamp(x.timestamp),
        }, filter(lambda x: x.SECTION == section.SECTION, announcements)))
        return_tests = list(map(lambda x: {
            'testID': x.TEST,
            'name': x.name,
            'deadline': timestamp(x.deadline),
        }, filter(lambda x: x.SECTION == section.SECTION, tests)))
        return_sections.append({
            'sectionID': section.SECTION,
            'name': section.name,
            'announcements': return_announcements,
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
    sections: List[Section] = Section.query\
        .join(UserSection, UserSection.SECTION == Section.SECTION)\
        .filter(UserSection.USER == current_user.USER)\
        .all()

    tests: List[Test] = Test.query\
        .join(UserSection, UserSection.SECTION == Test.SECTION)\
        .filter(current_user.USER == UserSection.USER)\
        .all()

    takes: List[Takes] = Takes.query\
        .join(Test, Test.TEST == Takes.TEST)\
        .join(UserSection, UserSection.SECTION == Test.SECTION)\
        .filter(
            (current_user.USER == UserSection.USER) &
            (current_user.USER == Takes.USER)
        )\
        .all()

    user_sections: List[UserSection] = UserSection.query.filter(UserSection.USER == current_user.USER).all()
    users_test_stats = db.session.execute(text(test_stats_sql), params={'user': current_user.USER}).fetchall()
    users_medians = db.session.execute(text(test_medians_sql), params={'user': current_user.USER}).fetchall()

    sections_dict = {}
    for s in sections:
        sections_dict[s.SECTION] = {
            'sectionID': s.SECTION,
            'courseID': s.COURSE,
            'enrollKey': s.enroll_key,
            'name': s.name,
            'tests': {}
        }

    for s in user_sections:
        if s.expiry is None or s.expiry > now:
            sections_dict[s.SECTION]['role'] = s.user_type

    for t in tests:
        sections_dict[t.SECTION]['tests'][t.TEST] = {
            'testID': t.TEST,
            'name': t.name,
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
            'hideAnswersUntilDeadline': t.hide_answers_until_deadline,
        }

    for t in takes:
        if t.TEST_RELATION.SECTION in sections_dict and t.TEST in sections_dict[t.TEST_RELATION.SECTION]['tests']:
            test = sections_dict[t.TEST_RELATION.SECTION]['tests'][t.TEST]
            if t.time_submitted < now:
                test['submitted'].append({
                    'takesID': t.TAKES,
                    'timeSubmitted': timestamp(t.time_submitted),
                    'grade': t.grade
                })
            else:
                test['current'] = {
                    'timeStarted': timestamp(t.time_started),
                    'timeSubmitted': timestamp(t.time_submitted)
                }

    for s in users_test_stats:
        if s.SECTION in sections_dict and s.TEST in sections_dict[s.SECTION]['tests']:
            test = sections_dict[s.SECTION]['tests'][s.TEST]
            test['sectionAverage'] = round(s.average, 2)
            test['sectionSize'] = int(s.student_count)
            test['standardDeviation'] = round(s.stdev, 2)

    for m in users_medians:
        if m.SECTION in sections_dict and m.TEST in sections_dict[m.SECTION]['tests']:
            sections_dict[m.SECTION]['tests'][m.TEST]['sectionMedian'] = round(m.median, 2)

    for s in sections_dict:
        sections_dict[s]['tests'] = list(sections_dict[s]['tests'].values())

    sections_dict = list(sections_dict.values())
    return jsonify(sections=sections_dict)


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
    users = User.query\
        .join(UserSection, User.USER == UserSection.USER)\
        .filter(current_test.SECTION == UserSection.SECTION)\
        .all()

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
    student_array: List[User] = User.query\
        .join(UserSection, UserSection.USER == User.USER)\
        .filter(UserSection.SECTION == section_id)\
        .all()
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
    students = User.query\
        .join(UserSection, UserSection.USER == User.USER)\
        .filter(UserSection.SECTION == section_id)\
        .all()

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
