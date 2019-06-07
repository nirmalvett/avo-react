from flask_login import LoginManager, current_user
from sqlalchemy.orm.exc import NoResultFound
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
import config
from server.models import User, Class, Transaction, UserViewsSet

login_manager = LoginManager()
login_manager.login_view = "FileRoutes.serve_web_app"


@login_manager.user_loader
def load_user(user_id):
    """
    Callback function for Flask Login logs in user
    :param user_id: the id of the user being logged in
    :return: a user object for Flask Login
    """
    return User.query.get(user_id)


def teaches_class(class_id):
    """
    Helper function to test if teacher teaches class
    :param class_id: The class ID to test
    :return: True if the user is teaching the class False if not
    """
    current_class = Class.query.get(class_id)  # Gets the class from the class ID
    if current_class is None:
        return False
    if current_user.USER == current_class.USER:
        # If the current user teaches the class then return true if not return False
        return True
    transaction = Transaction.query.filter((Transaction.CLASS == class_id) &
                                           (Transaction.USER == current_user.USER)).all()
    for i in range(len(transaction)):
        if transaction[i].TRANSACTION.startswith('TEACHER-'):
            return True
    return False


def enrolled_in_class(class_id):
    """
    Checks if the current user is enrolled in a given class
    :param class_id: The class ID to check against
    :return: True if the user is enrolled False if not
    """
    try:
        # Get all classes user is enrolled in
        current_class = Class.query.filter((Class.CLASS == Transaction.CLASS) &
                                           (current_user.USER == Transaction.USER)).all()
        if len(current_class) == 0:
            return False
        for i in range(len(current_class)):
            if current_class[i].CLASS == class_id:
                return True
        return False
    except NoResultFound:
        return False


def access_to_class(class_id):
    """
    Checks if the user is either the teacher of the class or if the user is enrolled and not expired
    :param class_id: The ID of the class to check
    :return: True if the user has access False if they do not
    """
    if enrolled_in_class(class_id):
        # If the user is enrolled in the class at all see if they have a valid transaction
        transaction_list = Transaction.query.filter((Transaction.USER == current_user.USER) &
                                                    (Transaction.CLASS == class_id)).all()  # all transaction of user
        if current_user.is_teacher:
            # If the current user is a teacher and enrolled then return True as teacher dont pay
            return True
        time = datetime.now()  # Current time
        for i in transaction_list:
            # For each transaction check if they are not expired
            if i.expiration is None:
                # If the transaction has no expiration return True
                return True
            if i.expiration > time:
                # If the transaction has not expired return True
                return True
    return False


def able_edit_set(set_id):
    """
    Checks if current_user can edit selected set
    :param set_id: Set to check if user can edit
    :return: True if user can edit false if not
    """
    try:
        user_views_set = UserViewsSet.query.filter((set_id == UserViewsSet.SET)
                                                   & (current_user.USER == UserViewsSet.USER)).first()
    except NoResultFound:
        return False
    return user_views_set.can_edit


def send_email(recipient: str, subject: str, message: str):
    """
    Sends email to a client
    :param recipient: The person to receive the email
    :param subject: The subject of the email
    :param message: HTML of the email
    """
    sender = config.EMAIL  # Sets the sender of no-reply
    msg = MIMEMultipart()
    msg['From'], msg['To'], msg['Subject'] = sender, recipient, subject  # Sets To From Subject values
    msg.attach(MIMEText(message, 'html'))
    # noinspection SpellCheckingInspection
    # Sends email with given configuration
    server = SMTP('smtp.zoho.com', 587)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(sender, config.EMAIL_PASSWORD)
    server.sendmail(sender, recipient, msg.as_string())
