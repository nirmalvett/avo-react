from datetime import datetime
from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user

from server.auth import SectionRelations
from server.decorators import teacher_only, validate
from server.helpers import timestamp
from server.models import db, Message, UserSectionType

MessageRoutes = Blueprint('MessageRoutes', __name__)


@MessageRoutes.route('/getMessages', methods=['POST'])
@teacher_only
@validate(sectionID=int)
def get_messages(section_id: int):
    """
    Get list of all messages for a given section
    :return: List of messages given the section ID
    """
    if UserSectionType.TEACHER not in SectionRelations(section_id).active:
        return jsonify(error="user does not teach section")
    messages: List[Message] = Message.query.filter(Message.SECTION == section_id).all()
    result = list(map(lambda m: {
        'messageID': m.MESSAGE,
        'header': m.header,
        'body': m.body,
        'timestamp': timestamp(m.timestamp)
    }, messages))
    return jsonify(messages=result)


@MessageRoutes.route('/addMessage', methods=['POST'])
@teacher_only
@validate(sectionID=int, header=str, body=str)
def add_message(section_id: int, header: str, body: str):
    """
    Add message to the section
    :return: Confirmation that message has been created
    """
    if UserSectionType.TEACHER not in SectionRelations(section_id).active:
        return jsonify(error="user does not teach section")
    db.session.add(Message(section_id, current_user.USER, header, body, datetime.now()))
    db.session.commit()
    return jsonify({})


@MessageRoutes.route("/editMessage", methods=['POST'])
@teacher_only
@validate(messageID=int, header=str, body=str)
def edit_message(message_id: int, header: str, body: str):
    """
    Edit an already existing message
    :return: Confirmation that the message has been changed
    """
    message = Message.query.get(message_id)
    if message is None:
        return jsonify(error="No Message was found")
    if UserSectionType.TEACHER not in SectionRelations(message.SECTION).active:
        return jsonify(error="User does not teach section")
    message.header = header
    message.body = body
    message.timestamp = datetime.now()
    db.session.commit()
    return jsonify({})


@MessageRoutes.route("/deleteMessage", methods=["POST"])
@teacher_only
@validate(messageID=int)
def delete_message(message_id: int):
    current_message = Message.query.get(message_id)
    if current_message is None:
        return jsonify(error="Message not found")
    if UserSectionType.TEACHER not in SectionRelations(current_message.SECTION).active:
        return jsonify(error="User does not teach section")
    db.session.delete(current_message)
    db.session.commit()
    return jsonify({})
