# backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'postgresql://planner_user:Karokin35!@localhost/event_planner_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Additional settings for production
    FLASK_ENV = os.environ.get('FLASK_ENV', 'production')
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    # Render specific settings
    PORT = int(os.environ.get('PORT', 5000))
    