# backend/app/utils.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, jwt_required
from app.models import User

def jwt_required_custom(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            from flask import request
            print(f"JWT Auth attempt for {request.method} {request.path}")
            auth_header = request.headers.get('Authorization')
            print(f"Authorization header: {auth_header}")
            
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            print(f"JWT verified successfully for user ID: {user_id}")
            return f(*args, **kwargs)
        except Exception as e:
            print(f"JWT verification failed: {e}")
            return jsonify({'message': 'Invalid or missing token'}), 401
    return decorated_function

def get_current_user():
    try:
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except Exception as e:
        return None
