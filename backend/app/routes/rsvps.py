# backend/app/routes/rsvps.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import RSVP, Event, Notification, Invite
from app.utils import jwt_required_custom, get_current_user

rsvps_bp = Blueprint('rsvps', __name__)

@rsvps_bp.route('/event/<int:event_id>', methods=['GET'])
@jwt_required_custom
def get_event_rsvps(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify([rsvp.to_dict() for rsvp in event.rsvps])

@rsvps_bp.route('/event/cint:event_ide', methods=['POST'])
@jwt_required_custom
def create_rsvp(event_id):
    current_user = get_current_user()
    event = Event.query.get_or_404(event_id)
    data = request.get_json()
    
    # Check if user is the creator OR has been invited to this event
    if event.user_id != current_user.id:
        invite = Invite.query.filter_by(
            event_id=event_id, 
            invitee_id=current_user.id
        ).first()
        if not invite:
            return jsonify({'message': 'Unauthorized - you are not invited to this event'}), 403
    
    existing_rsvp = RSVP.query.filter_by(user_id=current_user.id, event_id=event_id).first()
    
    if existing_rsvp:
        existing_rsvp.status = data['status']
        existing_rsvp.message = data.get('message')
        db.session.commit()
        
        # Create notification for event creator if RSVP is from an invited user
        if event.user_id != current_user.id:
            notification = Notification(
                user_id=event.user_id,
                type='rsvp_update',
                title=f'{current_user.username} updated their RSVP to {event.title}',
                message=f'Status: {data["status"]}. {data.get("message", "")}',
                related_id=event_id
            )
            db.session.add(notification)
            db.session.commit()
        
        return jsonify(existing_rsvp.to_dict())
    
    rsvp = RSVP(
        user_id=current_user.id,
        event_id=event_id,
        status=data['status'],
        message=data.get('message')
    )
    
    db.session.add(rsvp)
    db.session.commit()
    
    # Create notification for event creator if RSVP is from an invited user
    if event.user_id != current_user.id:
        notification = Notification(
            user_id=event.user_id,
            type='rsvp_new',
            title=f'{current_user.username} RSVP\'d to {event.title}',
            message=f'Status: {data["status"]}. {data.get("message", "")}',
            related_id=event_id
        )
        db.session.add(notification)
        db.session.commit()
    
    return jsonify(rsvp.to_dict()), 201


@rsvps_bp.route('/notifications', methods=['GET'])
@jwt_required_custom
def get_notifications():
    current_user = get_current_user()
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    return jsonify([notification.to_dict() for notification in notifications])

@rsvps_bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required_custom
def mark_notification_read(notification_id):
    current_user = get_current_user()
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first_or_404()
    
    notification.read = True
    db.session.commit()
    
    return jsonify(notification.to_dict())
