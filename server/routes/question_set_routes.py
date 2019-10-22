from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user

from server.auth import able_edit_set, able_edit_course
from server.decorators import teacher_only, validate
from server.models import db, Question, QuestionSet, UserCourse, Concept, ConceptQuestion

QuestionSetRoutes = Blueprint('QuestionSetRoutes', __name__)


@QuestionSetRoutes.route('/getSets')
@teacher_only
def get_sets():
    """
    Get the list of Sets available to the user
    :return: The list of sets
    """
    # Get list of available sets for current user
    list_of_sets: List[QuestionSet] = QuestionSet.query.filter(
        (QuestionSet.COURSE == UserCourse.COURSE) & (UserCourse.USER == current_user.USER)
    ).all()
    set_list = []  # List of sets to send back to the user
    tag_questions = ConceptQuestion.query.filter(
        (ConceptQuestion.CONCEPT == Concept.CONCEPT) &
        (Concept.COURSE == UserCourse.COURSE) &
        (UserCourse.USER == current_user.USER)
    ).all()
    for s in list_of_sets:
        # For each set append the data
        questions = Question.query.filter(Question.QUESTION_SET == s.QUESTION_SET).all()  # Get all questions in set
        question_list = []  # Question data to return to client
        for q in questions:
            # For each question append the data
            question_list.append({
                'questionID': q.QUESTION,
                'name': q.name,
                'string': q.string,
                'total': q.total,
                'answers': q.answers,
                'category': q.category,
                'concepts': list(map(lambda x: x.CONCEPT, filter(lambda y: y.QUESTION == q.QUESTION, tag_questions)))
            })
        set_list.append({
            'setID': s.QUESTION_SET,
            'courseID': s.COURSE,
            'name': s.name,
            'canEdit': able_edit_set(s.QUESTION_SET),
            'questions': question_list
        })
    return jsonify(sets=set_list)


@QuestionSetRoutes.route('/newSet', methods=['POST'])
@teacher_only
@validate(courseID=int, name=str)
def create_set(course_id: int, name: str):
    """
    Creates a new set
    :return: validation that the set has been added
    """
    if not able_edit_course(course_id):
        return jsonify(error="user not allowed to edit course")
    new_set = QuestionSet(course_id, name)
    db.session.add(new_set)
    db.session.commit()
    return jsonify(setID=new_set.QUESTION_SET)


@QuestionSetRoutes.route('/renameSet', methods=['POST'])
@teacher_only
@validate(setID=int, name=str)
def rename_set(set_id: int, name: str):
    """
    Renames a set
    :return: validation that the set has been updated
    """
    if not able_edit_set(set_id):
        return jsonify(error="User not able to modify this data")
    QuestionSet.query.get(set_id).name = name
    db.session.commit()
    return jsonify({})


@QuestionSetRoutes.route('/deleteSet', methods=['POST'])
@teacher_only
@validate(setID=int)
def delete_set(set_id: int):
    """
    Deletes a set
    :return: validation that the set has been Deleted
    """
    if not able_edit_set(set_id):
        return jsonify(error="User not able to modify this data")
    QuestionSet.query.get(set_id).COURSE = None
    db.session.commit()
    return jsonify({})
