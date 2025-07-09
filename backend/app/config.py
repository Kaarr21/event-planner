# backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    
    # Handle both SQLite (dev) and PostgreSQL (prod)
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # Fix for Render PostgreSQL connection string
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql+psycopg://', 1)
        elif database_url.startswith('postgresql://'):
            database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Default to SQLite for local development
        SQLALCHEMY_DATABASE_URI = 'sqlite:///event_planner.db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Add database pool settings for PostgreSQL
    if database_url and 'postgresql' in database_url:
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
        }
    