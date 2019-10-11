from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user

from server.MathCode.question import AvoQuestion
from server.decorators import login_required, validate
from server.models import Mastery, db, Question

MasteryRoutes = Blueprint('MasteryRoutes', __name__)


@MasteryRoutes.route("/postQuestionSurvey", methods=['POST'])
@login_required
@validate(conceptID=int, mastery=int, aptitude=int)
def post_question_survey(concept_id: int, mastery: int, aptitude: int):
    mastery_obj = Mastery.query.filter((Mastery.CONCEPT == concept_id) & (Mastery.USER == current_user.USER)).first()
    if mastery_obj is None:
        return jsonify(error='Mastery record not found')
    mastery_obj.mastery_survey = mastery
    mastery_obj.aptitude_survey = aptitude
    db.session.commit()
    return jsonify({})


@MasteryRoutes.route("/wrongAnswerSurvey", methods=['POST'])
@login_required
@validate(questionID=int, concepts=list)
def wrong_answer_survey(question_id: int, concepts: list):
    # todo
    return jsonify({})


@MasteryRoutes.route('/submitQuestion', methods=['POST'])
@login_required
@validate(questionID=int, seed=int, answers=list)
def submit_question(question_id: int, seed: int, answers: List[str]):
    question = Question.query.get(question_id)
    try:
        q = AvoQuestion(question.string, seed, answers)
    except Exception as e:
        return jsonify(error="Question failed to be created", message=str(e))
    # todo: do something to update mastery
    return jsonify(explanation=q.explanation, points=q.scores, totals=q.totals)
