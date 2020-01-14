from typing import List
from flask import url_for
from flask_login import LoginManager, current_user
from datetime import datetime
import config
from server.models import User, UserCourse, UserSection, QuestionSet, Concept
from itsdangerous import URLSafeTimedSerializer, BadSignature
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

login_manager = LoginManager()
login_manager.login_view = "FileRoutes.serve_web_app"


@login_manager.user_loader
def load_user(user_id):
    """
    Callback function for Flask Login logs in user
    :param user_id: the id of the user being logged in
    :return: a user object for Flask Login
    """
    return User.query.filter((User.email == str(user_id))).first()


def able_edit_set(set_id):
    """
    Checks if current_user can edit selected set
    :param set_id: Set to check if user can edit
    :return: True if user can edit false if not
    """
    user_course: UserCourse = UserCourse.query.filter(
        (set_id == QuestionSet.QUESTION_SET) &
        (QuestionSet.COURSE == UserCourse.COURSE) &
        (UserCourse.USER == current_user.USER)
    ).first()
    return user_course is not None and user_course.can_edit


def able_edit_course(course_id):
    user_course = UserCourse.query.filter(
        (course_id == UserCourse.COURSE) & (UserCourse.USER == current_user.USER)
    ).first()
    return user_course is not None and user_course.can_edit


def able_view_course(course_id):
    user_section = UserCourse.query.filter(
        (UserCourse.USER == current_user.USER) & (UserCourse.COURSE == course_id)
    ).first()
    return user_section is not None


def able_edit_concept(concept_id):
    user_course = UserCourse.query.filter(
        (concept_id == Concept.CONCEPT) &
        (Concept.COURSE == UserCourse.COURSE) &
        (UserCourse.USER == current_user.USER) &
        UserCourse.can_edit
    ).first()
    return user_course is not None and user_course.can_edit


class SectionRelations:
    def __init__(self, section_id: int, user_id: int = None):
        user_id = user_id or current_user.USER  # fill in with current user id if missing
        relations: List[UserSection] = UserSection.query.filter(
            (UserSection.USER == user_id) & (UserSection.SECTION == section_id)
        ).all()
        now = datetime.now()
        active = filter(lambda x: x.expiry is None or x.expiry > now, relations)
        expired = filter(lambda x: x.expiry is not None and x.expiry < now, relations)
        self.active = set(map(lambda x: x.user_type, active))
        self.expired = set(map(lambda x: x.user_type, expired))
        self.all = set(map(lambda x: x.user_type, relations))


def get_url(email: str, route: str):
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    token = serializer.dumps(email, salt=config.SECURITY_PASSWORD_SALT)
    return url_for(route, token=token, _external=True)


def validate_token(token, max_age_seconds: int = None):
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    try:
        if max_age_seconds is None:
            return serializer.loads(token, salt=config.SECURITY_PASSWORD_SALT)
        else:
            return serializer.loads(token, salt=config.SECURITY_PASSWORD_SALT, max_age=max_age_seconds)
    except BadSignature:
        return None


def send_email(recipient: str, subject: str, message: str):
    """
    Sends email to a client
    :param recipient: The person to receive the email
    :param subject: The subject of the email
    :param message: HTML of the email
    """
    message = Mail(
        from_email='contact@avocadocore.com',
        to_emails=recipient,
        subject=subject,
        html_content=message)
    sg = SendGridAPIClient(config.SENDGRID_API_KEY)
    sg.send(message)
