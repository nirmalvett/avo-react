from flask import Blueprint, jsonify
from flask_login import current_user
from server.decorators import login_required, student_only, teacher_only, validate
from server.auth import able_view_course
from server.models import Concept, ConceptQuestion, Course, db, Inquiry, Question, UserInquiry

OrganicContentRoutes = Blueprint("OrganicContentRoutes", __name__)


@OrganicContentRoutes.route('/getInquires')
@login_required
@validate(conceptID=int)
def get_inquires(concept_id:int):
    """
    Return all inquiries that the user does not own that are related to a concept
    :return list of data of Inquires
    """
    inquires_list = Inquiry.query.filter((Inquiry.INQUIRY == UserInquiry.INQUIRY) &
                                         (UserInquiry.USER == current_user.USER)).all()  # List of all inquiries of user
    return_inquiries = [
        {
            'INQUIRY': i.INQUIRY,
            'originalInquiry': i.originalInquiry,
            'editedInquiry': i.editedInquiry,
            'hasAnswered': i.hasAnswered,
            'stringifiedQuestion': i.stringifiedQuestion,
            'inquiryAnswer': i.inquiryAnswer
        }
        for i in inquires_list
    ]  # format data to return to client

    return jsonify(inquiries=return_inquiries)


@OrganicContentRoutes.route('/getAllInquiredConcepts')
@teacher_only
@validate(courseId=int)
def get_all_inquired_concepts(course_id: int):
    """
    Get all inquiries of a concept given a course ID
    """
    if not able_view_course(course_id):
        return jsonify(error="User Not Able To Access Course")
    course = Course.query.get(course_id)
    if course is None:
        return jsonify(error="Invalid Course")
    del course
    concept_list = Concept.query.filter(Concept.COURSE == course_id).all()
    concept_return_list = []
    for concept in concept_list:
        concept_json = {"ID": concept.CONCEPT, "name": concept.name}
        inquiry_list = Inquiry.query.filter(concept.CONCEPT == Inquiry.CONCEPT).all()
        answered_inquiry,  unanswered_inquiry = 0, 0
        for inquiry in inquiry_list:
            if inquiry.hasAnswered:
                answered_inquiry += 1
            else:
                unanswered_inquiry += 1
        concept_json["answered", "unanswered"] = answered_inquiry, unanswered_inquiry

        concept_return_list.append(concept_json)
    return jsonify(concepts=concept_return_list)


@OrganicContentRoutes.route('/submitInquiry', methods=['POST'])
@login_required
@validate(questionString=str, questionID=int, inquiryType=int, stringifiedQuestionObject=str)
def submit_inquiry(question_string: int, question_id: int, inquiry_type: int, stringified_question_object: str):
    concept = None
    if inquiry_type == 0:
        # Inquiry About Question
        question = Question.query.get(question_id)
        if question is None:
            return jsonify(error="Question Not Found")
        concept = Concept.query.filter((ConceptQuestion.CONCEPT == Concept.CONCEPT) &
                                        (ConceptQuestion.QUESTION == question.QUESTION)).first()
        del question
    if inquiry_type == 1:
        # Inquiry About Concept
        concept = Concept.query.get(question_id)
    if concept is None:
        return jsonify(error="Concept Not Found")
    new_inquiry = Inquiry(concept.CONCEPT, question_string, stringified_question_object)
    db.session.add(new_inquiry)
    db.session.commit()
    return jsonify({})

