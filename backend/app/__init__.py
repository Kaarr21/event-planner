# backend/app/__init__.py
from flask import Flask, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='')
    app.config.from_object(Config)
    
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    jwt.init_app(app)
    
    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    from app.routes.tasks import tasks_bp
    from app.routes.rsvps import rsvps_bp
    from app.routes.invites import invites_bp
    from app.routes.profile import profile_bp
    
    # Register API blueprints with /api prefix
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(rsvps_bp, url_prefix='/api/rsvps')
    app.register_blueprint(invites_bp, url_prefix='/api/invites')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        try:
            # Test database connection
            with db.engine.connect() as conn:
                conn.execute(db.text('SELECT 1'))
            return {'status': 'healthy', 'database': 'connected'}
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}, 500
    
    # Serve React app
    @app.route('/')
    def serve_react_app():
        return send_from_directory(app.static_folder, 'index.html')
    
    # Serve static files
    @app.route('/<path:path>')
    def serve_static(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')
    
    return app
    