from datetime import datetime
from flask import Blueprint, jsonify

from server import db
from server.auth import able_edit_course, able_view_course
from server.decorators import login_required, teacher_only, validate
from server.helpers import from_timestamp
from server.models import Assignment, Lesson, User

LessonRoutes = Blueprint('LessonRoutes', __name__)


@LessonRoutes.route('/addLesson', methods=['POST'])
@teacher_only
@validate(courseID=int,  content=str, name=str, hasAssignment=bool, dueDate=int)
def add_lesson(course_id: int, content: str, name: str, has_assignment: bool, due_date: int):
    if not able_edit_course(course_id):
        return jsonify(error="Course not found or not able to edit course")
    if has_assignment:
        due_date = from_timestamp(due_date)
    else:
        due_date = None
    lesson = Lesson(course_id, content, name, has_assignment, due_date)
    db.session.add(lesson)
    db.session.commit()
    return jsonify(lesson=lesson.LESSON)


@LessonRoutes.route('/editLesson', methods=['POST'])
@teacher_only
@validate(lessonID=int, content=str, name=str, hasAssignment=bool, dueDate=int)
def edit_lesson(lesson_id: int, content: str, name: str, has_assignment: bool, due_date: int):
    lesson = Lesson.query.get(lesson_id)
    if lesson is None:
        return jsonify(error='Lesson not found')
    if not able_edit_course(lesson.COURSE):
        return jsonify(error="Course not found or not able to edit course")
    lesson.content = content
    lesson.name = name
    lesson.has_assignment = has_assignment
    if has_assignment:
        lesson.due_date = from_timestamp(due_date)
    else:
        lesson.due_date = None
    lesson.due_date = due_date
    db.session.commit()
    return jsonify(code=1)


@LessonRoutes.route('/deleteLesson', methods=['POST'])
@teacher_only
@validate(lessonID=int)
def delete_lesson(lesson_id: int):
    lesson = Lesson.query.get(lesson_id)
    if lesson is None:
        return jsonify(error="No lesson found")
    if not able_edit_course(lesson.COURSE):
        return jsonify(error="User not able to edit course")
    db.session.delete(lesson)
    db.session.commit()
    return jsonify(code=1)


@LessonRoutes.route('/getLessons', methods=['POST'])
@login_required
@validate(courseID=int)
def get_lessons(course_id: int):
    if not able_view_course(course_id):
        return jsonify(error="User not able to view course or course does not exist")
    lessons = Lesson.query.filter(Lesson.COURSE == course_id).all()
    return jsonify(lessons=lessons)


@LessonRoutes.route('/getAssignments', methods=['POST'])
@teacher_only
@validate(lessonID=int)
def get_assignments(lesson_id: int):
    lesson = Lesson.query.get(lesson_id)
    if lesson is None:
        return jsonify(error="No lesson found")
    if not able_edit_course(lesson.COURSE):
        return jsonify(error='User not able to view course')
    assignment_list = Assignment.query.filter(Assignment.LESSON == lesson.LESSON).all()
    user_list = User.query.filter().all()
    return 'placeholder'

