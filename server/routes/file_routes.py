from flask import Blueprint, send_file, render_template


FileRoutes = Blueprint('FileRoutes', __name__)


@FileRoutes.route('/')
def serve_web_app():
    """
    Serves the index
    :return: The index HTML
    """
    return render_template('index.html')


@FileRoutes.route('/favicon.ico')
def serve_icon():
    """
    Serves the FAVICON
    :return: The Favicon file
    """
    return send_file('../static/favicon.ico')


# noinspection PyUnusedLocal
@FileRoutes.route('/<path:path>/dist/<filename>')
def serve_static_file(path, filename):
    """
    Serves the file in the dist folder
    :param path: Path of the file in the dist folder
    :param filename: The filename of the file being requested
    :return: The file
    """
    return send_file('../static/dist/' + filename)
