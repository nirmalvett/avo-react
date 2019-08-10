from flask import Blueprint, jsonify
from server.decorators import teacher_only, validate
from server.models import db, Tag

TagRoutes = Blueprint('TagRoutes', __name__)


@TagRoutes.route('/getTags')
@teacher_only
def get_tags():
    """
    For now this route will return all tags from the database
    :return: The list of tags
    """
    list_of_tags = Tag.query.all()
    list_dict = []
    for tag in list_of_tags:
        list_dict.append({
            'tagID': tag.TAG,
            'parent': tag.parent,
            'tagName': tag.tagName,
            'childOrder': tag.childOrder,
        })
    return jsonify(tags=list_dict)


@TagRoutes.route('/putTags', methods=['POST'])
@teacher_only
@validate(tags=list)
def put_tags(tags: list):
    """
        We will expect the following from the web
        {
            tags: [....]
        }

        Where each object in the lists will contain information for a given concept. Here is an example
        {'tagName': 'Linear Algebra', 'TAG': 0, 'parent': null, 'childOrder': 0}
    """
    input_tags = tags
    tag_ids = list(map(lambda t: t['tagID'], input_tags))

    if len(set(tag_ids)) == len(tag_ids):
        return jsonify(error="Duplicate tag")

    # Now loop through each object from the list
    # so first we'll get a list of all the tag objects
    tag_list = Tag.query.filter(Tag.TAG.in_(tag_ids)).all()
    if len(tag_list) != len(tag_ids):
        return jsonify(error="One or more tags not found")

    for tag in tag_list:
        tag_new_data = list(filter(lambda t: tag.TAG == t['tagID'], input_tags))[0]
        tag.parent = tag_new_data['parent']
        tag.tagName = tag_new_data['tagName']
        tag.childOrder = tag_new_data['childOrder']
    db.session.commit()

    return jsonify({})


@TagRoutes.route('/addTag', methods=['POST'])
@teacher_only
@validate(name=str)
def add_tag(name):
    tag_obj = Tag(None, name, 0)
    db.session.add(tag_obj)
    db.session.commit()
    return jsonify(tagID=tag_obj.TAG)


@TagRoutes.route("/deleteTag", methods=['POST'])
@teacher_only
@validate(tagID=None)
def delete_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if tag is None:
        return jsonify(error="Tag does not exist")
    child_tags = tag.query.filter(Tag.parent == tag.parent).all()  # Get all child tags of current tag
    for child in child_tags:
        child.parent = tag.parent  # For each child tag set its parent equal to the parent of the current tag
    db.session.delete(tag)
    db.session.commit()
    return jsonify({})
