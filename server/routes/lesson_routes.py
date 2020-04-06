from datetime import datetime
from flask import Blueprint, jsonify

from server import db
from server.auth import able_edit_course, able_view_course
from server.decorators import login_required, teacher_only, validate
from server.models import Concept, Lesson

LessonRoutes = Blueprint('LessonRoutes', __name__)


@LessonRoutes.route('/addLesson', methods=['POST'])
@teacher_only
@validate(courseID=int, conceptID=int, content=str, hasAssignment=bool, dueDate=datetime)
def add_lesson(course_ID: int, concept_ID: int, content: str, has_assignment: bool, due_date: datetime):
    if not able_edit_course(course_ID):
        return jsonify(error="Course not found or not able to edit course")
    concept = Concept.query.get(concept_ID)
    if concept is None:
        return jsonify(error="Concept not found")
    lesson = Lesson(course_ID, concept_ID, concept, has_assignment, due_date)
    db.session.add(lesson)
    db.session.commit()
    return jsonify(lesson=lesson.LESSON)


@LessonRoutes.route('/editLesson', methods=['POST'])
@teacher_only
@validate(lessonID=int, conceptID=int, content=str, hasAssignment=bool, dueDate=datetime)
def edit_lesson(lesson_ID: int, concept_ID: int, content: str, has_assignment: bool, due_date: datetime):
    lesson = Lesson.query.get(lesson_ID)
    if lesson is None:
        return jsonify(error='Lesson not found')
    if not able_edit_course(lesson.COURSE):
        return jsonify(error="Course not found or not able to edit course")
    concept = Concept.query.get(concept_ID)
    if concept is None:
        return jsonify(error="Concept not found")
    lesson.CONCEPT = concept_ID
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
    lessons = Lesson.query.filter(Lesson.COURSE == course_id)
    return jsonify(lessons=lessons)
