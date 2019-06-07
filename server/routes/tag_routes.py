from flask import Blueprint, jsonify, request, abort
from flask_login import current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion

from server.decorators import login_required, teacher_only, admin_only
from server.models import db, Set, Question, UserViewsSet, Tag

TagRoutes = Blueprint('TagRoutes', __name__)


# Get sets/questions


@TagRoutes.route('/getTags')
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
        list_dict.append(alchemy_to_dict(tag))
    return list_dict



@TagRoutes.route('/putTags')
@teacher_only
def put_tags_route():
    """
        We will expect the following from the web
        {
            tags: [....]
        }

        Where each object in the lists will contain information for a given concept. Here is an example
        {'tagName': 'Linear Algebra', 'TAG': 0, 'parent': null, 'childOrder': 0}

    """
    # Step 1: Check if we were given the proper JSON
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    # Step 3: First get the object from the JSON, in this case you'll find data['tags'], let's call it newTagsList
    data = request.json
    new_tags_list = data['answer']  # Data from user
    # Step 4: Validate the datatype, in this case it should be a list i.e. check if not isinstance(newTagsList, list)
    if not isinstance(new_tags_list, list):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")

    # Step 5: Now loop through each object from the list
    # so first we'll get a list of all the tag objects
    tag_list = Tag.query.filter(Tag.TAG.in_(new_tags_list)).all()
    for tag in tag_list:
        tag.changeTag()
    db.commit()

    return jsonify(message='Changed successfully!')


@TagRoutes.route('/addTag')
@teacher_only
def add_tag_route():
    """
        Expects
        {tag: {'tagName': 'Linear Algebra' }}
    """
    if not request.json:
        # If the request is not json return a 400 error
        return abort(400)
    data = request.json  # Data sent from client
    tag = data['tag']
    tag_obj = Tag(None, tag.tagName, 0)
    db.session.add(tag_obj)
    db.commit()

    return jsonify(
        message='Changed successfully!',
        tag=alchemy_to_dict(tag_obj)
    )


def alchemy_to_dict(obj):
    dicObj = obj.__dict__
    dicObj.pop('_sa_instance_state')
    return dicObj