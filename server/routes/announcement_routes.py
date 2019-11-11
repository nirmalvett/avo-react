from datetime import datetime
from typing import List

from flask import Blueprint, jsonify
from flask_login import current_user

from server.auth import SectionRelations
from server.decorators import teacher_only, validate
from server.helpers import timestamp
from server.models import db, Announcement, UserSectionType

AnnouncementRoutes = Blueprint('AnnouncementRoutes', __name__)


@AnnouncementRoutes.route('/getAnnouncements', methods=['POST'])
@teacher_only
@validate(sectionID=int)
def get_announcements(section_id: int):
    """
    Get list of all announcements for a given section
    :return: List of announcements given the section ID
    """
    if UserSectionType.TEACHER not in SectionRelations(section_id).active:
        return jsonify(error="user does not teach section")
    announcements: List[Announcement] = Announcement.query.filter(Announcement.SECTION == section_id).all()
    result = list(map(lambda m: {
        'announcementID': m.ANNOUNCEMENT,
        'header': m.header,
        'body': m.body,
        'timestamp': timestamp(m.timestamp)
    }, announcements))
    return jsonify(announcements=result)


@AnnouncementRoutes.route('/addAnnouncement', methods=['POST'])
@teacher_only
@validate(sectionID=int, header=str, body=str)
def add_announcement(section_id: int, header: str, body: str):
    """
    Add announcement to the section
    :return: Confirmation that announcement has been created
    """
    if UserSectionType.TEACHER not in SectionRelations(section_id).active:
        return jsonify(error="user does not teach section")
    db.session.add(Announcement(section_id, current_user.USER, header, body, datetime.now()))
    db.session.commit()
    return jsonify({})


@AnnouncementRoutes.route("/editAnnouncement", methods=['POST'])
@teacher_only
@validate(announcementID=int, header=str, body=str)
def edit_announcement(announcement_id: int, header: str, body: str):
    """
    Edit an already existing announcement
    :return: Confirmation that the announcement has been changed
    """
    announcement = Announcement.query.get(announcement_id)
    if announcement is None:
        return jsonify(error="No Announcement was found")
    if UserSectionType.TEACHER not in SectionRelations(announcement.SECTION).active:
        return jsonify(error="User does not teach section")
    announcement.header = header
    announcement.body = body
    announcement.timestamp = datetime.now()
    db.session.commit()
    return jsonify({})


@AnnouncementRoutes.route("/deleteAnnouncement", methods=["POST"])
@teacher_only
@validate(announcementID=int)
def delete_announcement(announcement_id: int):
    current_announcement = Announcement.query.get(announcement_id)
    if current_announcement is None:
        return jsonify(error="Announcement not found")
    if UserSectionType.TEACHER not in SectionRelations(current_announcement.SECTION).active:
        return jsonify(error="User does not teach section")
    db.session.delete(current_announcement)
    db.session.commit()
    return jsonify({})
