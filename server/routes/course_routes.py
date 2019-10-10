from flask import Blueprint, jsonify
from flask_login import current_user

from server.decorators import teacher_only, validate
from server.models import Course, db, UserCourse

CourseRoutes = Blueprint('CourseRoutes', __name__)


@CourseRoutes.route('/createCourse', methods=['POST'])
@teacher_only
@validate(name=str)
def create_section(name: str):
    c = Course(name)
    db.session.add(c)
    db.session.flush()
    db.session.add(UserCourse(current_user.USER, c.COURSE, True))
    db.session.commit()
    return jsonify({})
