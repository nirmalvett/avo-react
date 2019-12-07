from typing import List

from flask import Blueprint, send_from_directory, abort, redirect, jsonify
from flask_login import current_user

import config
from server.decorators import login_required, validate, teacher_only
from server.models import Image

ImageRoutes = Blueprint('ImageRoutes', __name__)


@ImageRoutes.route('/image/<filename>')
@login_required
def image(filename):
    i: Image = Image.query.get(filename)
    if i is None:
        return abort(404)
    else:
        return redirect(i.url, code=302)


@ImageRoutes.route('/getImages')
@teacher_only
def get_images():
    images = Image.query.filter(
        (Image.USER == current_user.USER)
    ).all()
    return jsonify({'images': {i.IMAGE: i.url for i in images}})
