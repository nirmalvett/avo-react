from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from random import SystemRandom
from string import ascii_letters, digits
from server.PasswordHash import generate_salt, hash_password
from datetime import datetime

import json

db = SQLAlchemy()


class ClassWhitelistBacklog(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "backlog_whitelist"

    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    USER_ID = db.Column(db.String(100), nullable=False)
    CLASS = db.Column(db.Integer, db.ForeignKey("CLASS.CLASS"), nullable=False)

    CLASS_RELATION = db.relationship("Class", back_populates="BACKLOG_WHITELIST_RELATION")

    def __init__(self, user_id, class_id):
        self.USER_ID = user_id
        self.CLASS = class_id

    def __repr__(self):
        return f'backlog_whitelist {self.ID} {self.USER_ID} {self.CLASS}'


class Class(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "CLASS"

    CLASS = db.Column(db.Integer, primary_key=True)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    name = db.Column(db.String(45), nullable=False)
    enroll_key = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Float, nullable=False)
    price_discount = db.Column(db.Float, nullable=False)

    LESSON_RELATION = db.relationship("Lesson", back_populates="CLASS_RELATION")

    USER_RELATION = db.relationship("User", back_populates="CLASS_RELATION")
    TEST_RELATION = db.relationship("Test", back_populates="CLASS_RELATION")
    TRANSACTION_RELATION = db.relationship("Transaction", back_populates="CLASS_RELATION")
    TRANSACTION_PROCESSING_RELATION = db.relationship("TransactionProcessing", back_populates="CLASS_RELATION")
    MESSAGE_RELATION = db.relationship("Message", back_populates="CLASS_RELATION")
    CLASS_WHITELIST_RELATION = db.relationship("ClassWhitelist", back_populates="CLASS_RELATION")
    BACKLOG_WHITELIST_RELATION = db.relationship("ClassWhitelistBacklog", back_populates="CLASS_RELATION")
    TAG_CLASS_RELATION = db.relationship("TagClass", back_populates="CLASS_RELATION")

    # noinspection PyPep8Naming
    def __init__(self, USER, name, price=59.99):
        self.USER = USER
        self.name = name
        self.price = price
        self.price_discount = price
        self.enroll_key = ''.join(SystemRandom().choice(ascii_letters + digits) for _ in range(10))
        enroll_key_class = Class.query.filter(Class.enroll_key == self.enroll_key).all()
        while len(enroll_key_class) != 0:
            self.enroll_key = ''.join(SystemRandom().choice(ascii_letters + digits) for _ in range(10))
            enroll_key_class = Class.query.filter(Class.enroll_key == self.enroll_key).all()

    def __repr__(self):
        return f'<Class {self.CLASS} {self.USER} {self.name} {self.enroll_key}>'


class ClassWhitelist(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "class_whitelist"

    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    CLASS = db.Column(db.Integer, db.ForeignKey("CLASS.CLASS"), nullable=False)

    USER_RELATION = db.relationship("User",  back_populates="CLASS_WHITELIST_RELATION")
    CLASS_RELATION = db.relationship("Class", back_populates="CLASS_WHITELIST_RELATION")

    def __init__(self, user, class_id):
        self.USER = user
        self.CLASS = class_id

    def __repr__(self):
        return f'class_whitelist {self.ID} {self.USER} {self.CLASS}'


class Concept(db.Model):
    __tablename__ = "CONCEPT"

    CONCEPT = db.Column(db.Integer, primary_key=True, autoincrement=True)
    COURSE = db.Column(db.Integer, db.ForeignKey("COURSE.COURSE"), nullable=False)
    name = db.Column(db.String(45), nullable=False)
    lesson_content = db.Column(db.String(2000), nullable=False)

    COURSE_RELATION = db.relationship("Course", back_populates="CONCEPT_RELATION")
    CONCEPT_QUESTION_RELATION = db.relationship("ConceptQuestion", back_populates="CONCEPT_RELATION")
    MASTERY_RELATION = db.relationship("Mastery", back_populates="CONCEPT_RELATION")
    CONCEPT_PARENT_RELATION = db.relationship("ConceptRelation", back_populates="CONCEPT_PARENT_RELATION", foreign_keys="ConceptRelation.PARENT")
    CONCEPT_CHILD_RELATION = db.relationship("ConceptRelation", back_populates="CONCEPT_CHILD_RELATION", foreign_keys="ConceptRelation.CHILD")


    def __init__(self, course_id, name, lesson_content):
        self.COURSE = course_id
        self.name = name
        self.lesson_content = lesson_content

    def __repr__(self):
        return f'<Concept {self.CONCEPT} {self.COURSE} {self.name} {self.lesson_content}>'


class ConceptQuestion(db.Model):
    __tablename__ = "concept_question"

    CONCEPT_QUESTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CONCEPT = db.Column(db.Integer, db.ForeignKey("CONCEPT.CONCEPT"), nullable=False)
    QUESTION = db.Column(db.Integer, db.ForeignKey("QUESTION.QUESTION"), nullable=False)
    weight = db.Column(db.Integer, nullable=False)

    CONCEPT_RELATION = db.relationship("Concept", back_populates="CONCEPT_QUESTION_RELATION")
    QUESTION_RELATION = db.relationship("Question", back_populates="CONCEPT_QUESTION_RELATION")

    def __init__(self, course_id, name, lesson_content):
        self.COURSE = course_id
        self.name = name
        self.lesson_content = lesson_content

    def __repr__(self):
        return f'<Concept {self.CONCEPT} {self.COURSE} {self.name} {self.lesson_content}>'


class ConceptRelation(db.Model):
    __tablename__ = 'concept_relation'

    CONCEPT_RELATION = db.Column(db.Integer, primary_key=True)
    PARENT = db.Column(db.Integer, db.ForeignKey('CONCEPT.CONCEPT'), nullable=False)
    CHILD = db.Column(db.Integer, db.ForeignKey('CONCEPT.CONCEPT'), nullable=False)
    weight = db.Column(db.Integer, nullable=False)

    CONCEPT_PARENT_RELATION = db.relationship("Concept", back_populates="CONCEPT_PARENT_RELATION", foreign_keys=[PARENT])
    CONCEPT_CHILD_RELATION = db.relationship("Concept", back_populates="CONCEPT_CHILD_RELATION", foreign_keys=[CHILD])

    def __init__(self, PARENT, CHILD, weight):
        self.PARENT = PARENT
        self.CHILD = CHILD
        self.weight = weight


class Course(db.Model):
    __tablename__ = "COURSE"

    COURSE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(45), nullable=False)

    CONCEPT_RELATION = db.relationship("Concept", back_populates="COURSE_RELATION")
    SECTION_RELATION = db.relationship("Section", back_populates="COURSE_RELATION")
    DISCOUNT_RELATION = db.relationship("Discount", back_populates="COURSE_RELATION")
    USER_COURSE_RELATION = db.relationship("UserCourse", back_populates="COURSE_RELATION")

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<Course {self.COURSE} {self.name}>'


class Discount(db.Model):
    __tablename__ = "DISCOUNT"

    DISCOUNT = db.Column(db.Integer, primary_key=True, autoincrement=True)
    COURSE = db.Column(db.Integer, db.ForeignKey("COURSE.COURSE"), nullable=False)
    price = db.Column(db.Float, nullable=False)
    single_use = db.Column(db.Boolean, default=False, nullable=False)

    COURSE_RELATION = db.relationship("Course", back_populates="DISCOUNT_RELATION")

    def __init__(self, course_id, price, single_use):
        self.COURSE = course_id
        self.price = price
        self.single_use = single_use

    def __repr__(self):
        return f'<Discount {self.DISCOUNT} {self.COURSE} {self.price} {self.single_use}>'


class Lesson(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "LESSON"

    LESSON = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CLASS = db.Column(db.Integer, db.ForeignKey("CLASS.CLASS"), nullable=False)
    TAG = db.Column(db.Integer, db.ForeignKey("TAG.TAG"), nullable=False)
    lesson_string = db.Column(db.Text, nullable=False)
    question_list = db.Column(db.String(500), nullable=False)

    CLASS_RELATION = db.relationship("Class", back_populates="LESSON_RELATION")
    TAG_RELATION = db.relationship("Tag", back_populates="LESSON_RELATION")

    def __init__(self, CLASS, tag, lesson_string, question_list):
        self.CLASS = CLASS
        self.TAG = tag
        self.lesson_string = lesson_string
        self.question_list = question_list

    def __repr__(self):
        return f'LESSON {self.LESSON} {self.CLASS} {self.lesson_string}'


class Mastery(db.Model):
    __tablename__ = "mastery"

    MASTERY = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CONCEPT = db.Column(db.Integer, db.ForeignKey("CONCEPT.CONCEPT"), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    mastery_level = db.Column(db.Float, nullable=False)
    mastery_survey = db.Column(db.Integer, nullable=False)
    aptitude_survey = db.Column(db.Integer, nullable=False)

    CONCEPT_RELATION = db.relationship("Concept", back_populates="MASTERY_RELATION")
    MASTERY_HISTORY_RELATION = db.relationship("MasteryHistory", back_populates="MASTERY_RELATION")
    USER_RELATION = db.relationship("User", back_populates="MASTERY_RELATION")

    def __init__(self, concept_id, user_id, mastery_level, mastery_survey, aptitude_survey):
        self.CONCEPT = concept_id
        self.USER = user_id
        self.mastery_level = mastery_level
        self.mastery_survey = mastery_survey
        self.aptitude_survey = aptitude_survey

    def __repr__(self):
        return f'<Mastery {self.MASTERY} {self.CONCEPT} {self.USER} {self.mastery_level} {self.mastery_survey} {self.aptitude_survey}>'


class MasteryHistory(db.Model):
    __tablename__ = 'mastery_history'

    MASTERY_HISTORY = db.Column(db.Integer, primary_key=True, autoincrement=True)
    MASTERY = db.Column(db.Integer, db.ForeignKey("mastery.MASTERY"), nullable=False)
    mastery_level = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    MASTERY_RELATION = db.relationship("Mastery", back_populates="MASTERY_HISTORY_RELATION")

    def __init__(self, MASTERY, mastery_level, timestamp):
        self.MASTERY = MASTERY
        self.mastery_level = mastery_level
        self.timestamp = timestamp

    def __repr__(self):
        return f'<MasteryHistory {self.MASTERY} {self.mastery_level} {self.timestamp}>'


class Message(db.Model):
    __tablename__ = 'MESSAGE'

    MESSAGE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CLASS = db.Column(db.Integer, db.ForeignKey("CLASS.CLASS"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.String(1000), nullable=False)
    date_created = db.Column(db.DATETIME, nullable=False)

    CLASS_RELATION = db.relationship("Class", back_populates="MESSAGE_RELATION")

    def __init__(self, CLASS, title, body, date_created):
        self.CLASS = CLASS
        self.title = title
        self.body = body
        self.date_created = date_created

    def __repr__(self):
        return f'{self.MESSAGE} {self.CLASS} {self.title} {self.body} {self.date_created}'


class Question(db.Model):
    __tablename__ = "QUESTION"

    QUESTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    SET = db.Column(db.Integer, db.ForeignKey("SET.SET"), nullable=False)
    name = db.Column(db.String(60), nullable=False)
    string = db.Column(db.String(5000), nullable=False)
    answers = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)
    category = db.Column(db.Integer, nullable=False)

    CONCEPT_QUESTION_RELATION = db.relationship("ConceptQuestion", back_populates="QUESTION_RELATION")
    SET_RELATION = db.relationship("Set", back_populates="QUESTION_RELATION")
    TAG_QUESTION_RELATION = db.relationship("TagQuestion", back_populates="QUESTION_RELATION")

    def __init__(self, set_id, name, string, answers, total):
        self.SET = set_id
        self.name = name
        self.string = string
        self.answers = answers
        self.total = total
        self.category = 0

    def __repr__(self):
        return f'<Question {self.QUESTION} {self.SET} {self.name} {self.string} {self.answers} {self.total} {self.category}>'


class Section(db.Model):
    __tablename__ = "SECTION"

    SECTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    COURSE = db.Column(db.Integer, db.ForeignKey('COURSE.COURSE'), nullable=True)
    name = db.Column(db.String(45), nullable=False)
    enroll_key = db.Column(db.String(10), nullable=True)
    price = db.Column(db.Float, nullable=False, default=0)

    COURSE_RELATION = db.relationship("Course", back_populates="SECTION_RELATION")
    USER_SECTION_RELATION = db.relationship("UserSection", back_populates="SECTION_RELATION")

    def __init__(self, course_id, name, enroll_key, price):
        self.COURSE = course_id
        self.name = name
        self.enroll_key = enroll_key
        self.price = price

    def __repr__(self):
        return f'<Section {self.SECTION} {self.COURSE} {self.name} {self.enroll_key} {self.price}>'


class Set(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "SET"

    SET = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(45), nullable=False)

    QUESTION_RELATION = db.relationship("Question", back_populates="SET_RELATION")
    USER_VIEWS_SET_RELATION = db.relationship("UserViewsSet", back_populates="SET_RELATION")

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<Set {self.SET} {self.name}>'


class Tag(db.Model):  # All references to this table should be removed eventually
    __tablename__ = 'TAG'

    TAG = db.Column(db.Integer, primary_key=True, autoincrement=True)
    parent = db.Column(db.Integer, nullable=True)
    tagName = db.Column(db.String(30), nullable=False)
    childOrder = db.Column(db.Integer, nullable=False)

    TAG_USER_RELATION = db.relationship("TagUser", back_populates="TAG_RELATION")
    LESSON_RELATION = db.relationship("Lesson", back_populates="TAG_RELATION")
    TAG_QUESTION_RELATION = db.relationship("TagQuestion", back_populates="TAG_RELATION")
    TAG_CLASS_RELATION = db.relationship("TagClass", back_populates="TAG_RELATION")

    def __init__(self, parent, tagName, childOrder):
        self.parent = parent
        self.tagName = tagName
        self.childOrder = childOrder

    def __repr__(self):
        return f'TAG {self.TAG} {self.parent} {self.tagName} {self.childOrder}'


class TagClass(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "tag_class"

    TAG_CLASS = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TAG = db.Column(db.Integer, db.ForeignKey("TAG.TAG"), nullable=False)
    CLASS = db.Column(db.Integer, db.ForeignKey("CLASS.CLASS"), nullable=False)

    TAG_RELATION = db.relationship("Tag", back_populates="TAG_CLASS_RELATION")
    CLASS_RELATION = db.relationship("Class", back_populates="TAG_CLASS_RELATION")

    def __init__(self, TAG, CLASS):
        self.TAG = TAG
        self.CLASS = CLASS

    def __repr__(self):
        return f'TAG_CLASS {self.TAG_CLASS} {self.TAG} {self.CLASS}'


class TagQuestion(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "tag_question"

    TAG_QUESTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TAG = db.Column(db.Integer, db.ForeignKey("TAG.TAG"), nullable=False)
    QUESTION = db.Column(db.Integer, db.ForeignKey("QUESTION.QUESTION"), nullable=False)

    TAG_RELATION = db.relationship("Tag", back_populates="TAG_QUESTION_RELATION")
    QUESTION_RELATION = db.relationship("Question", back_populates="TAG_QUESTION_RELATION")

    def __init__(self, TAG, QUESTION):
        self.TAG = TAG
        self.QUESTION = QUESTION

    def __repr__(self):
        return f'TAG_QUESTION {self.TAG_QUESTION} {self.TAG} {self.QUESTION}'


class TagUser(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "tag_user"

    TAGUSER = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    TAG = db.Column(db.Integer, db.ForeignKey("TAG.TAG"), nullable=False)
    mastery = db.Column(db.Float, nullable=False)
    time_created = db.Column(db.DATETIME, nullable=False)

    USER_RELATION = db.relationship("User", back_populates="TAG_USER_RELATION")
    TAG_RELATION = db.relationship("Tag", back_populates="TAG_USER_RELATION")

    def __init__(self, user, tag, mastery=0.0):
        self.USER = user
        self.TAG = tag
        self.mastery = mastery

    def __repr__(self):
        return f'TAG_USER {self.TAGUSER} {self.USER} {self.TAG} {self.mastery} {self.time_created}'


class Takes(db.Model):
    __tablename__ = "takes"

    TAKES = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TEST = db.Column(db.Integer, db.ForeignKey("TEST.TEST"), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    time_started = db.Column(db.DateTime, nullable=False)
    time_submitted = db.Column(db.DateTime, nullable=False)
    grade = db.Column(db.Float, nullable=False)
    marks = db.Column(db.String(1500), nullable=False)
    answers = db.Column(db.String(7500), nullable=False)
    seeds = db.Column(db.String(5000), nullable=False)

    TEST_RELATION = db.relationship("Test", back_populates="TAKES_RELATION")
    USER_RELATION = db.relationship("User", back_populates="TAKES_RELATION")

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
        return f'<Takes {self.TAKES} {self.TEST} {self.USER} {self.time_started} {self.time_submitted} ' \
               f'{self.grade} {self.marks} {self.answers} {self.seeds}>'


class Test(db.Model):
    __tablename__ = "TEST"

    TEST = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CLASS = db.Column(db.Integer, db.ForeignKey('CLASS.CLASS'), nullable=True)
    name = db.Column(db.String(45), nullable=False)
    is_open = db.Column(db.Boolean, nullable=False, default=False)
    open_time = db.Column(db.DateTime, nullable=True)
    deadline = db.Column(db.DateTime, nullable=False)
    timer = db.Column(db.Integer, nullable=False, default=15)
    attempts = db.Column(db.Integer, nullable=False, default=1)
    question_list = db.Column(db.String(5000), nullable=False)
    seed_list = db.Column(db.String(5000), nullable=False)
    total = db.Column(db.Integer, nullable=False)

    TAKES_RELATION = db.relationship("Takes", back_populates="TEST_RELATION")
    CLASS_RELATION = db.relationship("Class", back_populates="TEST_RELATION")

    def __init__(self, CLASS, name, is_open, open_time, deadline, timer, attempts, question_list, seed_list, total):
        self.CLASS = CLASS
        self.name = name
        self.is_open = is_open
        self.open_time = open_time
        self.deadline = deadline
        self.timer = timer
        self.attempts = attempts
        self.question_list = question_list
        self.seed_list = seed_list
        self.total = total

    def __repr__(self):
        return f'<Test {self.TEST} {self.CLASS} {self.name} {self.is_open} ' \
               f'{self.deadline} {self.timer} {self.attempts} {self.question_list} {self.seed_list} {self.total}>'


class Transaction(db.Model):  # All references to this table should be removed eventually
    __tablename__ = 'transaction'

    TRANSACTION = db.Column(db.String(30), primary_key=True)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    CLASS = db.Column(db.Integer, db.ForeignKey("CLASS.CLASS"), nullable=False)
    expiration = db.Column(db.DATETIME, nullable=False)

    USER_RELATION = db.relationship("User", back_populates="TRANSACTION_RELATION")
    CLASS_RELATION = db.relationship("Class", back_populates="TRANSACTION_RELATION")

    def __init__(self, transaction, user, class_id, expiration):
        self.TRANSACTION = transaction
        self.USER = user
        self.CLASS = class_id
        self.expiration = expiration

    def __repr__(self):
        return f'Transaction {self.TRANSACTION} {self.USER} {self.CLASS} {self.expiration}'


class TransactionProcessing(db.Model):
    __tablename__ = 'transaction_processing'

    TRANSACTIONPROCESSING = db.Column(db.String(30), primary_key=True)
    CLASS = db.Column(db.Integer, db.ForeignKey("CLASS.CLASS"), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)

    CLASS_RELATION = db.relationship("Class", back_populates="TRANSACTION_PROCESSING_RELATION")

    def __init__(self, transaction_processing, class_id, user):
        self.TRANSACTIONPROCESSING = transaction_processing
        self.CLASS = class_id
        self.USER = user


class User(UserMixin, db.Model):
    __tablename__ = "USER"

    USER = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(45), unique=True, nullable=False)
    first_name = db.Column(db.String(45), nullable=False)
    last_name = db.Column(db.String(45), nullable=False)
    password = db.Column(db.String(128), nullable=False)
    salt = db.Column(db.String(45), nullable=False)
    confirmed = db.Column(db.Boolean, nullable=False, default=False)
    is_teacher = db.Column(db.Boolean, nullable=False, default=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    color = db.Column(db.Integer, nullable=False, default=9)
    theme = db.Column(db.Boolean, nullable=False, default=False)

    CLASS_RELATION = db.relationship("Class", back_populates="USER_RELATION")
    MASTERY_RELATION = db.relationship("Mastery", back_populates="USER_RELATION")
    TAKES_RELATION = db.relationship("Takes", back_populates="USER_RELATION")
    USER_VIEWS_SET_RELATION = db.relationship("UserViewsSet", back_populates="USER_RELATION")
    TRANSACTION_RELATION = db.relationship("Transaction", back_populates="USER_RELATION")
    USER_COURSE_RELATION = db.relationship("UserCourse", back_populates="USER_RELATION")
    USER_SECTION_RELATION = db.relationship("UserSection", back_populates="USER_RELATION")

    TAG_USER_RELATION = db.relationship("TagUser", back_populates="USER_RELATION")
    # LESSON_RELATION = db.relationship("Lesson", back_populates="USER_RELATION")
    CLASS_WHITELIST_RELATION = db.relationship("ClassWhitelist", back_populates="USER_RELATION")
    # USER_LESSON_RELATION = db.relationship("UserLesson", back_populates="USER_RELATION")

    # noinspection PyPep8Naming
    def __init__(self, email, first_name, last_name, password, is_teacher, color, theme):
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.salt = generate_salt()
        self.password = hash_password(password, self.salt)
        self.confirmed = False
        self.is_teacher = is_teacher
        self.is_admin = False
        self.color = color
        self.theme = theme

    def __repr__(self):
        return f'<User {self.USER} {self.email} {self.first_name} {self.last_name} {self.password} {self.salt} ' \
               f'{self.confirmed} {self.is_teacher} {self.is_admin} {self.color} {self.theme}>'

    def get_id(self):
        return self.USER


class UserCourse(db.Model):
    __tablename__ = "user_course"

    USER_COURSE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    COURSE = db.Column(db.Integer, db.ForeignKey("COURSE.COURSE"), nullable=False)
    can_edit = db.Column(db.Boolean, default=False, nullable=False)

    USER_RELATION = db.relationship("User", back_populates="USER_COURSE_RELATION")
    COURSE_RELATION = db.relationship("Course", back_populates="USER_COURSE_RELATION")

    def __init__(self, user_id, course_id, can_edit):
        self.USER = user_id
        self.COURSE = course_id
        self.can_edit = can_edit

    def __repr__(self):
        return f'<UserCourse {self.USER_COURSE} {self.USER} {self.COURSE} {self.can_edit}>'


class UserSection(db.Model):
    __tablename__ = "user_section"

    USER_SECTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    SECTION = db.Column(db.Integer, db.ForeignKey("SECTION.SECTION"), nullable=False)
    user_type = db.Column(db.String(10), nullable=False)
    transaction_id = db.Column(db.String(45), nullable=True)
    expiry = db.Column(db.DateTime, nullable=True)

    USER_RELATION = db.relationship("User", back_populates="USER_SECTION_RELATION")
    SECTION_RELATION = db.relationship("Section", back_populates="USER_SECTION_RELATION")

    def __init__(self, user_id, section_id, user_type, transaction_id, expiry):
        self.USER = user_id
        self.SECTION = section_id
        self.user_type = user_type
        self.transaction_id = transaction_id
        self.expiry = expiry

    def __repr__(self):
        return f'<UserSection {self.USER_SECTION} {self.USER} {self.SECTION} {self.user_type} {self.transaction_id} {self.expiry}>'


class UserViewsSet(db.Model):  # All references to this table should be removed eventually
    __tablename__ = "user_views_set"

    USER_VIEWS_SET = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    SET = db.Column(db.Integer, db.ForeignKey("SET.SET"), nullable=False)
    can_edit = db.Column(db.Boolean, default=False, nullable=False)

    USER_RELATION = db.relationship("User", back_populates="USER_VIEWS_SET_RELATION")
    SET_RELATION = db.relationship("Set", back_populates="USER_VIEWS_SET_RELATION")

    def __init__(self, user, set_id, can_edit):
        self.USER = user
        self.SET = set_id
        self.can_edit = can_edit

    def __repr__(self):
        return f'UserViewsSet {self.USER_VIEWS_SET} {self.USER} {self.SET} {self.can_edit}'


class DataStore(db.Model):
    __tablename__ = "store"
    __bind_key__ = "data_store"

    STORE = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    USER = db.Column(db.Integer, nullable=False)
    data = db.Column(db.String(20000), nullable=False)
    type = db.Column(db.String(16), nullable=False)
    time_created = db.Column(db.DATETIME, nullable=False)

    def __init__(self, USER: int, DATA, TYPE: str):
        self.USER = USER
        self.data = json.dumps(DATA)
        self.type = TYPE
        self.time_created = datetime.now()

    def __repr__(self):
        return f'store {self.USER} {self.data} {self.type} {self.time_created}'
