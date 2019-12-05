from flask import Blueprint, send_file, send_from_directory, request, session, jsonify
import os
from werkzeug.utils import secure_filename

import boto3

S3_BUCKET = 'avo-frontend'

S3_LOCATION = 'http://{}.s3.amazonaws.com/'.format(S3_BUCKET)

FileRoutes = Blueprint('FileRoutes', __name__)


@FileRoutes.route('/')
def serve_web_app():
    return send_file('../static/dist/index.html')


# noinspection PyUnusedLocal
@FileRoutes.route('/<filename>')
def serve_dist_file(filename):
    return send_from_directory('../static/dist/', filename, conditional=True)


@FileRoutes.route('/upload', methods=['POST'])
def file_upload():
    file = request.files.get('file')
    if file is None:
        return 'Error: please send a file'
    filename = secure_filename(file.filename)

    try:
        # need to run `aws configure` to link account so this works
        client = boto3.client('s3', region_name='us-east-2')

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

    return "{}{}".format(S3_LOCATION, file.filename)
