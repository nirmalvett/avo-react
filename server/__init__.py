from flask import Flask
from config import SECRET_KEY

from server.auth import login_manager, UserRoutes
from server.files import FileRoutes

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')
login_manager.init_app(app)
app.secret_key = SECRET_KEY


app.register_blueprint(UserRoutes)
app.register_blueprint(FileRoutes)