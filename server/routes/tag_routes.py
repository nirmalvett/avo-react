from flask import Blueprint, jsonify, request, abort
from flask_login import current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion

from server.decorators import login_required, teacher_only, admin_only
from server.models import db, Set, Question, UserViewsSet, Tag

QuestionRoutes = Blueprint('TagRoutes', __name__)


# Get sets/questions


@QuestionRoutes.route('/getSets')
@teacher_only
def get_tags():
    """
    For now this route will return all tags from the database
    :return: The list of tags
    """
    # Get list of available sets for current user
    # list_of_sets = Set.query.all()
    # return jsonify(sets=set_list)

