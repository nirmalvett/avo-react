from datetime import datetime
from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user
from sqlalchemy import or_, and_

from server.decorators import teacher_only, login_required, validate
from server.models import Course, db, UserCourse, Section, UserSection, User, File

CourseRoutes = Blueprint('CourseRoutes', __name__)


@CourseRoutes.route('/createCourse', methods=['POST'])
@teacher_only
@validate(name=str, isOpen=bool, description=str)
def create_course(name: str, is_open: bool, description: str):
    c = Course(name, description, is_open)
    db.session.add(c)
    db.session.flush()
    db.session.add(UserCourse(current_user.USER, c.COURSE, True))
    db.session.commit()
    return jsonify({})


@CourseRoutes.route('/getCourses', methods=['POST'])
@login_required
def get_courses():
    courses = Course.query\
        .join(UserCourse, UserCourse.COURSE == Course.COURSE)\
        .filter(UserCourse.USER == current_user.USER).all()

    courses_in = Course.query\
        .join(Section, Section.COURSE == Course.COURSE)\
        .join(UserSection, UserSection.SECTION == Section.SECTION)\
        .filter(and_(
            UserSection.USER == current_user.USER,
            or_(UserSection.expiry == None, UserSection.expiry > datetime.now())
        )).all()
    courses = list(set(courses + courses_in))

    user_courses: List[UserCourse] = UserCourse.query.filter(
        (UserCourse.USER == current_user.USER) & (UserCourse.can_edit == 1)
    ).all()
    edit = set(map(lambda x: x.COURSE, user_courses))

    return_courses = list(map(lambda c: {'courseID': c.COURSE, 'name': c.name, 'canEdit': c.COURSE in edit,
                                         'organicContentEnabled': c.organic_content_enabled}, courses))
    return jsonify(courses=return_courses)


@CourseRoutes.route('/getOpenCourses', methods=['GET'])
def get_open_courses():
    courses = [
        {'courseID': c.COURSE, 'courseName': c.name}
        for c in Course.query.filter(Course.is_open == True).all()
    ]
    return jsonify(courses=courses)


@CourseRoutes.route('/getOpenCourse', methods=['POST'])
@validate(courseID=int)
def get_open_course(course_id: int):
    sections = Section.query.filter(Section.COURSE == course_id).all()
    course = Course.query.get(course_id)
    enrolled_in = UserSection.query.filter(
        UserSection.USER == current_user.USER).all()
    enrolled_in = {u.SECTION for u in enrolled_in}
    contributor_ids = UserCourse.query.filter(
        (UserCourse.COURSE == course_id) & (UserCourse.can_edit == 1))
    contributor_ids = [row.USER for row in contributor_ids]
    contributors = User.query.filter(User.USER.in_(contributor_ids)).all()
    return jsonify(course={
        'contributors': [{'userID': contributor.USER, 'username': contributor.profile_id, 'firstName': contributor.first_name, 'lastName': contributor.last_name, 'profilePicture': File.query.filter(File.FILE == contributor.profile_pic).first().file_name} for contributor in contributors],
        'courseID': course_id,
        'courseName': course.name,
        'description': course.description,
        'sections': [
            {
                'name': section.name,
                'enrollKey': section.enroll_key,
                'sectionID': section.SECTION,
                'enrolled': section.SECTION in enrolled_in
            }
            for section in sections
        ]
    })
