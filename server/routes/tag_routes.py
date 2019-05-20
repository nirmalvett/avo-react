from flask import Blueprint, jsonify, request, abort
from flask_login import current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion

from server.decorators import login_required, teacher_only, admin_only
from server.models import db, Set, Question, UserViewsSet, Tag

QuestionRoutes = Blueprint('TagRoutes', __name__)


# Get sets/questions


@QuestionRoutes.route('/getTags')
@teacher_only
def get_tags_route():
    """
    For now this route will return all tags from the database
    :return: The list of tags
    """
    return jsonify(tags=get_tags())


def get_tags():
    """
    For now this route will return all tags from the database
    :return: List, of dict objects each of which represents a tag
    """
    # Get list of available sets for current user
    list_of_tags = Tag.query.all()  # [Tag, Tag...]
    list_dict = []
    for tag in list_of_tags:
        tag_dict = tag.__dict__
        tag_dict.pop('_sa_instance_state')
        list_dict.append(tag_dict)
    return list_dict
