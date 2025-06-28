# backend/app/utils.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, jwt_required
from app.models import User

def jwt_required_custom(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Invalid or missing token'}), 401
    return decorated_function

def get_current_user():
    try:
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except Exception as e:
        return None
