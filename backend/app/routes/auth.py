# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import db
from app.models import User
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/test-db', methods=['GET'])
def test_db():
    try:
        # Test basic database query
        users = User.query.all()
        
        # Check table structure
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        columns = inspector.get_columns('user')
        password_hash_col = next((col for col in columns if col['name'] == 'password_hash'), None)
        
        return jsonify({
            'message': 'Database working', 
            'user_count': len(users),
            'password_hash_column_length': password_hash_col['type'].length if password_hash_col else 'Unknown'
        })
    except Exception as e:
        print(f"Database test error: {e}")
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        print("Registration attempt started")
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        if 'username' not in data or 'email' not in data or 'password' not in data:
            return jsonify({'message': 'Missing required fields'}), 400
        
        print(f"Checking if username {data['username']} exists...")
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({'message': 'Username already exists'}), 400
        
        print(f"Checking if email {data['email']} exists...")
        existing_email = User.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({'message': 'Email already exists'}), 400
        
        print("Creating new user...")
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        
        print("Adding user to database...")
        db.session.add(user)
        db.session.commit()
        print("User created successfully")
        
        # Convert user ID to string for JWT
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Error in register: {e}")
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        if 'username' not in data or 'password' not in data:
            return jsonify({'message': 'Missing username or password'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            # Convert user ID to string for JWT
            access_token = create_access_token(identity=str(user.id))
            return jsonify({
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        
        return jsonify({'message': 'Invalid credentials'}), 401
        
    except Exception as e:
        print(f"Error in login: {e}")
        print(traceback.format_exc())
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500
        