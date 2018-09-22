from flask import Flask
from flask_compress import Compress

from server.models import db
from server.auth import login_manager, UserRoutes
from server.files import FileRoutes
from server.routes import routes

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')
login_manager.init_app(app)
app.config.from_object('config')

db.init_app(app)

app.register_blueprint(UserRoutes)
app.register_blueprint(FileRoutes)
app.register_blueprint(routes)

Compress(app)
