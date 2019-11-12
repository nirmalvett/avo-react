from flask import Blueprint
from server.decorators import teacher_only, validate

LessonRoutes = Blueprint('LessonRoutes', __name__)


@LessonRoutes.route('/addLesson', methods=['POST'])
@teacher_only
@validate()
def add_lesson():
    return ''  # todo


@LessonRoutes.route('/editLesson', methods=['POST'])
@teacher_only
@validate()
def edit_lesson():
    return ''  # todo


@LessonRoutes.route('/deleteLesson', methods=['POST'])
@teacher_only
@validate()
def delete_lesson():
    return ''  # todo


@LessonRoutes.route('/publishLesson', methods=['POST'])
@teacher_only
@validate()
def publish_lesson():
    return ''  # todo
