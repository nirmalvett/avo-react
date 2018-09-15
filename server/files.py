from flask import Blueprint, send_file, render_template


FileRoutes = Blueprint('FileRoutes', __name__)


@FileRoutes.route('/favicon.ico')
def serve_icon():
    return send_file('../static/favicon.ico')


@FileRoutes.route('/')
def serve_sign_in():
    # noinspection PyUnresolvedReferences
    return render_template('/index.html')


# noinspection PyUnusedLocal
@FileRoutes.route('/<path:path>/dist/<filename>')
def serve_static_file(path, filename):
    return send_file('../static/dist/' + filename)
