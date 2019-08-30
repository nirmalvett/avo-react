from flask import Flask
from flask_compress import Compress
from server.auth import login_manager
from server.models import db
from server.routes import ClassRoutes, FileRoutes, QuestionRoutes, ServerRoutes, TestRoutes, UserRoutes, TagRoutes
import paypalrestsdk
import config
from flask_cors import CORS
import os
env = os.environ.get("ENV", None)
print(env)
# Configure PayPal
print(">>> PayPal is set to " + config.PAYPAL_MODE + " <<<")
paypalrestsdk.configure({
    'mode': config.PAYPAL_MODE,
    'client_id': config.PAYPAL_ID,
    'client_secret': config.PAYPAL_SECRET
})

# Create and configure the Flask App, attach the login manager, and attach the database
app = Flask(__name__, static_folder='../static/dist', template_folder='../static')
app.config.from_object('config')
login_manager.init_app(app)
db.init_app(app)

# Attach the database blueprints
app.register_blueprint(ClassRoutes)
app.register_blueprint(FileRoutes)
app.register_blueprint(QuestionRoutes)
app.register_blueprint(ServerRoutes)
app.register_blueprint(TestRoutes)
app.register_blueprint(UserRoutes)
app.register_blueprint(TagRoutes)

# Add gzip support
Compress(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://avo-frontend.s3-website.us-east-2.amazonaws.com/*", "http://localhost/*", "https://d1tnjp7zr1fy56.cloudfront.net/*"] if env != 'prod' else "http://avo-frontend.s3-website.us-east-2.amazonaws.com/*"}})
