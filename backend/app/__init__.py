# backend/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    jwt.init_app(app)
    
    from .routes.auth import auth_bp
    from .routes.events import events_bp
    from .routes.tasks import tasks_bp
    from .routes.rsvps import rsvps_bp
    from .routes.invites import invites_bp
    from .routes.profile import profile_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(events_bp, url_prefix='/events')
    app.register_blueprint(tasks_bp, url_prefix='/tasks')
    app.register_blueprint(rsvps_bp, url_prefix='/rsvps')
    app.register_blueprint(invites_bp, url_prefix='/invites')
    app.register_blueprint(profile_bp, url_prefix='/profile')
    
    return app
    