from flask import Blueprint, jsonify
from server.decorators import teacher_only, validate
from server.models import db, Tag

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
        list_dict.append({
            'TAG': tag.TAG,
            'parent': tag.parent,
            'tagName': tag.tagName,
            'childOrder': tag.childOrder,
        })
    return list_dict


@TagRoutes.route('/putTags', methods=['PUT'])
@teacher_only
@validate(tags=list)
def put_tags_route(tags: list):
    """
        We will expect the following from the web
        {
            tags: [....]
        }

        Where each object in the lists will contain information for a given concept. Here is an example
        {'tagName': 'Linear Algebra', 'TAG': 0, 'parent': null, 'childOrder': 0}

    """
    tag_ids = list(map(lambda t: t['TAG'], tags))

    # Now loop through each object from the list
    # so first we'll get a list of all the tag objects
    tag_list = Tag.query.filter(Tag.TAG.in_(tag_ids)).all()
    if len(tag_list) != len(tag_ids):
        return jsonify(error="One or more tags not found")

    for tag in tag_list:
        tag_new_data = [d for d in tags if tag.TAG == d['TAG']]
        tag.parent = tag_new_data[0]['parent']
        tag.tagName = tag_new_data[0]['tagName']
        tag.childOrder = tag_new_data[0]['childOrder']
    db.session.commit()

    return jsonify(message='Changed successfully!')


@TagRoutes.route('/addTag', methods=['POST'])
@teacher_only
@validate(name=str)
def add_tag_route(name):
    """
        Expects
        {tag: {'tagName': 'Linear Algebra' }}
    """
    tag_obj = Tag(None, name, 0)  # Tag to be added to database
    db.session.add(tag_obj)
    db.session.commit()
    return jsonify(
        tagID=tag_obj.TAG
    )


@TagRoutes.route("/deleteTag", methods=['POST'])
@teacher_only
@validate(tag=None)
def delete_tag(tag):
    tag_id = tag['TAG']  # ID of tag to be removed
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
