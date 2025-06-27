# backend/app/routes/events.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models import Event
from app.utils import jwt_required_custom, get_current_user

events_bp = Blueprint('events', __name__)

@events_bp.route('', methods=['GET'])
@jwt_required_custom
def get_events():
    events = Event.query.filter(Event.date >= datetime.utcnow()).all()
    return jsonify([event.to_dict() for event in events])

@events_bp.route('/past', methods=['GET'])
@jwt_required_custom
def get_past_events():
    events = Event.query.filter(Event.date < datetime.utcnow()).all()
    return jsonify([event.to_dict() for event in events])

@events_bp.route('', methods=['POST'])
@jwt_required_custom
def create_event():
    data = request.get_json()
    current_user = get_current_user()
    
    event = Event(
        title=data['title'],
        description=data.get('description'),
        date=datetime.fromisoformat(data['date']),
        location=data.get('location'),
        user_id=current_user.id
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify(event.to_dict()), 201

@events_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required_custom
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
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
        event.date = datetime.fromisoformat(data['date'])
    
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
