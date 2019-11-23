from flask import Blueprint, send_file, send_from_directory

FileRoutes = Blueprint('FileRoutes', __name__)


@FileRoutes.route('/')
def serve_web_app():
    return send_file('../static/dist/index.html')


# noinspection PyUnusedLocal
@FileRoutes.route('/<filename>')
def serve_dist_file(filename):
    return send_from_directory('../static/dist/', filename, conditional=True)
