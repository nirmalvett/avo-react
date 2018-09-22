from flask import Flask

from server.auth import login_manager, UserRoutes
from server.files import FileRoutes
from server.routes import routes
from server.models import db

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')
login_manager.init_app(app)
app.config.from_object('config')


app.register_blueprint(UserRoutes)
app.register_blueprint(FileRoutes)
app.register_blueprint(routes)

db.init_app(app)
