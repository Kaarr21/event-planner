# backend/app/routes/tasks.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models import Task, Event
from app.utils import jwt_required_custom, get_current_user

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/event/<int:event_id>', methods=['GET'])
@jwt_required_custom
def get_event_tasks(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify([task.to_dict() for task in event.tasks])

@tasks_bp.route('/event/<int:event_id>', methods=['POST'])
@jwt_required_custom
def create_task(event_id):
    event = Event.query.get_or_404(event_id)
    current_user = get_current_user()
    
    if event.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    task = Task(
        title=data['title'],
        description=data.get('description'),
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
        event_id=event_id
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

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
