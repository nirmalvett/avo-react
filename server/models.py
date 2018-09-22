from server.data import db
from flask_login import UserMixin


class UserObj:
    def __init__(self, user):
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
        self.id = user

    def get_id(self):
        return str(self.id)


class Class(db.Model):
    __tablename__ = 'CLASS'

    CLASS = db.Column(db.Integer, primary_key=True)
    USER = db.Column(db.Integer, db.ForeignKey('USER.USER'), nullable=False)
    name = db.Column(db.String, nullable=False)
    enroll_key = db.Column(db.String, nullable=False)

    USER_RELATION = db.relationship('User', back_populates='CLASS')

    # noinspection PyPep8Naming
    def __init__(self, USER, name, enroll_key):
        self.USER = USER
        self.name = name
        self.enroll_key = enroll_key

    def __repr__(self):
        return f'<Class {self.USER} {self.name} {self.enroll_key}>'


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
