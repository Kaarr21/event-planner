# backend/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

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
    
    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    from app.routes.tasks import tasks_bp
    from app.routes.rsvps import rsvps_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(events_bp, url_prefix='/events')
    app.register_blueprint(tasks_bp, url_prefix='/tasks')
    app.register_blueprint(rsvps_bp, url_prefix='/rsvps')
    
    return app
    