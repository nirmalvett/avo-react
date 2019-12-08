from flask import Blueprint, send_file, send_from_directory, request, session, jsonify
import os

from flask_login import current_user
from werkzeug.utils import secure_filename

import boto3

from server import db
from server.decorators import teacher_only, validate, login_required
from server.models import Image
from config import S3_BUCKET, S3_LOCATION


FileRoutes = Blueprint('FileRoutes', __name__)


@FileRoutes.route('/')
def serve_web_app():
    return send_file('../static/dist/index.html')


# noinspection PyUnusedLocal
@FileRoutes.route('/<filename>')
def serve_dist_file(filename):
    return send_from_directory('../static/dist/', filename, conditional=True)


@FileRoutes.route('/upload', methods=['POST'])
@teacher_only
def file_upload():
    file = request.files.get('file')
    if file is None:
        return 'Error: please send a file'
    filename = f'{current_user.USER}__{secure_filename(file.filename)}'

    try:
        # need to run `aws configure` to link account so this works
        client = boto3.client('s3', region_name='ca-central-1')

        client.upload_fileobj(
            file,
            S3_BUCKET,
            filename,
            ExtraArgs={
                "ACL": 'public-read',
                "ContentType": file.content_type
            }
        )

    except Exception as e:
        print(e)
        return 'Error: could not upload'
    url = "{}{}".format(S3_LOCATION, filename)

    img = Image(url=url, user_id=current_user.USER)
    db.session.add(img)
    db.session.commit()
    return url
