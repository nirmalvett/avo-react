from flask import Blueprint, jsonify, request, abort
from flask_login import current_user
from sqlalchemy.orm.exc import NoResultFound
from server.MathCode.question import AvoQuestion

from server.decorators import login_required, teacher_only, admin_only
from server.models import db, Set, Question, UserViewsSet, Tag, TagUser, Lesson

TagRoutes = Blueprint('TagRoutes', __name__)


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


@TagRoutes.route('/putTags', methods=['PUT'])
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
    new_tags_list = data['tags']  # Data from user
    # Step 4: Validate the datatype, in this case it should be a list i.e. check if not isinstance(newTagsList, list)
    if not isinstance(new_tags_list, list):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    tag_ids = []
    for t in new_tags_list:
        tag_ids.append(t['TAG'])

    # Step 5: Now loop through each object from the list
    # so first we'll get a list of all the tag objects
    tag_list = Tag.query.filter(Tag.TAG.in_(tag_ids)).all()
    if len(tag_list) != len(tag_ids):
        return jsonify(error="One or more tags not found")

    for tag in tag_list:
        tag_new_data = [d for d in new_tags_list if tag.TAG == d['TAG']]
        tag.parent = tag_new_data[0]['parent']
        tag.tagName = tag_new_data[0]['tagName']
        tag.childOrder = tag_new_data[0]['childOrder']
    db.session.commit()

    return jsonify(message='Changed successfully!')


@TagRoutes.route('/addTag', methods=['POST'])
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
    tag = data['tag']  # dic of tag data
    tag_obj = Tag(None, tag['tagName'], 0)  # Tag to be added to database
    db.session.add(tag_obj)
    db.session.commit()
    return jsonify(
        message='Changed successfully!',
        tag=tag_obj.TAG
    )


@TagRoutes.route("/deleteTag", methods=['POST'])
@teacher_only
def delete_tag():
    if not request.json:
        # If the request is not JSON then return a 400 error
        abort(400)
    data = request.json  # Get the request data
    print(data)
    tag_id = data['tag']['TAG']  # ID of tag to be removed
    if not isinstance(tag_id, int):
        # If not valid data type return error JSON
        return jsonify(error="One or more data type is not correct")
    tag = Tag.query.get(tag_id)  # Get the tag from the database
    if tag is None:
        # if no tag found return error JSON
        return jsonify(error="Tag does not exist")
    child_tags = tag.query.filter(Tag.parent == tag.parent).all()  # Get all child tags of current tag
    if len(child_tags) != 0:
        # There are child tags
        for child in child_tags:
            # For each child tag set its parent equal to the parent of the current tag
            child.parent = tag.parent
        db.session.commit()
    # Delete tag and commit
    db.session.delete(tag)
    db.session.commit()
    return jsonify(message="Tag deleted")


@TagRoutes.route("/tagMastery", methods=["POST"])
@login_required
def tag_mastery():
    """
    Given a array of tag IDs give the tag IDs names and mastery to client
    :return: array of tag mastery names and Ids to client
    """
    if not request.json:
        return jsonify(error="")
    return jsonify(mastery=[{"ID": 2, "name": "Inverse", "mastery": 0.5},
                            {"ID": 5, "name": "Test input for tag value extra long to test the lengths of tag length", "mastery": 1.0},
                            {"ID": 7, "name": "Inverse", "mastery": 0.0}])


@TagRoutes.route("/getLessons", methods=["GET"])
@login_required
def get_lessons():
    """
    Get list of lessons for client with the tags associated with them and the lesson string
    :return: Array of lessons with the ID tag associated with lesson and lesson string
    """
    return jsonify(lessons=[{"ID": 1, "Tag": "Vectors", "string": "this is a test string"},
                            {"ID": 5, "Tag": "Matrix", "string": "this is also a testing of text"},
                            {"ID": 15, "Tag": "Addition of negative square roots to the power of the square root of 27.mp4", "string": "this is a test string"}])


def alchemy_to_dict(obj):
    """
    Converts SQLalchemy object to dict
    :param obj: the SQLalchemy object to convert
    :return: dict of SQLalchemy object
    """
    dicObj = obj.__dict__
    dicObj.pop('_sa_instance_state')
    return dicObj
