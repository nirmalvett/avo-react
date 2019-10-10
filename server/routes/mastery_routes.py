from flask import Blueprint, jsonify
from flask_login import current_user

from server.decorators import login_required, validate
from server.models import Mastery, db

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
def post_question_survey(question_id: int, concepts: list):
    # todo
    return jsonify({})
