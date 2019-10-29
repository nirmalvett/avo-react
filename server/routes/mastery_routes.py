from datetime import datetime
from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user

from server.MathCode.question import AvoQuestion
from server.decorators import login_required, validate
from server.models import Mastery, db, Question, ConceptQuestion, MasteryHistory

MasteryRoutes = Blueprint('MasteryRoutes', __name__)


@MasteryRoutes.route("/postQuestionSurvey", methods=['POST'])
@login_required
@validate(conceptID=int, mastery=int, aptitude=int)
def post_question_survey(concept_id: int, mastery: int, aptitude: int):
    mastery_obj = Mastery.query.filter((Mastery.CONCEPT == concept_id) & (Mastery.USER == current_user.USER)).first()
    if mastery_obj is None:
        db.session.add(Mastery(concept_id, current_user.USER, 0, mastery, aptitude))
    else:
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
    concept_questions: List[ConceptQuestion] = ConceptQuestion.query.filter(
        ConceptQuestion.QUESTION == question_id
    ).all()
    mastery: List[Mastery] = Mastery.query.filter(
        (Mastery.USER == current_user.USER) &
        (Mastery.CONCEPT == ConceptQuestion.CONCEPT) &
        (ConceptQuestion.QUESTION == question_id)
    ).all()

    weight_dict = {}
    for c in concept_questions:
        weight_dict[c.CONCEPT] = c.weight

    missing_concept_ids = set(weight_dict.keys())
    for m in mastery:
        missing_concept_ids.remove(m.CONCEPT)

    for c in missing_concept_ids:
        m = Mastery(c, current_user.USER, 0, 0, 0)
        db.session.add(m)
        mastery.append(m)
    db.session.commit()

    grade = 2 * q.score / sum(q.totals) - 1  # their grade ranges from -1 to 1

    mastery_return = {}
    for m in mastery:
        # <magic>
        aptitude_factor = (m.aptitude_survey + 3) / 6 if m.aptitude_survey != 0 else 1
        weight_factor = weight_dict[m.CONCEPT] / 4
        baseline_change = 0.4
        new_mastery = max(0, min(1, m.mastery_level + grade * weight_factor * aptitude_factor * baseline_change))
        # </magic>
        m.mastery_level = new_mastery
        db.session.add(MasteryHistory(m.MASTERY, new_mastery, datetime.now()))
        mastery_return[m.CONCEPT] = new_mastery
    db.session.commit()

    return jsonify(explanation=q.explanation, points=q.scores, totals=q.totals, mastery=mastery_return)
