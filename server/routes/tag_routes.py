from flask import Blueprint, jsonify
from flask_login import current_user

from server.auth import able_edit_course, able_view_course, able_edit_concept
from server.decorators import teacher_only, validate
from server.models import db, Concept, ConceptQuestion, ConceptRelation, Course, Mastery, MasteryHistory, UserCourse

TagRoutes = Blueprint('TagRoutes', __name__)


@TagRoutes.route("/addConcept", methods=['POST'])
@teacher_only
@validate(courseID=int, name=str, lesson=str)
def add_concept(course_id: int, name: str, lesson: str):
    """
    Add a Concept to the database
    :param course_id: The ID of the course to add the concept to
    :param name: Name of the concept
    :param lesson: the lesson string of the concept
    :return: Confirmation the concept was added into the database
    """
    if not able_edit_course(course_id):
        # If the user is not able to edit the course return error JSON
        return jsonify(error="User does not have the ability to edit the course")
    new_concept = Concept(course_id, name, lesson)  # THe concept to be added to the database and course
    # Add concept to database and return
    db.session.add(new_concept)
    db.session.commit()
    return jsonify(ID=new_concept.CONCEPT, course=new_concept.COURSE,
                   name=new_concept.name, lesson=new_concept.lesson_content)


@TagRoutes.route("/editConcept", methods=['POST'])
@teacher_only
@validate(conceptID=int, name=str, lesson=str)
def edit_concept(concept_id: int, name: str, lesson: str):
    """
    Edit an already existing Concept
    :param concept_id: The Concept to update
    :param name: The new Name of the concept
    :param lesson: The new Lesson string of the concept
    :return: Confirmation that the concept was updated
    """
    concept = Concept.query.get(concept_id)  # Check database for concept
    if concept is None:
        # If the concept does not exist return error JSON
        return jsonify(error="Concept Not Found")
    if not able_edit_course(concept.COURSE):
        # If user does not have access to edit course return error JSON
        return jsonify(error="User Not Able To Edit Course")
    # Update Concept Data and commit to database and return
    concept.name = name
    concept.lesson_content = lesson
    db.session.commit()
    return jsonify({})


@TagRoutes.route("/deleteConcept", methods=['POST'])
@teacher_only
@validate(conceptID=int)
def delete_concept(concept_id: int):
    """
    Delete a Concept
    :return: Confirmation the concept was deleted from the database
    """
    concept = Concept.query.get(concept_id)  # Check if Concept exists
    if concept is None:
        # If concept does not exist in the database return error JSON
        return jsonify(error="Concept not found")
    if not able_edit_course(concept.COURSE):
        # If the user is not able to edit course return error JSON
        return jsonify(error="User not able to edit course")
    concept_question = ConceptQuestion.query\
        .filter(ConceptQuestion.CONCEPT == concept_id).all()  # All questions related to concept
    if len(concept_question) > 0:
        # If there are questions with the concept remove the relation between them
        db.session.delete(concept_question)
    concept_relation = ConceptRelation.query.filter((ConceptRelation.PARENT == concept_id) |
                                                    (ConceptRelation.CHILD == concept_id)).all()
    # Get all relations between other concepts and current concept
    if len(concept_relation) > 0:
        # If there are relations with other concepts delete them from database
        db.session.delete(concept_relation)
    mastery = Mastery.query.filter(Mastery.CONCEPT == concept_id).all()  # Mastery with current concept
    mastery_history = MasteryHistory.query\
        .filter(MasteryHistory.MASTERY.in_(mastery.MASTERY)).all()  # Mastery backups with current concept
    if len(mastery_history) > 0:
        # If there are mastery histories delete from database
        db.session.delete(mastery_history)
    if len(mastery) > 0:
        # if there are current mastery scores remove from database
        db.session.delete(mastery)
    # Remove current concept from database and return
    db.session.delete(concept)
    db.session.commit()
    return jsonify({})


@TagRoutes.route("/addConceptRelation", methods=['POST'])
@teacher_only
@validate(parentID=int, childID=int, weight=int)
def add_concept_relation(parent_id: int, child_id: int, weight: int):
    user_course: UserCourse = UserCourse.query.filter(
        (UserCourse.COURSE == Concept.COURSE) & (Concept.CONCEPT == parent_id) & (UserCourse.USER == current_user.USER)
    ).first()
    if not user_course.can_edit:
        return jsonify(error="No permission to edit course")
    concept_relation = ConceptRelation.query.filter(
        (ConceptRelation.PARENT == parent_id) &
        (ConceptRelation.CHILD == child_id)
    ).first()
    if concept_relation is not None:
        return jsonify(error="Concept relation already exists")
    db.session.add(ConceptRelation(parent_id, child_id, weight))
    db.session.commit()
    return jsonify({})


@TagRoutes.route("/editConceptRelation", methods=['POST'])
@teacher_only
@validate(relationID=int, weight=int)
def edit_concept_relation(relation_id: int, weight: int):
    relation: ConceptRelation = ConceptRelation.query.filter(ConceptRelation.CONCEPT_RELATION == relation_id).first()
    if relation is None:
        return jsonify(error="Relation not found")
    if not able_edit_concept(relation.CONCEPT_CHILD_RELATION):
        return jsonify(error="No permission to edit course")
    relation.weight = weight
    db.session.commit()
    return jsonify({})


@TagRoutes.route("/deleteConceptRelation", methods=['POST'])
@teacher_only
@validate(relationID=int)
def delete_concept_relation(relation_id: int):
    relation: ConceptRelation = ConceptRelation.query.filter(ConceptRelation.CONCEPT_RELATION == relation_id).first()
    if relation is None:
        return jsonify(error="Relation not found")
    if not able_edit_concept(relation.CONCEPT_CHILD_RELATION):
        return jsonify(error="No permission to edit course")
    db.session.delete(relation)
    db.session.commit()
    return jsonify({})


@TagRoutes.route("/getConceptGraph", methods=['POST'])
@teacher_only
@validate(courseID=int)
def get_concept_graph(course_id: int):
    """
    Create and return a graph of the concepts of a course
    :param course_id:
    :return: Graph representation of concepts
    """
    if not able_view_course(course_id):
        # Checks if the user is in the course
        return jsonify(error="User Not In Course")
    concept_list = Concept.query.filter(Concept.COURSE == course_id).all()
    edge_list = ConceptRelation.query.filter((ConceptRelation.PARENT.in_(o.CONCEPT for o in concept_list)) |
                                             (ConceptRelation.CHILD.in_(o.CONCEPT for o in concept_list))).all()
    concepts = []  # List of concepts to return
    edges = []  # List of edges to return

    # For each concept add it to the return list
    concepts = [{"conceptID": concept.CONCEPT, "name": concept.name, "lesson": concept.lesson_content}
                for concept in concept_list]
    # For each edge add it to the return list
    edges = [{"parent": edge.PARENT, "child": edge.CHILD, "weight": edge.weight} for edge in edge_list]
    return jsonify(concepts=concepts, edges=edges)


@TagRoutes.route("/addConceptQuestion", methods=['POST'])
@teacher_only
@validate(conceptID=int, questionID=int, weight=int)
def add_concept_question(concept_id: int, question_id: int, weight: int):
    user_course: UserCourse = UserCourse.query.filter(
        (UserCourse.COURSE == Concept.COURSE) &
        (Concept.CONCEPT == concept_id) &
        (UserCourse.USER == current_user.USER)
    ).first()
    if not user_course.can_edit:
        return jsonify(error="No permission to edit course")
    concept: ConceptQuestion = ConceptQuestion.query.filter(
        (ConceptQuestion.CONCEPT == concept_id) &
        (ConceptQuestion.QUESTION == question_id)
    ).first()
    if concept is not None:
        return jsonify(error="Concept Question already exists")
    db.session.add(ConceptQuestion(concept_id, question_id, weight))
    db.session.commit()
    return jsonify({})


@TagRoutes.route('/editConceptQuestion', methods=['POST'])
@teacher_only
@validate(conceptQuestionID=int, weight=int)
def edit_concept_question(concept_question_id=int, weight=int):
    course = ConceptQuestion.query.join(Concept).join(Course).filter(
        ConceptQuestion.CONCEPT_QUESTION == concept_question_id).first()
    if course is None:
        return jsonify(error="Could not find concept question")

    user_course = UserCourse.query.filter((UserCourse.COURSE == course.CONCEPT_RELATION.COURSE_RELATION.COURSE) &
                                          (UserCourse.USER == current_user.USER)).first()

    if user_course is None:
        return jsonify(error="Could not find user course")

    if user_course.can_edit == 0:
        return jsonify(error="User can't edit course")

    course.weight = weight
    db.session.add(course)
    db.session.commit()

    return jsonify({"message": "success"})


@TagRoutes.route("/deleteConceptQuestion", methods=['POST'])
@teacher_only
@validate(conceptQuestionID=int)
def delete_concept_question(concept_question_id: int):
    """
    Delete a concept question relation from the database
    :param concept_question_id: The relation to remove
    :return: Confirmation that the record has been removed
    """
    concept_question = ConceptQuestion.query.get(concept_question_id)  # Get the concept question relation
    if concept_question is None:
        # If there is no relation in the database return error JSON
        return jsonify(error="Concept Not Found")
    if not able_edit_course(concept_question.CONCEPT):
        # If the user is not able to edit the course return error JSON
        return jsonify(error="User does not have the ability to edit the course")
    # Remove from database and return
    db.session.delete(concept_question)
    db.session.commit()
    return jsonify({})


@TagRoutes.route("/getConcepts", methods=['POST'])
@teacher_only
@validate(courseID=int)
def geet_concepts(course_id: int):
    user_course = UserCourse.query.filter(
        (UserCourse.COURSE == course_id) &
        (UserCourse.USER == current_user.USER)
    ).first()
    if user_course is None:
        return jsonify(error="User is not in the course")
    concepts = Concept.query.filter(Concept.COURSE == course_id).all()
    return jsonify({"concepts": [{"conceptID": concept.CONCEPT, "name": concept.name} for concept in concepts]})
