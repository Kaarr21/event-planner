# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import db
from app.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'message': 'No data provided'}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({'message': 'Username, email, and password are required'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'Username already exists'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists'}), 400

        user = User(username=username, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401
