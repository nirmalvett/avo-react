from server.data import db
from flask_login import UserMixin


enrolled = db.Table('enrolled', db.metadata,
                    db.Column('USER', db.Integer, db.ForeignKey("USER.USER")),
                    db.Column('CLASS', db.Integer, db.ForeignKey("CLASS.CLASS"))
                    )


class Class(db.Model):
    __tablename__ = 'CLASS'

    CLASS = db.Column(db.Integer, primary_key=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    name = db.Column(db.String, nullable=False)
    enroll_key = db.Column(db.String, nullable=False)

    USER_RELATION = db.relationship('User', secondary=enrolled, back_populates='CLASS')
    TEST_RELATION = db.relationship('Test', back_populates='CLASS')

    # noinspection PyPep8Naming
    def __init__(self, USER, name, enroll_key):
        self.USER = USER
        self.name = name
        self.enroll_key = enroll_key

    def __repr__(self):
        return f'<Class {self.USER} {self.name} {self.enroll_key}>'


class Takes(db.Model):
    __tablename__ = "takes"

    TAKES = db.Column(db.Integer, primary_key=True)
    TEST = db.Column(db.Integer, db.ForeignKey('TEST.TEST'), nullable=False)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    time_started = db.Column(db.DateTime, nullable=False)
    time_submitted = db.Column(db.DateTime, nullable=False)
    grade = db.Column(db.Float, nullable=False)
    marks = db.Column(db.String, nullable=False)
    answers = db.Column(db.String, nullable=False)
    seeds = db.Column(db.String, nullable=False)

    TEST_RELATION = db.relationship('Test', back_populates='takes')
    USER_RELATION = db.relationship('User', back_populates='takes')

    def __init__(self, TEST, USER, time_started, time_submitted, grade, marks, answers, seeds):
        self.TEST = TEST
        self.USER = USER
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
    __tablename__ = 'USER'

    USER = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.Integer, unique=True, nullable=False)
    first_name = db.Column(db.Integer, nullable=False)
    last_name = db.Column(db.Integer, nullable=False)
    password = db.Column(db.Integer, nullable=False)
    salt = db.Column(db.Integer, nullable=False)
    confirmed = db.Column(db.Boolean, nullable=False, default=False)
    is_teacher = db.Column(db.Boolean, nullable=False, default=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    color = db.Column(db.Integer, nullable=False, default=9)
    theme = db.Column(db.Boolean, nullable=False, default=False)

    CLASS_RELATION = db.relationship('Class', secondary=enrolled, back_populates='USER')
    TAKES_RELATION = db.relationship('Takes', back_populates='USER')
    USER_VIEWS_SET_RELATION = db.relationship('user_views_set', back_populates='USER')

    # noinspection PyPep8Naming
    def __init__(self, email, first_name, last_name, password, salt, confirmed, is_teacher, is_admin, color, theme):
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.password = password  # todo
        self.salt = salt  # todo
        self.confirmed = confirmed
        self.is_teacher = is_teacher
        self.is_admin = is_admin
        self.color = color
        self.theme = theme

    def __repr__(self):
        return f'<User {self.email} {self.first_name} {self.last_name} {self.password} {self.salt} {self.confirmed} ' \
               f'{self.is_teacher} {self.is_admin} {self.color} {self.theme}>'


class Question(db.Model):
    __tablename__ = 'QUESTION'

    QUESTION = db.Column(db.Integer, primary_key=True)
    SET = db.Column(db.Integer, db.ForeignKey('SET.SET'), nullable=False)
    name = db.Column(db.String, nullable=False)
    string = db.Column(db.String, nullable=False)
    answers = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)

    SET_RELATION = db.relationship('Set', back_populates='QUESTION')

    def __init__(self, SET, name, string, answers, total):
        self.SET = SET
        self.name = name
        self.string = string
        self.answers = answers
        self.total = total

    def __repr__(self):
        return f'<Question {self.QUESTION} {self.SET} {self.name} {self.string} {self.answers} {self.total}>'


class Set(db.Model):
    __tablename__ = "SET"

    SET = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)

    QUESTION_RELATION = db.relationship('Question', back_populates='SET')
    USER_VIEWS_SET_RELATION = db.relationship('user_views_set', back_populates='SET')

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<Set {self.SET} {self.name}>'


class Test(db.Model):
    __tablename__ = "TEST"

    TEST = db.Column(db.Integer, primary_key=True)
    CLASS = db.Column(db.Integer, db.ForeignKey('CLASS.CLASS'), nullable=False)
    name = db.Column(db.String, nullable=False)
    is_open = db.Column(db.Boolean, nullable=False, default=False)
    deadline = db.Column(db.DateTime, nullable=False)
    timer = db.Column(db.Integer, nullable=False, default=15)
    attempts = db.Column(db.Integer, nullable=False, default=1)
    question_list = db.Column(db.String, nullable=False)
    seed_list = db.Column(db.String, nullable=False)
    total = db.Column(db.Integer, nullable=False)

    TAKES_RELATION = db.relationship('Takes', back_populates='TEST')
    CLASS_RELATION = db.relationship('Class', back_populates='TEST')

    def __init__(self, CLASS, name, is_open, deadline, timer, attempts, question_list, seed_list, total):
        self.CLASS = CLASS
        self.name = name
        self.is_open = is_open
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

    USERVIEWSETID = db.Column(db.Integer, primary_key=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    SET = db.Column(db.INTEGER, db.ForeignKey('SET.SET'), nullable=False)
    can_edit = db.Column(db.Boolean, nullable=False, default=False)

    USER_RELATION = db.relationship('User', back_populates='user_views_set')
    SET_RELATION = db.relationship('Set', back_populates='user_views_set')

    def __init__(self, USER, SET, can_edit):
        self.USER = USER
        self.SET = SET
        self.can_edit = can_edit

    def __repr__(self):
        return f'<UserViewSet {self.USER} {self.SET} {self.can_edit}>'
