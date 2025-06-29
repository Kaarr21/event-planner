# backend/app/routes/profile.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from app.utils import jwt_required_custom, get_current_user

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['GET'])
@jwt_required_custom
def get_profile():
    """Get current user's profile information"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(current_user.to_dict())

@profile_bp.route('', methods=['PUT'])
@jwt_required_custom
def update_profile():
    """Update current user's profile information"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    # Check if new username is already taken (if username is being changed)
    if 'username' in data and data['username'] != current_user.username:
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({'message': 'Username already exists'}), 400
    
    # Check if new email is already taken (if email is being changed)
    if 'email' in data and data['email'] != current_user.email:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'message': 'Email already exists'}), 400
    
    # Update fields if provided
    if 'username' in data:
        current_user.username = data['username']
    if 'email' in data:
        current_user.email = data['email']
    
    try:
        db.session.commit()
        return jsonify(current_user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating profile: {str(e)}'}), 500

@profile_bp.route('/delete', methods=['DELETE'])
@jwt_required_custom
def delete_account():
    """Delete current user's account"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        db.session.delete(current_user)
        db.session.commit()
        return jsonify({'message': 'Account deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting account: {str(e)}'}), 500

@profile_bp.route('/change-password', methods=['PUT'])
@jwt_required_custom
def change_password():
    """Change user's password"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'message': 'Current password and new password are required'}), 400
    
    # Verify current password
    if not current_user.check_password(data['current_password']):
        return jsonify({'message': 'Current password is incorrect'}), 400
    
    # Validate new password
    if len(data['new_password']) < 6:
        return jsonify({'message': 'New password must be at least 6 characters long'}), 400
    
    # Update password
    current_user.set_password(data['new_password'])
    
    try:
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating password: {str(e)}'}), 500
