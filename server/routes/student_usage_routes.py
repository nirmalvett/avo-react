from flask import Blueprint, jsonify
from flask_login import current_user
from server.decorators import validate
from server.models import db, StudentUsage
import hashlib
from datetime import datetime
import os
from config import RESEARCH_ENABLED, RESEARCH_SALT
StudentUsageRoutes = Blueprint('StudentUsageRoutes', __name__)


@StudentUsageRoutes.route('/collectData', methods=['POST'])
@validate(eventType=str, data=dict)
def collect_data(event_type: str, data: dict):
    """
    Saves a piece of data we're collecting from the frontend
    """
    if RESEARCH_ENABLED:
        new_record = StudentUsage(
            student_id=str(hashlib.sha1(str.encode(current_user.email + RESEARCH_SALT)).hexdigest()),
            event_type=event_type,
            data=data,
            created_at=datetime.now()
        )
        db.session.add(new_record)
        db.session.commit()
    return jsonify({})