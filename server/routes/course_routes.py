from datetime import datetime
from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user
from sqlalchemy import or_, and_

from server.decorators import teacher_only, login_required, validate
from server.models import Course, db, UserCourse, Section, UserSection

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
    courses = courses + courses_in

    user_courses: List[UserCourse] = UserCourse.query.filter(
        (UserCourse.USER == current_user.USER) & (UserCourse.can_edit == 1)
    ).all()
    edit = set(map(lambda x: x.COURSE, user_courses))

    return_courses = list(map(lambda c: {'courseID': c.COURSE, 'name': c.name, 'canEdit': c.COURSE in edit}, courses))
    return jsonify(courses=return_courses)


@CourseRoutes.route('/getOpenCourses', methods=['GET'])
def get_open_courses():
    courses = [
        {'courseID': c.COURSE, 'name': c.name}
        for c in Course.query.filter(Course.is_open == True).all()
    ]
    return jsonify(courses=courses)


@CourseRoutes.route('/getOpenCourse', methods=['POST'])
@validate(courseID=int)
def get_open_course(course_id: int):
    sections = Section.query.filter(Section.COURSE == course_id).all()
    course = Course.query.get(course_id)
    return jsonify(course={
        'courseID': course_id,
        'courseName': course.name,
        'description': course.description,
        'sections': [
            {
                'name': section.name,
                'enrollKey': section.enroll_key,
                'sectionID': section.SECTION
            }
            for section in sections
        ]
    })
