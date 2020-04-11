from datetime import datetime
from flask import Blueprint, jsonify

from server import db
from server.auth import able_edit_course, able_view_course
from server.decorators import login_required, teacher_only, validate
from server.models import Assignment, Lesson, User

LessonRoutes = Blueprint('LessonRoutes', __name__)


@LessonRoutes.route('/addLesson', methods=['POST'])
@teacher_only
@validate(courseID=int,  content=str, hasAssignment=bool, dueDate=datetime)
def add_lesson(course_ID: int, content: str, has_assignment: bool, due_date: datetime):
    if not able_edit_course(course_ID):
        return jsonify(error="Course not found or not able to edit course")
    lesson = Lesson(course_ID, content, has_assignment, due_date)
    db.session.add(lesson)
    db.session.commit()
    return jsonify(lesson=lesson.LESSON)


@LessonRoutes.route('/editLesson', methods=['POST'])
@teacher_only
@validate(lessonID=int, content=str, hasAssignment=bool, dueDate=datetime)
def edit_lesson(lesson_ID: int, content: str, has_assignment: bool, due_date: datetime):
    lesson = Lesson.query.get(lesson_ID)
    if lesson is None:
        return jsonify(error='Lesson not found')
    if not able_edit_course(lesson.COURSE):
        return jsonify(error="Course not found or not able to edit course")
    lesson.content = content
    lesson.has_assignment = has_assignment
    lesson.due_date = due_date
    db.session.commit()
    return jsonify(code=1)


@LessonRoutes.route('/deleteLesson', methods=['POST'])
@teacher_only
@validate(lessonID=int)
def delete_lesson(lesson_ID: int):
    lesson = Lesson.query.get(lesson_ID)
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

