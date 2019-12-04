from flask import Blueprint, send_file, send_from_directory, request, session
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.getcwd() + '/tmp/'

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
    target = UPLOAD_FOLDER
    if not os.path.isdir(target):
        os.mkdir(target)
    file = request.files['file']
    filename = secure_filename(file.filename)
    destination = "/".join([target, filename])
    file.save(destination)
    session['uploadFilePath'] = destination
    return filename
