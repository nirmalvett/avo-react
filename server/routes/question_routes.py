from flask import Blueprint, jsonify
from flask_login import current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion

from server.decorators import login_required, teacher_only, admin_only, validate
from server.auth import able_edit_set
from server.models import db, Set, Question, UserViewsSet

QuestionRoutes = Blueprint('QuestionRoutes', __name__)


# Get sets/questions


@QuestionRoutes.route('/getSets')
@teacher_only
def get_sets():
    """
    Get the list of Sets available to the user
    :return: The list of sets
    """
    # Get list of available sets for current user
    list_of_sets = Set.query.filter((Set.SET == UserViewsSet.SET) & (UserViewsSet.USER == current_user.USER)).all()
    set_list = []  # List of sets to send back to the user
    for s in list_of_sets:
        # For each set append the data
        questions = Question.query.filter(Question.SET == s.SET).all()  # Get all questions in set
        question_list = []  # Question data to return to client
        for q in questions:
            # For each question append the data
            question_list.append({
                'id': q.QUESTION,
                'name': q.name,
                'string': q.string,
                'total': q.total,
                'answers': q.answers
            })
        set_list.append({
            'id': s.SET,
            'name': s.name,
            'can_edit': able_edit_set(s.SET),
            'questions': question_list
        })
    return jsonify(sets=set_list)


@QuestionRoutes.route('/getAllQuestions', methods=['GET'])
@admin_only
def get_all_questions():
    """
    Gets all questions in the database and returns
    :return: List of all questions
    """
    question_list = Question.query.all()
    question_array = []
    for q in question_list:
        question_array.append(
            {
                'QUESTION': q.QUESTION,
                'SET': q.SET,
                'name': q.name,
                'string': q.string,
                'answers': q.answers,
                'total': q.total
            }
        )
    return jsonify(questions=question_array)


# Manage sets


@QuestionRoutes.route('/newSet', methods=['POST'])
@teacher_only
@validate(name=str)
def create_set(name: str):
    """
    Creates a new set
    :return: validation that the set has been added
    """
    new_set = Set(name)  # New set to be created
    db.session.add(new_set)
    db.session.commit()
    user_views_set = UserViewsSet(current_user.USER, new_set.SET, True)  # New user_views_set to be created
    db.session.add(user_views_set)
    db.session.commit()
    return jsonify(setID=new_set.SET)


@QuestionRoutes.route('/renameSet', methods=['POST'])
@teacher_only
@validate(setID=int, name=str)
def rename_set(set_id: int, name: str):
    """
    Renames a set
    :return: validation that the set has been updated
    """
    if not able_edit_set(set_id):
        # if the user isn't able to edit this set return an error JSON
        return jsonify(error="User not able to modify this data")
    new_set = Set.query.get(set_id)  # Set to be updated
    new_set.name = name
    # Add change to database
    db.session.commit()
    return jsonify({})


@QuestionRoutes.route('/deleteSet', methods=['POST'])
@teacher_only
@validate(setID=int)
def delete_set(set_id: int):
    """
    Deletes a set
    :return: validation that the set has been Deleted
    """
    try:
        user_views_set = UserViewsSet.query.filter(
            (UserViewsSet.SET == set_id) & (UserViewsSet.USER == current_user.USER)
        ).first()  # user_views_set to delete
    except NoResultFound:
        return jsonify({})
    # Add change to database
    db.session.delete(user_views_set)
    db.session.commit()
    return jsonify({})


# Manage questions


@QuestionRoutes.route('/newQuestion', methods=['POST'])
@teacher_only
@validate(setID=int, name=str, string=str, answers=int, total=int)
def new_question(set_id: int, name: str, string: str, answers: int, total: int):
    """
    Creates new Question and adds to set
    :return: ID of new question
    """
    if not able_edit_set(set_id):
        # If the user is not allowed to edit the set return error json
        return jsonify(error="User not able to edit Set")
    try:
        AvoQuestion(string, 0, [])
    except Exception:
        return jsonify(error="Question Failed to build")
    # Add Question to database
    question = Question(set_id, name, string, answers, total)
    db.session.add(question)
    db.session.commit()
    return jsonify(questionID=question.QUESTION)


@QuestionRoutes.route('/renameQuestion', methods=['POST'])
@teacher_only
@validate(questionID=int, name=str)
def rename_question(question_id: int, name: str):
    """
    Renames question
    :return: Confirmation that Question has been updated
    """
    question = Question.query.get(question_id)
    if not able_edit_set(question.SET):
        return jsonify(error="User not able to edit SET")
    question.name = name
    db.session.commit()
    return jsonify({})


@QuestionRoutes.route('/editQuestion', methods=['POST'])
@teacher_only
@validate(questionID=int, string=str, answers=int, total=int)
def edit_question(question_id: int, string: str, answers: int, total: int):
    """
    Update Question data
    :return: Confirmation that question has been updated
    """
    question = Question.query.get(question_id)
    if not able_edit_set(question.SET):
        return jsonify(error="User not able to edit SET")
    try:
        # Try to run the question to see if it works
        AvoQuestion(string, 0, [])
    except Exception:
        return jsonify(error="Question could not be created")
    # Update data for database
    question.string = string
    question.answers = answers
    question.total = total
    db.session.commit()
    return jsonify({})


@QuestionRoutes.route('/deleteQuestion', methods=['POST'])
@teacher_only
@validate(questionID=int)
def delete_question(question_id: int):
    """
    Removes Question Set Link
    :return: Confirmation that question has been removed
    """
    question = Question.query.get(question_id)
    if not able_edit_set(question.SET):
        return jsonify(error="User not able to edit SET")
    question.SET = None
    db.session.commit()
    return jsonify({})


# Generate a question


@QuestionRoutes.route('/getQuestion', methods=['POST'])
@login_required
@validate(question=int, seed=int)
def get_question(question: int, seed: int):
    """
    Get question data for client
    :return: Question data
    """
    current_question = Question.query.get(question)  # Get question from database
    if current_question is None:
        # If the question isn't found return error json if not return to client
        return jsonify(error='No question found')
    q = AvoQuestion(current_question.string, seed)
    return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types)


@QuestionRoutes.route('/sampleQuestion', methods=['POST'])
@teacher_only
@validate(string=str, seed=int)
def sample_question(string: str, seed: int):
    """
    Generates sample question
    :return: data of generated question
    """
    # if no answers were provided make false answers
    try:
        q = AvoQuestion(string, seed, [])
    except Exception as e:
        return jsonify(error="Question failed to be created", message=str(e))
    var_list = {}
    if isinstance(q.var_list, list):
        for i in range(len(q.var_list)):
            var_list[f'${i+1}'] = repr(q.var_list[i])
    else:
        for k in q.var_list:
            var_list[k] = repr(q.var_list[k])
    return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types, explanation=q.explanation, variables=var_list)


@QuestionRoutes.route('/sampleQuestionAnswers', methods=['POST'])
@teacher_only
@validate(string=str, seed=int, answers=list)
def sample_question_answers(string: str, seed: int, answers):
    """
    Generates sample question
    :return: data of generated question
    """
    # If answers were provided then test answers
    try:
        q = AvoQuestion(string, seed, answers)
    except Exception as e:
        return jsonify(error="Question failed to be created", message=str(e))
    return jsonify(prompt=q.prompt, prompts=q.prompts, types=q.types, points=q.scores)
