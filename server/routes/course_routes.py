from datetime import datetime
from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user

from server.decorators import teacher_only, login_required, validate
from server.models import Course, db, UserCourse, Section, UserSection

CourseRoutes = Blueprint('CourseRoutes', __name__)


@CourseRoutes.route('/createCourse', methods=['POST'])
@teacher_only
@validate(name=str)
def create_course(name: str):
    c = Course(name)
    db.session.add(c)
    db.session.flush()
    db.session.add(UserCourse(current_user.USER, c.COURSE, True))
    db.session.commit()
    return jsonify({})


@CourseRoutes.route('/getCourses', methods=['POST'])
@login_required
def get_courses():
    courses: List[Course] = Course.query.filter(
        ((Course.COURSE == UserCourse.COURSE) & (UserCourse.USER == current_user.USER)) |
        (
                (Course.COURSE == Section.COURSE) &
                (Section.SECTION == UserSection.SECTION) &
                (UserSection.USER == current_user.USER) &
                ((UserSection.expiry == None) | (UserSection.expiry > datetime.now()))
        )
    ).all()

    user_courses: List[UserCourse] = UserCourse.query.filter(
        (UserCourse.USER == current_user.USER) & (UserCourse.can_edit == 1)
    ).all()
    edit = set(map(lambda x: x.COURSE, user_courses))

    return_courses = list(map(lambda c: {'courseID': c.COURSE, 'name': c.name, 'canEdit': c.COURSE in edit}, courses))
    return jsonify(courses=return_courses)
