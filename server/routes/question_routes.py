from flask import Blueprint, jsonify

from server.MathCode.question import AvoQuestion
from server.auth import able_edit_set
from server.decorators import login_required, teacher_only, admin_only, validate
from server.helpers import question_has_errors
from server.models import db, Question

QuestionRoutes = Blueprint('QuestionRoutes', __name__)


# Get sets/questions

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
        return jsonify(error="User not able to edit Set")
    if question_has_errors(string):
        return jsonify(error="Question Failed to build")
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
    if question_has_errors(string):
        return jsonify(error="Question could not be created")
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
@validate(questionID=int, seed=int)
def get_question(question_id: int, seed: int):
    """
    Get question data for client
    :return: Question data
    """
    question = Question.query.get(question_id)  # Get question from database
    if question is None:
        return jsonify(error='No question found')
    q = AvoQuestion(question.string, seed)
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


@QuestionRoutes.route('/changeCategory', methods=['POST'])
@teacher_only
@validate(questionID=int, category=int)
def change_category(question_id: int, category: int):
    question = Question.query.get(question_id)
    if not able_edit_set(question.SET):
        return jsonify(error="User not able to edit SET")
    question.category = category
    db.session.commit()
    return jsonify({})
