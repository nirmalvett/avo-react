from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from random import SystemRandom
from string import ascii_letters, digits
from server.Encoding.PasswordHash import generate_salt, hash_password

# Initialize Database
db = SQLAlchemy()


class Class(db.Model):
    __tablename__ = "CLASS"

    CLASS = db.Column(db.Integer, primary_key=True)
    USER = db.Column(db.Integer, db.ForeignKey("USER.USER"), nullable=False)
    name = db.Column(db.String(45), nullable=False)
    enroll_key = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Float, nullable=False)
    price_discount = db.Column(db.Float, nullable=False)

    USER_RELATION = db.relationship("User", back_populates="CLASS_RELATION")
    TEST_RELATION = db.relationship("Test", back_populates="CLASS_RELATION")
    TRANSACTION_RELATION = db.relationship("Transaction", back_populates="CLASS_RELATION")
    TRANSACTION_PROCESSING_RELATION = db.relationship("TransactionProcessing", back_populates="CLASS_RELATION")
    MESSAGE_RELATION = db.relationship("Message", back_populates="CLASS_RELATION")

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
    TAKES_RELATION = db.relationship("Takes", back_populates="USER_RELATION")
    USER_VIEWS_SET_RELATION = db.relationship("UserViewsSet", back_populates="USER_RELATION")
    TRANSACTION_RELATION = db.relationship("Transaction", back_populates="USER_RELATION")

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


class Question(db.Model):
    __tablename__ = "QUESTION"

    QUESTION = db.Column(db.Integer, primary_key=True, autoincrement=True)
    SET = db.Column(db.Integer, db.ForeignKey("SET.SET"), nullable=False)
    name = db.Column(db.String(60), nullable=False)
    string = db.Column(db.String(5000), nullable=False)
    answers = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)

    SET_RELATION = db.relationship("Set", back_populates="QUESTION_RELATION")

    def __init__(self, set_id, name, string, answers, total):
        self.SET = set_id
        self.name = name
        self.string = string
        self.answers = answers
        self.total = total

    def __repr__(self):
        return f'<Question {self.QUESTION} {self.SET} {self.name} {self.string} {self.answers} {self.total}>'


class Set(db.Model):
    __tablename__ = "SET"

    SET = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(45), nullable=False)

    QUESTION_RELATION = db.relationship("Question", back_populates="SET_RELATION")
    USER_VIEWS_SET_RELATION = db.relationship("UserViewsSet", back_populates="SET_RELATION")

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<Set {self.SET} {self.name}>'


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


class UserViewsSet(db.Model):
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


class Transaction(db.Model):
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


class Tag(db.Model):
    __tablename__ = 'TAG'

    TAG = db.Column(db.Integer, primary_key=True)
    parent = db.Column(db.Integer, nullable=True)
    tagName = db.Column(db.String(30), nullable=False)
    childOrder = db.Column(db.Integer, nullable=False)

    def __init__(self, parent, tagName, childOrder):
        self.parent = parent
        self.tagName = tagName
        self.childOrder = childOrder

    def __repr__(self):
        return f'TAG {self.TAG} {self.parent} {self.tagName} {self.childOrder}'


class Message(db.Model):
    __tablename__ = 'MESSAGE'

    MESSAGE = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CLASS = db.Column(db.Integer, db.ForeignKey("CLASS.CLASS"), nullable=False)
    title = db.Column(db.String, nullable=False)
    body = db.Column(db.String, nullable=False)
    date_created = db.Column(db.DATETIME, nullable=False)

    CLASS_RELATION = db.relationship("Class", back_populates="MESSAGE_RELATION")

    def __init__(self, CLASS, title, body, date_created):
        self.CLASS = CLASS
        self.title = title
        self.body = body
        self.date_created = date_created

    def __repr__(self):
        return f'{self.MESSAGE} {self.CLASS} {self.title} {self.body} {self.date_created}'
