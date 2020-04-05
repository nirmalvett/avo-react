from datetime import datetime
from flask import Blueprint, jsonify

from server import db
from server.auth import able_edit_course
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
@validate()
def edit_lesson():
    return ''  # todo


@LessonRoutes.route('/deleteLesson', methods=['POST'])
@teacher_only
@validate()
def delete_lesson():
    return ''  # todo


@LessonRoutes.route('/getLessons', methods=['POST'])
@login_required
@validate()
def get_lessons():
    return ''
