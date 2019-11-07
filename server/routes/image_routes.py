from typing import List

from flask import Blueprint, send_from_directory, abort

import config
from server.decorators import login_required, validate
from server.models import Image

ImageRoutes = Blueprint('ImageRoutes', __name__)


@ImageRoutes.route('/image/<filename>')
@login_required
def image(filename):
    i: Image = Image.query.get(filename)
    if i is None:
        return abort(404)
    else:
        return send_from_directory(config.image_dir, f'{filename}.{i.extension}')


@ImageRoutes.route('/searchImages', methods=['POST'])
@login_required
@validate(courseID=str, name=str)
def search_images(course_id: str, name: str):
    images: List[Image] = Image.query.filter(
        (Image.COURSE == course_id) & (Image.name.contains(name))
    ).all()
    return images
