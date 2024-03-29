from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user

from server.auth import able_edit_set, able_edit_course
from server.decorators import teacher_only, validate
from server.models import db, Question, QuestionSet, UserCourse, Concept, ConceptQuestion

QuestionSetRoutes = Blueprint('QuestionSetRoutes', __name__)


@QuestionSetRoutes.route('/getSets')
def get_sets():
    """
    Get the list of Sets available to the user
    :return: The list of sets
    """
    # Get list of available sets for current user
    list_of_sets: List[QuestionSet] = QuestionSet.query\
        .join(UserCourse, QuestionSet.COURSE == UserCourse.COURSE)\
        .filter(UserCourse.USER == current_user.USER)\
        .all()
    set_list = []  # List of sets to send back to the user
    tag_questions: List[ConceptQuestion] = ConceptQuestion.query\
        .join(Concept, ConceptQuestion.CONCEPT == Concept.CONCEPT)\
        .join(UserCourse, Concept.COURSE == UserCourse.COURSE)\
        .filter(UserCourse.USER == current_user.USER).all()

    sets = [s.QUESTION_SET for s in list_of_sets]
    questions = Question.query.filter(Question.QUESTION_SET.in_(sets)).all()
    questions_cache = {
        set_: [q for q in questions if q.QUESTION_SET == set_]
        for set_ in sets
    }
    for s in list_of_sets:
        # For each set append the data
        questions = questions_cache.get(s.QUESTION_SET)
        question_list = []  # Question data to return to client
        for q in questions:
            # For each question append the data
            concept_dict = {}
            for t in tag_questions:
                if t.QUESTION == q.QUESTION:
                    concept_dict[t.CONCEPT] = t.weight
            question_list.append({
                'questionID': q.QUESTION,
                'name': q.name,
                'string': q.string,
                'total': q.total,
                'answers': q.answers,
                'category': q.category,
                'concepts': concept_dict,
                'type': 'math' if not q.config else 'simple',
                'config': q.config
            })
        set_list.append({
            'setID': s.QUESTION_SET,
            'courseID': s.COURSE,
            'name': s.name,
            'canEdit': able_edit_set(s.QUESTION_SET),
            'questions': question_list,
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
