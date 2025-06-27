# backend/app/routes/rsvps.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import RSVP, Event
from app.utils import jwt_required_custom, get_current_user

rsvps_bp = Blueprint('rsvps', __name__)

@rsvps_bp.route('/event/<int:event_id>', methods=['GET'])
@jwt_required_custom
def get_event_rsvps(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify([rsvp.to_dict() for rsvp in event.rsvps])

@rsvps_bp.route('/event/<int:event_id>', methods=['POST'])
@jwt_required_custom
def create_rsvp(event_id):
    event = Event.query.get_or_404(event_id)
    current_user = get_current_user()
    data = request.get_json()
    
    existing_rsvp = RSVP.query.filter_by(user_id=current_user.id, event_id=event_id).first()
    
    if existing_rsvp:
        existing_rsvp.status = data['status']
        existing_rsvp.message = data.get('message')
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
    
    return jsonify(rsvp.to_dict()), 201
