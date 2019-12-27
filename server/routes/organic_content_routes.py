from flask import Blueprint, jsonify
from flask_login import current_user
from server.decorators import login_required, teacher_only, validate
from server.models import db, Inquiry, UserInquiry

OrganicContentRoutes = Blueprint("OrganicContentRoutes", __name__)


@OrganicContentRoutes.route('/getInquires')
@login_required
@validate()
def get_inquires():
    """
    Gets all Inquires for the current user
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


@OrganicContentRoutes.route('getAllInquiredConcepts')
@teacher_only
@validate(courseId=int)
def get_all_inquired_concepts(course_id: int):
    """
    Get all inquiries of a concept given a course ID
    """
    

