from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user

from server.MathCode.question import AvoQuestion
from server.auth import able_edit_course, able_view_course, able_edit_concept
from server.decorators import teacher_only, validate, login_required
from server.models import db, Concept, ConceptQuestion, ConceptRelation, Mastery, MasteryHistory, UserCourse, Section, \
    UserSection, User, Course, Question

from random import choice, randint

ConceptRoutes = Blueprint('ConceptRoutes', __name__)


@ConceptRoutes.route("/addConcept", methods=['POST'])
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
        return jsonify(error="User does not have the ability to edit the course")
    new_concept = Concept(course_id, name, lesson)
    db.session.add(new_concept)
    db.session.commit()
    return jsonify(conceptID=new_concept.CONCEPT)


@ConceptRoutes.route("/editConcept", methods=['POST'])
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


@ConceptRoutes.route("/deleteConcept", methods=['POST'])
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
    for c in concept_relation:
        db.session.delete(c)
    mastery = Mastery.query.filter(Mastery.CONCEPT == concept_id).all()  # Mastery with current concept
    mastery_history = MasteryHistory.query\
        .filter(MasteryHistory.MASTERY.in_(list(map(lambda x: x.MASTERY, mastery)))).all()  # Mastery backups with current concept
    for m in mastery_history:
        db.session.delete(m)
    for m in mastery:
        db.session.delete(m)
    # Remove current concept from database and return
    db.session.delete(concept)
    db.session.commit()
    return jsonify({})


@ConceptRoutes.route("/setConceptRelation", methods=['POST'])
@teacher_only
@validate(parentID=int, childID=int, weight=int)
def set_concept_relation(parent_id: int, child_id: int, weight: int):
    if not able_edit_concept(parent_id):
        return jsonify(error="No permission to edit course")
    concept_relation: ConceptRelation = ConceptRelation.query.filter(
        (ConceptRelation.PARENT == parent_id) &
        (ConceptRelation.CHILD == child_id)
    ).first()
    if weight != 0:  # if the relation should exist
        if concept_relation is None:  # if it doesn't currently exist
            db.session.add(ConceptRelation(parent_id, child_id, weight))
            db.session.commit()
            return jsonify(message='created relation')
        elif weight != concept_relation.weight:  # if it exists, and needs to be changed
            concept_relation.weight = weight
            db.session.commit()
            return jsonify(message='updated relation')
    elif concept_relation is not None:  # if it shouldn't exist, but it currently does
        db.session.delete(concept_relation)
        db.session.commit()
        return jsonify(message='removed relation')
    return jsonify(message='no changes made')


@ConceptRoutes.route("/setConceptQuestion", methods=['POST'])
@teacher_only
@validate(conceptID=int, questionID=int, weight=int)
def add_concept_question(concept_id: int, question_id: int, weight: int):
    if not able_edit_concept(concept_id):
        return jsonify(error="No permission to edit course")
    concept_question: ConceptQuestion = ConceptQuestion.query.filter(
        (ConceptQuestion.CONCEPT == concept_id) &
        (ConceptQuestion.QUESTION == question_id)
    ).first()
    if weight != 0:  # if the relation should exist
        if concept_question is None:  # if it doesn't currently exist
            db.session.add(ConceptQuestion(concept_id, question_id, weight))
            db.session.commit()
            return jsonify(message='created relation')
        elif weight != concept_question.weight:  # if it exists, and needs to be changed
            concept_question.weight = weight
            db.session.commit()
            return jsonify(message='updated relation')
    elif concept_question is not None:  # if it shouldn't exist, but it currently does
        db.session.delete(concept_question)
        db.session.commit()
        return jsonify(message='removed relation')
    return jsonify(message='no changes made')


@ConceptRoutes.route("/getConcepts", methods=['POST'])
@teacher_only
@validate(courseID=int)
def get_concepts(course_id: int):
    user_course = UserCourse.query.filter(
        (UserCourse.COURSE == course_id) &
        (UserCourse.USER == current_user.USER)
    ).first()
    if user_course is None:
        return jsonify(error="User is not in the course")
    concepts = Concept.query.filter(Concept.COURSE == course_id).all()
    return jsonify({"concepts": [{"conceptID": concept.CONCEPT, "name": concept.name} for concept in concepts]})


@ConceptRoutes.route("/getConceptGraph", methods=['POST'])
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


@ConceptRoutes.route('/getNextLessons', methods=['POST'])
@login_required
@validate(courseID=int)
def get_next_lessons(course_id: int):
    has_access = bool(Course.query.filter(
        (course_id == Section.COURSE) & (Section.SECTION == UserSection.SECTION) & (UserSection.USER == User.USER)
    ).all())
    if not has_access and not able_view_course(course_id):
        return jsonify(error='403')

    concept_dict = get_course_graph(course_id)
    lessons = []
    for concept_id, concept_obj in concept_dict.items():
        lessons.append(concept_obj)
        concept_obj['prereqs'] = list(map(lambda x: {
            'conceptID': concept_dict[x[0]]['conceptID'],
            'name': concept_dict[x[0]]['name'],
            'weight': x[1]
        }, concept_obj['prereqs']))

    return jsonify(lessons=lessons)


@ConceptRoutes.route('/getNextQuestion', methods=['POST'])
@login_required
@validate(conceptID=int)
def get_next_question(concept_id):
    concept = Concept.query.get(concept_id)
    if concept is None:
        return jsonify(error='Concept does not exist')

    has_access = bool(Course.query.filter(
        (concept.COURSE == Section.COURSE) & (Section.SECTION == UserSection.SECTION) & (UserSection.USER == User.USER)
    ).all())
    if not has_access and not able_view_course(concept.COURSE):
        return jsonify(error='403')

    questions: List[Question] = Question.query.filter(
        (Question.QUESTION == ConceptQuestion.QUESTION) & (ConceptQuestion.CONCEPT == concept_id)
    ).all()

    question_ids = list(map(lambda x: x.QUESTION, questions))
    concept_questions: List[ConceptQuestion] = ConceptQuestion.query.filter(
        ConceptQuestion.QUESTION.in_(question_ids)
    ).all()

    concept_dict = get_course_graph(concept.COURSE)

    valid_questions = []

    for q in questions:
        include = True
        for c in concept_questions:
            if c.QUESTION == q.QUESTION and c.CONCEPT != concept_id:
                prep = concept_dict[c.CONCEPT]['preparation']
                weight = c.weight
                if weight == 2 and prep == 0 or weight == 3 and prep < 0.4 or weight == 4 and prep < 0.7:
                    include = False
                    break
        if include:
            valid_questions.append(q)

    if len(valid_questions) == 0:
        return jsonify(error='No question available')
    question: Question = choice(valid_questions)
    seed = randint(0, 65535)
    q = AvoQuestion(question.string, seed)
    return jsonify(ID=question.QUESTION, prompt=q.prompt, prompts=q.prompts, seed=seed, types=q.types)


def get_course_graph(course_id):
    concepts: List[Concept] = Concept.query.filter(
        Concept.COURSE == course_id
    ).all()

    concept_relations: List[ConceptRelation] = ConceptRelation.query.filter(
        (ConceptRelation.CHILD == Concept.CONCEPT) & (Concept.COURSE == course_id)
    ).all()

    mastery: List[Mastery] = Mastery.query.filter(
        (current_user.USER == Mastery.USER) & (Mastery.CONCEPT == Concept.CONCEPT) & (Concept.COURSE == course_id)
    ).all()

    concept_dict = {}
    for c in concepts:
        concept_dict[c.CONCEPT] = {
            'conceptID': c.CONCEPT,
            'name': c.name,
            'lesson': c.lesson_content,
            'prereqs': [],
            'mastery': 0,
            'mastery_survey': 0,
            'aptitude_survey': 0,
            'preparation': 1,
        }

    for r in concept_relations:
        concept_dict[r.CHILD]['prereqs'].append((r.PARENT, r.weight))

    for m in mastery:
        concept_dict[m.CONCEPT]['mastery'] = m.mastery_level
        concept_dict[m.CONCEPT]['mastery_survey'] = m.mastery_survey
        concept_dict[m.CONCEPT]['aptitude_survey'] = m.aptitude_survey

    for concept_id, concept_obj in concept_dict.items():
        mastery_values = list(map(lambda x: concept_dict[x[0]]['mastery'], concept_obj['prereqs']))
        weights = list(map(lambda x: x[1], concept_obj['prereqs']))
        if len(weights):
            preparation = 0
            for i in range(len(weights)):
                preparation += mastery_values[i] * weights[i]
            concept_obj['preparation'] = preparation / sum(weights)

    return concept_dict
