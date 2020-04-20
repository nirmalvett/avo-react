from flask import Blueprint, jsonify
from flask_login import current_user
from server.decorators import login_required, teacher_only, validate
from server.auth import able_view_course, able_edit_course
from server.models import Concept, ConceptQuestion, Course, db, Inquiry, Lesson, Question, UserInquiry

OrganicContentRoutes = Blueprint("OrganicContentRoutes", __name__)


@OrganicContentRoutes.route('/editInquiry', methods=['POST'])
@login_required
@validate(inquiryID=int, editedQuestion=str, hasAnswered=bool, inquiryAnswer=str)
def edit_inquiry(inquiry_id: int, edited_question: str, has_answered: bool, inquiry_answer: str):
    inquiry = Inquiry.query.get(inquiry_id)
    if inquiry is None:
        return jsonify(error="Concept not found")
    inquiry.editedInquiry = edited_question
    inquiry.hasAnswered = has_answered
    inquiry.inquiryAnswer = inquiry_answer
    db.session.commit()
    return jsonify({})


@OrganicContentRoutes.route('/getInquiries', methods=['POST'])
@login_required
@validate(inquiryType=int, questionID=int)
def get_inquires(inquiry_type: int, question_id: int):
    """
    Return all inquiries that the user does not own that are related to a concept
    :return list of data of Inquires
    """
    inquiry_list_subscribed = None
    inquiry_list_unsubscribed = None
    user_inquiry_list = UserInquiry.query.filter((UserInquiry.USER == current_user.USER)).all()
    subscribed_list = []
    for i in user_inquiry_list:
        subscribed_list.append(i.INQUIRY)
    if inquiry_type == 0:
        # Question type
        inquiry_list_subscribed = Inquiry.query.filter((Inquiry.QUESTION == question_id) &
                                                       Inquiry.INQUIRY.in_(subscribed_list)).all()
        inquiry_list_unsubscribed = Inquiry.query.filter((Inquiry.QUESTION == question_id) &
                                                         Inquiry.INQUIRY.notin_(subscribed_list)).all()
    if inquiry_type == 1:
        # Concept type
        inquiry_list_subscribed = Inquiry.query.filter((Inquiry.CONCEPT == question_id) &
                                                       Inquiry.INQUIRY.in_(subscribed_list)).all()
        inquiry_list_unsubscribed = Inquiry.query.filter((Inquiry.CONCEPT == question_id) &
                                                         Inquiry.INQUIRY.notin_(subscribed_list)).all()
    if inquiry_type == 2:
        # Lesson / Assignment type
        inquiry_list_subscribed = Inquiry.query.filter((Inquiry.LESSON == question_id) &
                                                       Inquiry.INQUIRY.in_(subscribed_list)).all()
        inquiry_list_unsubscribed = Inquiry.query.filter((Inquiry.LESSON == question_id) &
                                                         Inquiry.INQUIRY.notin_(subscribed_list)).all()
    if inquiry_list_subscribed is None and inquiry_list_unsubscribed is None:
        return jsonify(error="No inquiries found")

    return_list = [{
        'ID': i.INQUIRY,
        'CONCEPT': i.CONCEPT,
        'QUESTION': i.QUESTION,
        'originalInquiry': i.originalInquiry,
        'editedInquiry': i.editedInquiry,
        'inquiryType': i.inquiryType,
        'hasAnswered': i.hasAnswered,
        'timeCreated': i.timeCreated,
        'stringifiedQuestion': i.stringifiedQuestion,
        'inquiryAnswer': i.inquiryAnswer,
        'subscribed': False
    } for i in inquiry_list_unsubscribed]

    for i in inquiry_list_subscribed:
        return_list.append({
            'ID': i.INQUIRY,
            'CONCEPT': i.CONCEPT,
            'QUESTION': i.QUESTION,
            'originalInquiry': i.originalInquiry,
            'editedInquiry': i.editedInquiry,
            'inquiryType': i.inquiryType,
            'hasAnswered': i.hasAnswered,
            'timeCreated': i.timeCreated,
            'stringifiedQuestion': i.stringifiedQuestion,
            'inquiryAnswer': i.inquiryAnswer,
            'subscribed': True
        })

    return jsonify(return_list)


@OrganicContentRoutes.route('/getAllInquiredConcepts', methods=['POST'])
@teacher_only
@validate(courseID=int)
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
    lesson_list = Lesson.query.filter(Lesson.COURSE == course_id).all()
    concept_return_list = []
    lesson_return_list = []
    for concept in concept_list:
        concept_json = {"ID": concept.CONCEPT, "name": concept.name}
        inquiry_list = Inquiry.query.filter(concept.CONCEPT == Inquiry.CONCEPT).all()
        answered_inquiry, unanswered_inquiry = 0, 0
        for inquiry in inquiry_list:
            if inquiry.hasAnswered:
                answered_inquiry += 1
            else:
                unanswered_inquiry += 1
        concept_json["answered"] = answered_inquiry
        concept_json['unanswered'] = unanswered_inquiry

        concept_return_list.append(concept_json)
    for lesson in lesson_list:
        lesson_json = {"ID": lesson.LESSON, "name": lesson.name}
        inquiry_list = Inquiry.query.filter(lesson.LESSON == Inquiry.LESSON).all()
        answered_inquiry, unanswered_inquiry = 0, 0
        for inquiry in inquiry_list:
            if inquiry.hasAnswered:
                answered_inquiry += 1
            else:
                unanswered_inquiry += 1
        lesson_json["answered"] = answered_inquiry
        lesson_json['unanswered'] = unanswered_inquiry

        lesson_return_list.append(lesson_json)
    return jsonify(concepts=concept_return_list, lessons=lesson_return_list)


@OrganicContentRoutes.route('/getAllSubscribedOwnedInquiries', methods=['POST'])
@login_required
def get_all_subscribed_owned_inquiries():
    user_inquiry_list = UserInquiry.query.filter((UserInquiry.USER == current_user.USER)).all()
    subscribed_list = []
    for i in user_inquiry_list:
        subscribed_list.append(i.USER_INQUIRY)
    inquiry_list = Inquiry.query.filter(UserInquiry.USER_INQUIRY.in_(subscribed_list)).all()

    if inquiry_list is None:
        return jsonify(error="No inquiries found")

    return_list = [{
        'ID': i.INQUIRY,
        'CONCEPT': i.CONCEPT,
        'QUESTION': i.QUESTION,
        'originalInquiry': i.originalInquiry,
        'editedInquiry': i.editedInquiry,
        'inquiryType': i.inquiryType,
        'hasAnswered': i.hasAnswered,
        'timeCreated': i.timeCreated,
        'stringifiedQuestion': i.stringifiedQuestion,
        'inquiryAnswer': i.inquiryAnswer
    } for i in inquiry_list]

    return jsonify(return_list)


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
        if concept is None:
            return jsonify(error="Concept Not Found")
        del question
    if inquiry_type == 1:
        # Inquiry About Concept
        concept = Concept.query.get(question_id)
        if concept is None:
            return jsonify(error="Concept Not Found")
    if inquiry_type == 2:
        lesson = Lesson.query.get(question_id)
        if lesson is None:
            return jsonify(error='Lesson not found')
    if inquiry_type == 0:
        new_inquiry = Inquiry(question_string, inquiry_type, stringified_question_object, question=question_id)
    elif inquiry_type == 1:
        new_inquiry = Inquiry(question_string, inquiry_type, stringified_question_object, concept=question_id)
    else:
        new_inquiry = Inquiry(question_string, inquiry_type, stringified_question_object, lesson=question_id)
    db.session.add(new_inquiry)
    db.session.commit()
    db.session.add(UserInquiry(current_user.USER, new_inquiry.INQUIRY, True))
    db.session.commit()
    return jsonify({})


@OrganicContentRoutes.route('/subscribeInquiry', methods=['POST'])
@login_required
@validate(inquiryID=int)
def subscribe_inquiry(inquiry_id: int):
    inquiry = Inquiry.query.get(inquiry_id)
    if inquiry is None:
        return jsonify(error="Inquiry Not Found")
    inquiry_relation = UserInquiry.query.filter((UserInquiry.USER == current_user.USER) &
                                                (UserInquiry.INQUIRY == inquiry_id)).first()
    if inquiry_relation is not None:
        return jsonify({})
    inquiry_relation = UserInquiry(current_user.USER, inquiry_id)
    db.session.add(inquiry_relation)
    db.session.commit()
    return jsonify({})


@OrganicContentRoutes.route('/toggleOrganicContent', methods=['POST'])
@teacher_only
@validate(courseID=int)
def toggle_organic_content(course_id: int):
    course = Course.query.get(course_id)
    if course is None:
        return jsonify(error="Course Not Found")
    if not able_edit_course(course_id):
        return jsonify(error="User Not Authorised To Edit Course")
    course.organic_content_enabled = not course.organic_content_enabled
    db.session.commit()
    return jsonify(toggle=course.organic_content_enabled)


@OrganicContentRoutes.route('/unsubscribeInquiry', methods=['POST'])
@login_required
@validate(inquiryID=int)
def unsubscribe_inquiry(inquiry_id: int):
    inquiry = Inquiry.query.get(inquiry_id)
    if inquiry is None:
        return jsonify(error="Inquiry Not Found")
    inquiry_relation = UserInquiry.query.filter((UserInquiry.USER == current_user.USER) &
                                                (UserInquiry.INQUIRY == inquiry_id)).first()
    if inquiry_relation is None:
        return jsonify({})
    db.session.delete(inquiry_relation)
    db.session.commit()
    return jsonify({})
