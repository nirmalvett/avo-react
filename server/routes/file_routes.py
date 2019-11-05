from flask import Blueprint, send_file, send_from_directory

FileRoutes = Blueprint('FileRoutes', __name__)


@FileRoutes.route('/')
def serve_web_app():
    return send_file('../static/index.html')


@FileRoutes.route('/css/app.css')
def serve_css_1():
    return send_file('../static/css/app.css')


# noinspection PyUnusedLocal
@FileRoutes.route('/<path:path>/css/app.css')
def serve_css_2(path):
    return send_file('../static/css/app.css')


@FileRoutes.route('/img/<filename>')
def serve_img_1(filename):
    return send_from_directory('../static/img', filename)


# noinspection PyUnusedLocal
@FileRoutes.route('/<path:path>/img/<filename>')
def serve_img_2(path, filename):
    return send_from_directory('../static/img', filename)


@FileRoutes.route('/favicon.ico')
def serve_icon_1():
    return send_file('../static/favicon.ico')


# noinspection PyUnusedLocal
@FileRoutes.route('/<path:path>/favicon.ico')
def serve_icon_2(path):
    return send_file('../static/favicon.ico')


# noinspection PyUnusedLocal
@FileRoutes.route('/<path:path>/dist/<filename>')
def serve_dist_file(path, filename):
    return send_from_directory('../static/dist/', filename, conditional=True)
