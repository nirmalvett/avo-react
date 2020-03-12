from typing import Dict, Any

from flask_login import UserMixin
from flask_login._compat import unicode
from flask_sqlalchemy import SQLAlchemy
from git import Repo

from server.PasswordHash import generate_salt, hash_password
from datetime import datetime

import json

from server.helpers import random_key

db = SQLAlchemy()


class Announcement(db.Model):
    __tablename__ = 'ANNOUNCEMENT'

    ANNOUNCEMENT = db.Column(db.Integer, primary_key=True, autoincrement=True)
    SECTION = db.Column(db.Integer, db.ForeignKey('SECTION.SECTION'), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    header = db.Column(db.String(200), nullable=False)
    body = db.Column(db.String(1000), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    SECTION_RELATION = db.relationship('Section', back_populates='ANNOUNCEMENT_RELATION')
    USER_RELATION = db.relationship('User', back_populates='ANNOUNCEMENT_RELATION')

    def __init__(self, section_id, user_id, header, body, timestamp):
        self.SECTION = section_id
        self.USER = user_id
        self.header = header
        self.body = body
        self.timestamp = timestamp

    def __repr__(self):
        return f'<Announcement {self.ANNOUNCEMENT} {self.SECTION} {self.USER} {self.header} {self.body}' \
               f' {self.timestamp}>'


class Concept(db.Model):
    __tablename__ = 'CONCEPT'

    CONCEPT = db.Column(db.Integer, primary_key=True, autoincrement=True)
    COURSE = db.Column(db.Integer, db.ForeignKey('COURSE.COURSE'), nullable=False)
    name = db.Column(db.String(45), nullable=False)
    concept_type = db.Column(db.Integer, nullable=False, default=0)
    lesson_content = db.Column(db.String(5000), nullable=False)

    CONCEPT_QUESTION_RELATION = db.relationship('ConceptQuestion', back_populates='CONCEPT_RELATION')
    CONCEPT_PARENT_RELATION = db.relationship(
        'ConceptRelation', back_populates='CONCEPT_PARENT_RELATION', foreign_keys='ConceptRelation.PARENT'
    )
    CONCEPT_CHILD_RELATION = db.relationship(
        'ConceptRelation', back_populates='CONCEPT_CHILD_RELATION', foreign_keys='ConceptRelation.CHILD'
    )
    COURSE_RELATION = db.relationship('Course', back_populates='CONCEPT_RELATION')
    INQUIRY_RELATION = db.relationship('Inquiry', back_populates='CONCEPT_RELATION')
    LESSON_RELATION = db.relationship('Lesson', back_populates='CONCEPT_RELATION')
    MASTERY_RELATION = db.relationship('Mastery', back_populates='CONCEPT_RELATION')

    def __init__(self, course_id, name, concept_type, lesson_content):
        self.COURSE = course_id
        self.name = name
        self.concept_type = concept_type
        self.lesson_content = lesson_content

    def __repr__(self):
        return f'<Concept {self.CONCEPT} {self.COURSE} {self.name} {self.concept_type} {self.lesson_content}>'


class ConceptQuestion(db.Model):
    __tablename__ = 'concept_question'

    CONCEPT_QUESTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CONCEPT = db.Column(db.Integer, db.ForeignKey('CONCEPT.CONCEPT'), nullable=False)
    QUESTION = db.Column(db.Integer, db.ForeignKey('QUESTION.QUESTION'), nullable=False)
    weight = db.Column(db.Integer, nullable=False)

    CONCEPT_RELATION = db.relationship('Concept', back_populates='CONCEPT_QUESTION_RELATION')
    QUESTION_RELATION = db.relationship('Question', back_populates='CONCEPT_QUESTION_RELATION')

    def __init__(self, concept, question, weight):
        self.CONCEPT = concept
        self.QUESTION = question
        self.weight = weight

    def __repr__(self):
        return f'<ConceptQuestion {self.CONCEPT_QUESTION} {self.CONCEPT} {self.QUESTION} {self.weight}>'


class ConceptRelation(db.Model):
    __tablename__ = 'concept_relation'

    CONCEPT_RELATION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    PARENT = db.Column(db.Integer, db.ForeignKey('CONCEPT.CONCEPT'), nullable=False)
    CHILD = db.Column(db.Integer, db.ForeignKey('CONCEPT.CONCEPT'), nullable=False)
    concept_type = db.Column(db.Integer, nullable=False, default=0)
    weight = db.Column(db.Integer, nullable=False)

    CONCEPT_PARENT_RELATION = db.relationship(
        'Concept', back_populates='CONCEPT_PARENT_RELATION', foreign_keys=[PARENT]
    )
    CONCEPT_CHILD_RELATION = db.relationship('Concept', back_populates='CONCEPT_CHILD_RELATION', foreign_keys=[CHILD])

    def __init__(self, parent_id, child_id, concept_type, weight):
        self.PARENT = parent_id
        self.CHILD = child_id
        self.concept_type = concept_type
        self.weight = weight

    def __repr__(self):
        return f'<ConceptRelation {self.CONCEPT_RELATION} {self.PARENT} {self.CHILD} {self.concept_type} {self.weight}>'


class Conversation(db.Model):
    __tablename__ = 'CONVERSATION'

    CONVERSATION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False)

    MESSAGE_RELATION = db.relationship('Message', back_populates='CONVERSATION_RELATION')
    USER_CONVERSATION_RELATION = db.relationship('UserConversation', back_populates='CONVERSATION_RELATION')

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<Conversation {self.CONVERSATION} {self.name}>'


class Course(db.Model):
    __tablename__ = 'COURSE'

    COURSE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(45), nullable=False)
    is_open = db.Column(db.Boolean, nullable=False)

    CONCEPT_RELATION = db.relationship('Concept', back_populates='COURSE_RELATION')
    LESSON_RELATION = db.relationship('Lesson', back_populates='COURSE_RELATION')
    QUESTION_SET_RELATION = db.relationship('QuestionSet', back_populates='COURSE_RELATION')
    SECTION_RELATION = db.relationship('Section', back_populates='COURSE_RELATION')
    USER_COURSE_RELATION = db.relationship('UserCourse', back_populates='COURSE_RELATION')

    def __init__(self, name, is_open):
        self.name = name
        self.is_open = is_open

    def __repr__(self):
        return f'<Course {self.COURSE} {self.name} {self.is_open}>'


class Discount(db.Model):
    __tablename__ = 'DISCOUNT'

    DISCOUNT = db.Column(db.String(10), primary_key=True)
    SECTION = db.Column(db.Integer, db.ForeignKey('SECTION.SECTION'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    single_use = db.Column(db.Boolean, nullable=False, default=False)

    SECTION_RELATION = db.relationship('Section', back_populates='DISCOUNT_RELATION')

    def __init__(self, section_id, price, single_use=False):
        self.DISCOUNT = Discount._generate_key()
        self.SECTION = section_id
        self.price = price
        self.single_use = single_use

    @staticmethod
    def _generate_key():
        key = random_key(10)
        taken = Discount.query.get(key) is not None
        while taken:
            key = random_key(10)
            taken = Discount.query.get(key) is not None
        return key

    def __repr__(self):
        return f'<Discount {self.DISCOUNT} {self.SECTION} {self.price} {self.single_use}>'


class Feedback(db.Model):
    __tablename__ = 'FEEDBACK'

    FEEDBACK = db.Column(db.Integer, primary_key=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    message = db.Column(db.String(2000), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    commit = db.Column(db.String(40), nullable=False)

    USER_RELATION = db.relationship('User', back_populates='FEEDBACK_RELATION')

    def __init__(self, user_id, message):
        self.USER = user_id
        self.message = message
        self.timestamp = datetime.now()
        self.commit = str(Repo().head.commit)

    def __repr__(self):
        return f'<Feedback {self.FEEDBACK} {self.USER} {self.message} {self.timestamp}>'


class ForumMessage(db.Model):
    __tablename__ = 'FORUM_MESSAGE'

    FORUM_MESSAGE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'))
    PARENT = db.Column(db.Integer, db.ForeignKey('FORUM_MESSAGE.FORUM_MESSAGE'))
    message = db.Column(db.String(2048))
    status = db.Column(db.Integer, nullable=False, default=0)
    timestamp = db.Column(db.DateTime, nullable=False)

    USER_RELATION = db.relationship('User', back_populates='FORUM_MESSAGE_RELATION')
    r1 = db.relationship("ForumMessage", backref=db.backref('r2'), remote_side=[FORUM_MESSAGE])

    def __init__(self, user_id, parent_id, message, status, timestamp):
        self.USER = user_id
        self.PARENT = parent_id
        self.message = message
        self.status = status
        self.timestamp = timestamp

    def __repr__(self):
        return f'<ForumMessage {self.FORUM_MESSAGE} {self.USER} {self.PARENT} {self.message} {self.status}' \
               f' {self.timestamp}>'


class Image(db.Model):
    __tablename__ = 'IMAGE'

    IMAGE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'))
    name = db.Column(db.String(200))
    url = db.Column(db.String(1000))

    USER_RELATION = db.relationship('User', back_populates='IMAGE_RELATION')

    def __init__(self, user_id: int, url: str, name: str):
        self.USER = user_id
        self.url = url
        self.name = name

    def __repr__(self):
        return f'<Image {self.IMAGE} {self.USER} {self.name} {self.url}>'


class Inquiry(db.Model):
    __tablename__ = 'INQUIRY'

    INQUIRY = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CONCEPT = db.Column(db.Integer, db.ForeignKey('CONCEPT.CONCEPT'), nullable=True)
    QUESTION = db.Column(db.Integer, db.ForeignKey('QUESTION.QUESTION'), nullable=True)
    originalInquiry = db.Column(db.Text, nullable=False)
    editedInquiry = db.Column(db.TEXT, nullable=False, default="")
    inquiryType = db.Column(db.Boolean, nullable=False)
    timeCreated = db.Column(db.DATETIME, nullable=True)
    hasAnswered = db.Column(db.Boolean, nullable=False, default=False)
    stringifiedQuestion = db.Column(db.TEXT, nullable=False, default="")
    inquiryAnswer = db.Column(db.TEXT, nullable=False, default="")

    CONCEPT_RELATION = db.relationship('Concept', back_populates='INQUIRY_RELATION')
    QUESTION_RELATION = db.relationship('Question', back_populates='INQUIRY_RELATION')
    USER_INQUIRY_RELATION = db.relationship('UserInquiry', back_populates='INQUIRY_RELATION')

    def __init__(self, original_inquiry, inquiry_type, stringified_question, concept=None, question=None):
        self.CONCEPT = concept
        self.QUESTION = question
        self.originalInquiry = original_inquiry
        self.editedInquiry = None
        self.inquiryType = inquiry_type
        self.timeCreated = datetime.now()
        self.hasAnswered = False
        self.stringifiedQuestion = stringified_question
        self.inquiryAnswer = None

    def __repr__(self):
        return f'Inquiry {self.INQUIRY} {self.originalInquiry} {self.editedInquiry} {self.hasAnswered} ' \
               f'{self.stringifiedQuestion} {self.inquiryAnswer}'


class Issue(db.Model):
    __tablename__ = 'ISSUE'

    ISSUE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ISSUE_HUB = db.Column(db.Integer, db.ForeignKey('ISSUE_HUB.ISSUE_HUB'), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    message = db.Column(db.String(512), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=0)
    timestamp = db.Column(db.DateTime, nullable=False)

    ISSUE_HUB_RELATION = db.relationship('IssueHub', back_populates='ISSUE_RELATION')
    USER_RELATION = db.relationship('User', back_populates='ISSUE_RELATION')

    def __init__(self, hub_id, user_id, message, status, timestamp):
        self.ISSUE_HUB = hub_id
        self.USER = user_id
        self.message = message
        self.status = status
        self.timestamp = timestamp

    def __repr__(self):
        return f'<Issue {self.ISSUE} {self.ISSUE_HUB} {self.USER} {self.message} {self.status} {self.timestamp}>'


class IssueHub(db.Model):
    __tablename__ = 'ISSUE_HUB'

    ISSUE_HUB = db.Column(db.Integer, primary_key=True, autoincrement=True)

    ISSUE_RELATION = db.relationship('Issue', back_populates='ISSUE_HUB_RELATION')

    def __init__(self):
        pass

    def __repr__(self):
        return f'<IssueHub {self.ISSUE_HUB}>'


class Lesson(db.Model):
    __tablename__ = 'LESSON'

    LESSON = db.Column(db.Integer, primary_key=True, autoincrement=True)
    COURSE = db.Column(db.Integer, db.ForeignKey('COURSE.COURSE'))
    CONCEPT = db.Column(db.Integer, db.ForeignKey('CONCEPT.CONCEPT'), nullable=False)
    content = db.Column(db.String(16384), nullable=False)

    COURSE_RELATION = db.relationship('Course', back_populates='LESSON_RELATION')
    CONCEPT_RELATION = db.relationship('Concept', back_populates='LESSON_RELATION')

    def __init__(self, course_id: int, concept_id: int, content: str):
        self.COURSE = course_id
        self.CONCEPT = concept_id
        self.content = content

    def __repr__(self):
        return f'<Lesson {self.LESSON} {self.COURSE} {self.CONCEPT} {self.content}>'


class Mastery(db.Model):
    __tablename__ = 'mastery'

    MASTERY = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CONCEPT = db.Column(db.Integer, db.ForeignKey('CONCEPT.CONCEPT'), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    mastery_level = db.Column(db.Float, nullable=False)
    mastery_survey = db.Column(db.Integer, nullable=False)
    aptitude_survey = db.Column(db.Integer, nullable=False)

    CONCEPT_RELATION = db.relationship('Concept', back_populates='MASTERY_RELATION')
    MASTERY_HISTORY_RELATION = db.relationship('MasteryHistory', back_populates='MASTERY_RELATION')
    USER_RELATION = db.relationship('User', back_populates='MASTERY_RELATION')

    def __init__(self, concept_id, user_id, mastery_level, mastery_survey, aptitude_survey):
        self.CONCEPT = concept_id
        self.USER = user_id
        self.mastery_level = mastery_level
        self.mastery_survey = mastery_survey
        self.aptitude_survey = aptitude_survey

    def __repr__(self):
        return (
            f'<Mastery {self.MASTERY} {self.CONCEPT} {self.USER} {self.mastery_level} {self.mastery_survey}'
            f' {self.aptitude_survey}>'
        )


class MasteryHistory(db.Model):
    __tablename__ = 'mastery_history'

    MASTERY_HISTORY = db.Column(db.Integer, primary_key=True, autoincrement=True)
    MASTERY = db.Column(db.Integer, db.ForeignKey('mastery.MASTERY'), nullable=False)
    mastery_level = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    MASTERY_RELATION = db.relationship('Mastery', back_populates='MASTERY_HISTORY_RELATION')

    def __init__(self, mastery, mastery_level, timestamp):
        self.MASTERY = mastery
        self.mastery_level = mastery_level
        self.timestamp = timestamp

    def __repr__(self):
        return f'<MasteryHistory {self.MASTERY_HISTORY} {self.MASTERY} {self.mastery_level} {self.timestamp}>'


class Message(db.Model):
    __tablename__ = 'MESSAGE'

    MESSAGE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CONVERSATION = db.Column(db.Integer, db.ForeignKey('CONVERSATION.CONVERSATION'), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    content = db.Column(db.String(512), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    CONVERSATION_RELATION = db.relationship('Conversation', back_populates='MESSAGE_RELATION')
    USER_RELATION = db.relationship('User', back_populates='MESSAGE_RELATION')

    def __init__(self, conversation, user_id, content, timestamp):
        self.CONVERSATION = conversation
        self.USER = user_id
        self.content = content
        self.timestamp = timestamp

    def __repr__(self):
        return f'<Message {self.MESSAGE} {self.CONVERSATION} {self.USER} {self.content} {self.timestamp}'


class Payment(db.Model):
    __tablename__ = 'payment'

    PAYMENT = db.Column(db.String(30), primary_key=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    SECTION = db.Column(db.Integer, db.ForeignKey('SECTION.SECTION'), nullable=False)

    SECTION_RELATION = db.relationship('Section', back_populates='PAYMENT_RELATION')
    USER_RELATION = db.relationship('User', back_populates='PAYMENT_RELATION')

    def __init__(self, payment, user, section):
        self.PAYMENT = payment
        self.USER = user
        self.SECTION = section

    def __repr__(self):
        return f'<Payment {self.PAYMENT} {self.USER} {self.SECTION}>'


class Question(db.Model):
    __tablename__ = 'QUESTION'

    QUESTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    QUESTION_SET = db.Column(db.Integer, db.ForeignKey('QUESTION_SET.QUESTION_SET'))
    name = db.Column(db.String(60), nullable=False)
    string = db.Column(db.String(5000), nullable=False)
    answers = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)
    auto_marked = db.Column(db.Boolean, nullable=False, default=True)
    category = db.Column(db.Integer, nullable=False)
    config = db.Column(db.JSON)

    INQUIRY_RELATION = db.relationship('Inquiry', back_populates='QUESTION_RELATION')
    CONCEPT_QUESTION_RELATION = db.relationship('ConceptQuestion', back_populates='QUESTION_RELATION')
    QUESTION_HISTORY_RELATION = db.relationship('QuestionHistory', back_populates='QUESTION_RELATION')
    QUESTION_SET_RELATION = db.relationship('QuestionSet', back_populates='QUESTION_RELATION')

    def __init__(self, question_set, name, string, answers, total, category=0, auto_marked=True, config=None):
        self.QUESTION_SET = question_set
        self.name = name
        self.string = string
        self.answers = answers
        self.total = total
        self.auto_marked = auto_marked
        self.category = category
        self.config = config

    def __repr__(self):
        return (
            f'<Question {self.QUESTION} {self.QUESTION_SET} {self.name} {self.string} {self.answers} {self.total}'
            f' {self.category}>'
        )


class QuestionHistory(db.Model):
    __tablename__ = 'question_history'

    QUESTION_HISTORY = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    QUESTION = db.Column(db.Integer, db.ForeignKey('QUESTION.QUESTION'), nullable=False)
    answer = db.Column(db.String(512), nullable=False)
    grade = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    QUESTION_RELATION = db.relationship('Question', back_populates='QUESTION_HISTORY_RELATION')
    USER_RELATION = db.relationship('User', back_populates='QUESTION_HISTORY_RELATION')

    def __init__(self, user_id, question_id, answer, grade, timestamp):
        self.USER = user_id
        self.QUESTION = question_id
        self.answer = answer
        self.grade = grade
        self.timestamp = timestamp

    def __repr__(self):
        return f'<QuestionHistory {self.QUESTION_HISTORY} {self.USER} {self.QUESTION} {self.answer} {self.grade}' \
               f' {self.timestamp}>'


class QuestionSet(db.Model):
    __tablename__ = 'QUESTION_SET'

    QUESTION_SET = db.Column(db.Integer, primary_key=True, autoincrement=True)
    COURSE = db.Column(db.Integer, db.ForeignKey('COURSE.COURSE'))
    name = db.Column(db.String(45), nullable=False)

    COURSE_RELATION = db.relationship('Course', back_populates='QUESTION_SET_RELATION')
    QUESTION_RELATION = db.relationship('Question', back_populates='QUESTION_SET_RELATION')

    def __init__(self, course, name):
        self.COURSE = course
        self.name = name

    def __repr__(self):
        return f'<QuestionSet {self.QUESTION_SET} {self.COURSE} {self.name}>'


class Section(db.Model):
    __tablename__ = 'SECTION'

    SECTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    COURSE = db.Column(db.Integer, db.ForeignKey('COURSE.COURSE'))
    name = db.Column(db.String(45), nullable=False)
    enroll_key = db.Column(db.String(10))
    price = db.Column(db.Float, nullable=False, default=0)

    ANNOUNCEMENT_RELATION = db.relationship('Announcement', back_populates='SECTION_RELATION')
    COURSE_RELATION = db.relationship('Course', back_populates='SECTION_RELATION')
    DISCOUNT_RELATION = db.relationship('Discount', back_populates='SECTION_RELATION')
    PAYMENT_RELATION = db.relationship('Payment', back_populates='SECTION_RELATION')
    TEST_RELATION = db.relationship('Test', back_populates='SECTION_RELATION')
    USER_SECTION_RELATION = db.relationship('UserSection', back_populates='SECTION_RELATION')

    def __init__(self, course_id: int, name: str, enroll_key: bool, price: float = 0):
        self.COURSE = course_id
        self.name = name
        self.enroll_key = Section._generate_key() if enroll_key else None
        self.price = price

    @staticmethod
    def _generate_key():
        key = random_key(10)
        taken = bool(Section.query.filter(Section.enroll_key == key).all())
        while taken:
            key = random_key(10)
            taken = bool(Section.query.filter(Section.enroll_key == key).all())
        return key

    def __repr__(self):
        return f'<Section {self.SECTION} {self.COURSE} {self.name} {self.enroll_key} {self.price}>'


class Takes(db.Model):
    __tablename__ = 'takes'

    TAKES = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TEST = db.Column(db.Integer, db.ForeignKey('TEST.TEST'), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    time_started = db.Column(db.DateTime, nullable=False)
    time_submitted = db.Column(db.DateTime, nullable=False)
    grade = db.Column(db.Float, nullable=False)
    marks = db.Column(db.String(1500), nullable=False)
    answers = db.Column(db.String(7500), nullable=False)
    seeds = db.Column(db.String(5000), nullable=False)

    TEST_RELATION = db.relationship('Test', back_populates='TAKES_RELATION')
    USER_RELATION = db.relationship('User', back_populates='TAKES_RELATION')

    def __init__(self, test, user, time_started, time_submitted, grade, marks, answers, seeds):
        self.TEST = test
        self.USER = user
        self.time_started = time_started
        self.time_submitted = time_submitted
        self.grade = grade
        self.marks = marks
        self.answers = answers
        self.seeds = seeds

    def __repr__(self):
        return (
            f'<Takes {self.TAKES} {self.TEST} {self.USER} {self.time_started} {self.time_submitted} {self.grade}'
            f' {self.marks} {self.answers} {self.seeds}>'
        )


class Test(db.Model):
    __tablename__ = 'TEST'

    TEST = db.Column(db.Integer, primary_key=True, autoincrement=True)
    SECTION = db.Column(db.Integer, db.ForeignKey('SECTION.SECTION'))
    name = db.Column(db.String(200), nullable=False)
    open_time = db.Column(db.DateTime)
    deadline = db.Column(db.DateTime, nullable=False)
    timer = db.Column(db.Integer, nullable=False, default=15)
    attempts = db.Column(db.Integer, nullable=False, default=1)
    question_list = db.Column(db.String(5000), nullable=False)
    seed_list = db.Column(db.String(5000), nullable=False)
    total = db.Column(db.Integer, nullable=False)

    SECTION_RELATION = db.relationship('Section', back_populates='TEST_RELATION')
    TAKES_RELATION = db.relationship('Takes', back_populates='TEST_RELATION')

    def __init__(self, section, name, is_open, open_time, deadline, timer, attempts, question_list, seed_list, total):
        self.SECTION = section
        self.name = name
        self.open_time = open_time
        self.deadline = deadline
        self.timer = timer
        self.attempts = attempts
        self.question_list = question_list
        self.seed_list = seed_list
        self.total = total

    def __repr__(self):
        return (
            f'<Test {self.TEST} {self.SECTION} {self.name} {self.open_time} {self.deadline} {self.timer}'
            f' {self.attempts} {self.question_list} {self.seed_list} {self.total}>'
        )


class User(UserMixin, db.Model):
    __tablename__ = 'USER'

    USER = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(45), nullable=False, unique=True)
    first_name = db.Column(db.String(45), nullable=False)
    last_name = db.Column(db.String(45), nullable=False)
    password = db.Column(db.String(128), nullable=False)
    salt = db.Column(db.String(45), nullable=False)
    confirmed = db.Column(db.Boolean, nullable=False, default=False)
    is_teacher = db.Column(db.Boolean, nullable=False, default=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    color = db.Column(db.Integer, nullable=False, default=9)
    theme = db.Column(db.Boolean, nullable=False, default=False)

    ANNOUNCEMENT_RELATION = db.relationship('Announcement', back_populates='USER_RELATION')
    FEEDBACK_RELATION = db.relationship('Feedback', back_populates='USER_RELATION')
    FORUM_MESSAGE_RELATION = db.relationship('ForumMessage', back_populates='USER_RELATION')
    ISSUE_RELATION = db.relationship('Issue', back_populates='USER_RELATION')
    MASTERY_RELATION = db.relationship('Mastery', back_populates='USER_RELATION')
    MESSAGE_RELATION = db.relationship('Message', back_populates='USER_RELATION')
    PAYMENT_RELATION = db.relationship('Payment', back_populates='USER_RELATION')
    QUESTION_HISTORY_RELATION = db.relationship('QuestionHistory', back_populates='USER_RELATION')
    TAKES_RELATION = db.relationship('Takes', back_populates='USER_RELATION')
    USER_CONVERSATION_RELATION = db.relationship('UserConversation', back_populates='USER_RELATION')
    USER_COURSE_RELATION = db.relationship('UserCourse', back_populates='USER_RELATION')
    USER_INQUIRY_RELATION = db.relationship('UserInquiry', back_populates='USER_RELATION')
    USER_SECTION_RELATION = db.relationship('UserSection', back_populates='USER_RELATION')
    IMAGE_RELATION = db.relationship('Image', back_populates='USER_RELATION')

    def __init__(
            self, email, first_name, last_name, password,
            is_teacher=False, color=9, theme=0, confirmed=False, is_admin=False
    ):
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.change_password(password)
        self.confirmed = confirmed
        self.is_teacher = is_teacher
        self.is_admin = is_admin
        self.color = color
        self.theme = theme

    def __repr__(self):
        return (
            f'<User {self.USER} {self.email} {self.first_name} {self.last_name} {self.password} {self.salt}'
            f' {self.confirmed} {self.is_teacher} {self.is_admin} {self.color} {self.theme}>'
        )

    def get_id(self):
        return unicode(self.email)

    def change_password(self, password):
        self.salt = generate_salt()
        self.password = hash_password(password, self.salt)


class UserConversation(db.Model):
    __tablename__ = 'user_conversation'

    USER_CONVERSATION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    CONVERSATION = db.Column(db.Integer, db.ForeignKey('CONVERSATION.CONVERSATION'), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=0)

    CONVERSATION_RELATION = db.relationship('Conversation', back_populates='USER_CONVERSATION_RELATION')
    USER_RELATION = db.relationship('User', back_populates='USER_CONVERSATION_RELATION')

    def __init__(self, user, conversation, status=0):
        self.USER = user
        self.CONVERSATION = conversation
        self.status = status

    def __repr__(self):
        return f'<UserConversation {self.USER_CONVERSATION} {self.USER} {self.CONVERSATION} {self.status}>'


class UserCourse(db.Model):
    __tablename__ = 'user_course'

    USER_COURSE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    COURSE = db.Column(db.Integer, db.ForeignKey('COURSE.COURSE'), nullable=False)
    can_edit = db.Column(db.Boolean, nullable=False, default=False)

    COURSE_RELATION = db.relationship('Course', back_populates='USER_COURSE_RELATION')
    USER_RELATION = db.relationship('User', back_populates='USER_COURSE_RELATION')

    def __init__(self, user, course, can_edit=False):
        self.USER = user
        self.COURSE = course
        self.can_edit = can_edit

    def __repr__(self):
        return f'<UserCourse {self.USER_COURSE} {self.USER} {self.COURSE} {self.can_edit}>'


class UserInquiry(db.Model):
    __tablename__ = 'user_inquiry'

    USER_INQUIRY = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    INQUIRY = db.Column(db.Integer, db.ForeignKey('INQUIRY.INQUIRY'))
    isOwner = db.Column(db.Boolean, default=False)

    USER_RELATION = db.relationship('User', back_populates='USER_INQUIRY_RELATION')
    INQUIRY_RELATION = db.relationship('Inquiry', back_populates='USER_INQUIRY_RELATION')

    def __init__(self, user, inquiry, is_owner=False):
        self.USER = user
        self.INQUIRY = inquiry
        self.isOwner = is_owner

    def __repr__(self):
        return f'User Inquiry {self.USER_INQUIRY} {self.USER} {self.INQUIRY} {self.isOwner}'


class UserSection(db.Model):
    __tablename__ = 'user_section'

    USER_SECTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    SECTION = db.Column(db.Integer, db.ForeignKey('SECTION.SECTION'), nullable=False)
    user_type = db.Column(db.String(10), nullable=False)
    transaction_id = db.Column(db.String(45))
    expiry = db.Column(db.DateTime)

    SECTION_RELATION = db.relationship('Section', back_populates='USER_SECTION_RELATION')
    USER_RELATION = db.relationship('User', back_populates='USER_SECTION_RELATION')

    def __init__(self, user, section, user_type, transaction_id=None, expiry=None):
        self.USER = user
        self.SECTION = section
        self.user_type = user_type
        self.transaction_id = transaction_id
        self.expiry = expiry

    def __repr__(self):
        return (
            f'<UserSection {self.USER_SECTION} {self.USER} {self.SECTION} {self.user_type} {self.transaction_id}'
            f' {self.expiry}>'
        )


class DataStore(db.Model):
    __tablename__ = 'store'
    __bind_key__ = 'data_store'

    STORE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, nullable=False)
    data = db.Column(db.String(20000), nullable=False)
    type = db.Column(db.String(16), nullable=False)
    time_created = db.Column(db.DateTime, nullable=False)

    def __init__(self, user: int, data, _type: str):
        self.USER = user
        self.data = json.dumps(data)
        self.type = _type
        self.time_created = datetime.now()

    def __repr__(self):
        return f'store {self.USER} {self.data} {self.type} {self.time_created}'


class StudentUsage(db.Model):
    __tablename__ = 'student_usage'
    __bind_key__ = 'research'

    uuid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), nullable=False, index=True)
    data = db.Column(db.JSON, nullable=False)
    event_type = db.Column(db.String(100), nullable=False, index=True)
    created_at = db.Column(db.TIMESTAMP, nullable=False)

    def __init__(self, student_id: str, data: Dict, event_type: str, created_at: datetime):
        self.student_id = student_id
        self.data = data
        self.event_type = event_type
        self.created_at = created_at

    def __repr__(self):
        return f'student_usage {self.student_id} {self.data} {self.event_type} {self.created_at}'

    def __str__(self):
        return f'student_usage {self.student_id} {self.data} {self.event_type} {self.created_at}'


class UserSectionType:
    ENROLLED = 'enrolled'
    TEACHER = 'teacher'
    TRIAL = 'trial'
    WHITELIST = 'whitelist'
