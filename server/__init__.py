from flask import Flask
from flask_compress import Compress
from server.auth import login_manager
from server.models import db
from server.routes import AnnouncementRoutes, ConceptRoutes, CourseRoutes, FileRoutes, LessonRoutes, MasteryRoutes, \
    OrganicContentRoutes, QuestionRoutes, QuestionSetRoutes, SectionRoutes, ServerRoutes, TakesRoutes, TestRoutes, UserRoutes, \
    UserSectionRoutes, ImageRoutes, WebHookRoutes
import paypalrestsdk
import config
# from flask_cors import CORS

# Configure PayPal
print(">>> PayPal is set to " + config.PAYPAL_MODE + " <<<")
paypalrestsdk.configure({
    'mode': config.PAYPAL_MODE,
    'client_id': config.PAYPAL_ID,
    'client_secret': config.PAYPAL_SECRET
})

# Create and configure the Flask App, attach the login manager, and attach the database
app = Flask(__name__, static_folder='../static/dist', template_folder='../static/dist')
app.config.from_object('config')
login_manager.init_app(app)
db.init_app(app)

# Attach the database blueprints
app.register_blueprint(AnnouncementRoutes)
app.register_blueprint(ConceptRoutes)
app.register_blueprint(CourseRoutes)
app.register_blueprint(FileRoutes)
app.register_blueprint(ImageRoutes)
app.register_blueprint(LessonRoutes)
app.register_blueprint(MasteryRoutes)
app.register_blueprint(OrganicContentRoutes)
app.register_blueprint(QuestionRoutes)
app.register_blueprint(QuestionSetRoutes)
app.register_blueprint(SectionRoutes)
app.register_blueprint(ServerRoutes)
app.register_blueprint(TakesRoutes)
app.register_blueprint(TestRoutes)
app.register_blueprint(UserRoutes)
app.register_blueprint(UserSectionRoutes)
app.register_blueprint(WebHookRoutes)

# Add gzip support
Compress(app)
# CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
