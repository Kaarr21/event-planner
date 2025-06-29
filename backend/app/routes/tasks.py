# backend/app/routes/tasks.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models import Task, Event, Invite
from app.utils import jwt_required_custom, get_current_user

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/event/cint:event_ide', methods=['GET'])
@jwt_required_custom
def get_event_tasks(event_id):
    current_user = get_current_user()
    event = Event.query.get_or_404(event_id)
    
    # Check if user is the creator OR has been invited to this event
    if event.user_id != current_user.id:
        invite = Invite.query.filter_by(
            event_id=event_id, 
            invitee_id=current_user.id
        ).first()
        if not invite:
            return jsonify({'message': 'Unauthorized - you are not invited to this event'}), 403
    
    return jsonify([task.to_dict() for task in event.tasks])

@tasks_bp.route('/event/<int:event_id>', methods=['POST'])
@jwt_required_custom
def create_task(event_id):
    try:
        event = Event.query.get_or_404(event_id)
        current_user = get_current_user()
        
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        if event.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({'message': 'Title is required'}), 400
        
        # Parse due_date if provided
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data['due_date'])
            except (ValueError, TypeError):
                return jsonify({'message': 'Invalid due date format'}), 400
        
        task = Task(
            title=data['title'],
            description=data.get('description'),
            due_date=due_date,
            event_id=event_id
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify(task.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating task: {str(e)}'}), 500

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required_custom
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    current_user = get_current_user()
    
    if task.event.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.completed = data.get('completed', task.completed)
    
    if 'due_date' in data:
        task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
    
    db.session.commit()
    return jsonify(task.to_dict())

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required_custom
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    current_user = get_current_user()
    
    if task.event.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted'}), 200
