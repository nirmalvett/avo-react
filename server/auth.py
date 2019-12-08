from typing import List

from flask import url_for
from flask_login import LoginManager, current_user
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
import config
from server.models import User, UserCourse, UserSection, QuestionSet, Concept
from itsdangerous import URLSafeTimedSerializer, BadSignature
import smtplib, ssl

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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


def send_gmail(recipient: str, subject: str, html: str, sender: str, password: str):
    sender_email = sender
    receiver_email = recipient

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email

    # Create the plain-text and HTML version of your message

    # Turn these into plain/html MIMEText objects
    html = MIMEText(html, "html")

    # Add HTML/plain-text parts to MIMEMultipart message
    # The email client will try to render the last part first
    message.attach(html)

    # Create secure connection with server and send email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(
            sender_email, receiver_email, message.as_string()
        )


def send_email(recipient: str, subject: str, message: str):
    """
    Sends email to a client
    :param recipient: The person to receive the email
    :param subject: The subject of the email
    :param message: HTML of the email
    """
    send_gmail(
        recipient,
        subject,
        message,
        config.EMAIL,
        config.EMAIL_PASSWORD
    )
    # try:
    #     sender, password = config.EMAIL, config.EMAIL_PASSWORD
    # except AttributeError:
    #     return print(f'Sending email to {recipient}\nSubject: {subject}\n{message}\n')
    # msg = MIMEMultipart()
    # msg['From'], msg['To'], msg['Subject'] = sender, recipient, subject  # Sets To From Subject values
    # msg.attach(MIMEText(message, 'html'))
    # # noinspection SpellCheckingInspection
    # # Sends email with given configuration
    # server = SMTP('smtp.zoho.com', 587)
    # server.ehlo()
    # server.starttls()
    # server.ehlo()
    # server.login(sender, password)
    # server.sendmail(sender, recipient, msg.as_string())
