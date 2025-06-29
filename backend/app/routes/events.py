# backend/app/routes/events.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models import Event, User, Invite, Notification
from app.utils import jwt_required_custom, get_current_user

events_bp = Blueprint('events', __name__)

@events_bp.route('', methods=['GET'])
@jwt_required_custom
def get_events():
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    events = Event.query.filter(
        Event.user_id == current_user.id,
        Event.date >= datetime.utcnow()
    ).all()
    return jsonify([event.to_dict() for event in events])

@events_bp.route('/past', methods=['GET'])
@jwt_required_custom
def get_past_events():
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    events = Event.query.filter(
        Event.user_id == current_user.id,
        Event.date < datetime.utcnow()
    ).all()
    return jsonify([event.to_dict() for event in events])

@events_bp.route('/invited', methods=['GET'])
@jwt_required_custom
def get_invited_events():
    """Get events the current user has been invited to"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    # Get all invites for the current user
    invites = Invite.query.filter_by(invitee_id=current_user.id).all()
    
    # Get the events from those invites
    invited_events = []
    for invite in invites:
        event_data = invite.event.to_dict()
        event_data['invite_status'] = invite.status
        event_data['invite_message'] = invite.message
        event_data['invite_id'] = invite.id
        event_data['invited_at'] = invite.created_at.isoformat()
        invited_events.append(event_data)
    
    return jsonify(invited_events)

@events_bp.route('', methods=['POST'])
@jwt_required_custom
def create_event():
    try:
        data = request.get_json()
        current_user = get_current_user()
        
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'message': 'Title is required'}), 400
        if not data.get('date'):
            return jsonify({'message': 'Date is required'}), 400
        
        # Parse date with better error handling
        try:
            date_str = data['date']
            # Handle different date formats
            if 'T' in date_str and not date_str.endswith('Z'):
                # datetime-local format from HTML input
                event_date = datetime.fromisoformat(date_str)
            elif date_str.endswith('Z'):
                # ISO format with Z
                event_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                # Try parsing as-is
                event_date = datetime.fromisoformat(date_str)
        except (ValueError, TypeError) as e:
            return jsonify({'message': f'Invalid date format: {str(e)}'}), 400
        
        event = Event(
            title=data['title'],
            description=data.get('description'),
            date=event_date,
            location=data.get('location'),
            user_id=current_user.id
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify(event.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating event: {str(e)}'}), 500


@events_bp.route('/<int:event_id>/invite', methods=['POST'])
@jwt_required_custom
def send_invite(event_id):
    data = request.get_json()
    current_user = get_current_user()

    if not data.get('email'):
        return jsonify({'message': 'Email is required'}), 400
    
    invitee = User.query.filter_by(email=data['email']).first()
    if not invitee:
        return jsonify({'message': 'No user with this email'}), 404

    existing_invite = Invite.query.filter_by(event_id=event_id, invitee_email=data['email']).first()
    if existing_invite:
        return jsonify({'message': 'Invite already sent to this email'}), 400

    invite = Invite(
        event_id=event_id,
        inviter_id=current_user.id,
        invitee_email=data['email'],
        invitee_id=invitee.id if invitee else None,
        message=data.get('message')
    )

    db.session.add(invite)
    db.session.commit()

    notification = Notification(
        user_id=invitee.id,
        type='invite',
        title=f'You are invited to {invite.event.title}',
        message=invite.message or '',
        related_id=invite.id
    )

    db.session.add(notification)
    db.session.commit()

    return jsonify(invite.to_dict()), 201

@events_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required_custom
def get_event(event_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    event = Event.query.get_or_404(event_id)
    
    # Check if user is the creator OR has been invited to this event
    if event.user_id != current_user.id:
        invite = Invite.query.filter_by(
            event_id=event_id, 
            invitee_id=current_user.id
        ).first()
        if not invite:
            return jsonify({'message': 'Unauthorized - you are not invited to this event'}), 403
    
    return jsonify(event.to_dict())

@events_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required_custom
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    current_user = get_current_user()
    
    if event.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    event.title = data.get('title', event.title)
    event.description = data.get('description', event.description)
    event.location = data.get('location', event.location)
    
    if 'date' in data:
        try:
            date_str = data['date']
            # Handle different date formats
            if 'T' in date_str and not date_str.endswith('Z'):
                # datetime-local format from HTML input
                event.date = datetime.fromisoformat(date_str)
            elif date_str.endswith('Z'):
                # ISO format with Z
                event.date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                # Try parsing as-is
                event.date = datetime.fromisoformat(date_str)
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid date format'}), 400
    
    db.session.commit()
    return jsonify(event.to_dict())

@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required_custom
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    current_user = get_current_user()
    
    if event.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({'message': 'Event deleted'}), 200
