# backend/app/routes/ai.py
from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
from app.utils import jwt_required_custom, get_current_user
from app.models import Event
import traceback

ai_bp = Blueprint('ai', __name__)
ai_service = AIService()

@ai_bp.route('/generate-description', methods=['POST'])
@jwt_required_custom
def generate_description():
    """Generate event description using AI"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        title = data.get('title', '')
        event_type = data.get('event_type', '')
        location = data.get('location', '')
        additional_info = data.get('additional_info', '')
        
        if not title:
            return jsonify({'message': 'Event title is required'}), 400
        
        description = ai_service.generate_event_description(
            title=title,
            event_type=event_type,
            location=location,
            additional_info=additional_info
        )
        
        return jsonify({'description': description})
        
    except Exception as e:
        print(f"Error generating description: {e}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to generate description'}), 500

@ai_bp.route('/suggest-tasks', methods=['POST'])
@jwt_required_custom
def suggest_tasks():
    """Suggest tasks for an event using AI"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        title = data.get('title', '')
        event_type = data.get('event_type', '')
        date_str = data.get('date', '')
        attendee_count = data.get('attendee_count')
        
        if not title:
            return jsonify({'message': 'Event title is required'}), 400
        
        tasks = ai_service.suggest_tasks_for_event(
            title=title,
            event_type=event_type,
            date_str=date_str,
            attendee_count=attendee_count
        )
        
        return jsonify({'tasks': tasks})
        
    except Exception as e:
        print(f"Error suggesting tasks: {e}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to suggest tasks'}), 500

@ai_bp.route('/generate-rsvp', methods=['POST'])
@jwt_required_custom
def generate_rsvp():
    """Generate RSVP message using AI"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        event_title = data.get('event_title', '')
        status = data.get('status', '')
        user_context = data.get('user_context', '')
        
        if not event_title or not status:
            return jsonify({'message': 'Event title and status are required'}), 400
        
        message = ai_service.generate_rsvp_message(
            event_title=event_title,
            status=status,
            user_context=user_context
        )
        
        return jsonify({'message': message})
        
    except Exception as e:
        print(f"Error generating RSVP: {e}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to generate RSVP message'}), 500

@ai_bp.route('/chat', methods=['POST'])
@jwt_required_custom
def chat_assistant():
    """Interactive event planning chat assistant"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        user_message = data.get('message', '')
        event_id = data.get('event_id')
        conversation_history = data.get('conversation_history', [])
        
        if not user_message:
            return jsonify({'message': 'Message is required'}), 400
        
        # Get event context if event_id provided
        event_context = None
        if event_id:
            event = Event.query.get(event_id)
            if event and (event.user_id == current_user.id or 
                         any(invite.invitee_id == current_user.id for invite in event.invites)):
                event_context = {
                    'title': event.title,
                    'description': event.description,
                    'date': event.date.isoformat(),
                    'location': event.location,
                    'tasks': [task.to_dict() for task in event.tasks],
                    'rsvps': [rsvp.to_dict() for rsvp in event.rsvps]
                }
        
        response = ai_service.chat_event_planning(
            user_message=user_message,
            event_context=event_context,
            conversation_history=conversation_history
        )
        
        return jsonify({'response': response})
        
    except Exception as e:
        print(f"Error in chat assistant: {e}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to get assistant response'}), 500

@ai_bp.route('/optimize-timing', methods=['POST'])
@jwt_required_custom
def optimize_timing():
    """Get timing optimization suggestions for an event"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        event_details = data.get('event_details', {})
        
        if not event_details.get('title'):
            return jsonify({'message': 'Event details are required'}), 400
        
        suggestions = ai_service.optimize_event_timing(event_details)
        
        return jsonify({'suggestions': suggestions})
        
    except Exception as e:
        print(f"Error optimizing timing: {e}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to optimize timing'}), 500
        