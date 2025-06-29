# backend/app/routes/invites.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models import Invite, User, Event, Notification
from app.utils import jwt_required_custom, get_current_user

invites_bp = Blueprint('invites', __name__)

@invites_bp.route('', methods=['GET'])
@jwt_required_custom
def get_user_invites():
    """Get all invites for the current user"""
    current_user = get_current_user()
    invites = Invite.query.filter_by(invitee_id=current_user.id).all()
    return jsonify([invite.to_dict() for invite in invites])

@invites_bp.route('/<int:invite_id>/respond', methods=['POST'])
@jwt_required_custom
def respond_to_invite(invite_id):
    """Respond to an invitation (accept/decline)"""
    current_user = get_current_user()
    invite = Invite.query.get_or_404(invite_id)
    
    if invite.invitee_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    status = data.get('status')
    response_message = data.get('message', '')
    
    if status not in ['accepted', 'declined']:
        return jsonify({'message': 'Status must be accepted or declined'}), 400
    
    invite.status = status
    invite.message = response_message
    invite.responded_at = datetime.utcnow()
    
    db.session.commit()
    
    # Create notification for the inviter
    notification = Notification(
        user_id=invite.inviter_id,
        type='invite_response',
        title=f'{current_user.username} {status} your invite to {invite.event.title}',
        message=response_message,
        related_id=invite.id
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify(invite.to_dict())

@invites_bp.route('/<int:invite_id>/cancel', methods=['DELETE'])
@jwt_required_custom
def cancel_invite(invite_id):
    """Cancel an invitation"""
    current_user = get_current_user()
    invite = Invite.query.get_or_404(invite_id)
    
    # Only the invitee can cancel their own invite
    if invite.invitee_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Can only cancel pending invites
    if invite.status != 'pending':
        return jsonify({'message': 'Can only cancel pending invites'}), 400
    
    # Create notification for the inviter
    notification = Notification(
        user_id=invite.inviter_id,
        type='invite_cancelled',
        title=f'{current_user.username} cancelled their invite to {invite.event.title}',
        message='',
        related_id=invite.id
    )
    
    db.session.add(notification)
    db.session.delete(invite)
    db.session.commit()
    
    return jsonify({'message': 'Invite cancelled successfully'})

@invites_bp.route('/sent', methods=['GET'])
@jwt_required_custom
def get_sent_invites():
    """Get all invites sent by the current user"""
    current_user = get_current_user()
    invites = Invite.query.filter_by(inviter_id=current_user.id).all()
    return jsonify([invite.to_dict() for invite in invites])
