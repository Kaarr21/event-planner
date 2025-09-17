# backend/app/services/ai_service.py
import requests
import json
from typing import Dict, List, Optional
from flask import current_app

class AIService:
    """
    AI service for event planning assistance using Claude API
    """
    
    def __init__(self):
        self.api_url = "https://api.anthropic.com/v1/messages"
        self.model = "claude-sonnet-4-20250514"
    
    def _make_request(self, messages: List[Dict], max_tokens: int = 1000) -> str:
        """Make request to Claude API"""
        try:
            response = requests.post(
                self.api_url,
                headers={
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "max_tokens": max_tokens,
                    "messages": messages
                },
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            return data['content'][0]['text']
            
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"AI API request failed: {e}")
            raise Exception("AI service temporarily unavailable")
    
    def generate_event_description(self, title: str, event_type: str = None, 
                                 location: str = None, additional_info: str = None) -> str:
        """Generate an engaging event description"""
        
        prompt = f"""Create an engaging and professional event description for: "{title}"
        
Event details:
- Type: {event_type or 'Not specified'}
- Location: {location or 'Not specified'}
- Additional info: {additional_info or 'None'}

Requirements:
- Keep it concise (2-3 sentences)
- Make it engaging and inviting
- Include relevant details that would interest attendees
- Professional but friendly tone

Only return the description text, nothing else."""

        messages = [{"role": "user", "content": prompt}]
        return self._make_request(messages, max_tokens=300)
    
    def suggest_tasks_for_event(self, title: str, event_type: str = None, 
                              date_str: str = None, attendee_count: int = None) -> List[str]:
        """Suggest relevant tasks for an event"""
        
        prompt = f"""Suggest 5-8 specific, actionable tasks for organizing this event:
        
Event: "{title}"
Type: {event_type or 'Not specified'}
Date: {date_str or 'Not specified'}
Expected attendees: {attendee_count or 'Not specified'}

Requirements:
- Tasks should be specific and actionable
- Prioritize the most important tasks
- Consider both planning and execution phases
- Format as a JSON array of strings only
- Each task should be 3-8 words max

Example format: ["Send invitations", "Book venue", "Order catering"]

Return ONLY the JSON array, no other text."""

        messages = [{"role": "user", "content": prompt}]
        try:
            response = self._make_request(messages, max_tokens=500)
            # Parse JSON response
            tasks = json.loads(response.strip())
            return tasks if isinstance(tasks, list) else []
        except (json.JSONDecodeError, Exception) as e:
            current_app.logger.error(f"Failed to parse AI task suggestions: {e}")
            # Return default tasks as fallback
            return ["Plan event details", "Send invitations", "Prepare venue", "Confirm attendance"]
    
    def generate_rsvp_message(self, event_title: str, status: str, user_context: str = None) -> str:
        """Generate appropriate RSVP message"""
        
        prompt = f"""Generate a brief, polite RSVP message for:
        
Event: "{event_title}"
RSVP Status: {status}
User context: {user_context or 'None provided'}

Requirements:
- Keep it brief (1-2 sentences)
- Tone should match the status (enthusiastic for "Going", regretful for "Not Going")
- Be polite and personal
- Don't be overly formal unless it's a corporate event

Only return the message text, nothing else."""

        messages = [{"role": "user", "content": prompt}]
        return self._make_request(messages, max_tokens=200)
    
    def chat_event_planning(self, user_message: str, event_context: Dict = None, 
                          conversation_history: List[Dict] = None) -> str:
        """Interactive event planning assistant"""
        
        context_str = ""
        if event_context:
            context_str = f"""
Current event details:
- Title: {event_context.get('title', 'Not set')}
- Date: {event_context.get('date', 'Not set')}
- Location: {event_context.get('location', 'Not set')}
- Description: {event_context.get('description', 'Not set')}
- Tasks: {len(event_context.get('tasks', []))} created
- RSVPs: {len(event_context.get('rsvps', []))} received
"""

        system_message = """You are a helpful event planning assistant. Help users plan and organize their events by:

1. Providing specific, actionable advice
2. Suggesting tasks, timelines, and best practices
3. Helping with logistics and coordination
4. Being encouraging and supportive
5. Asking clarifying questions when needed

Keep responses concise and practical. Focus on actionable advice."""

        messages = [{"role": "system", "content": system_message}]
        
        # Add conversation history if available
        if conversation_history:
            messages.extend(conversation_history[-10:])  # Keep last 10 messages for context
        
        # Add current context and user message
        full_message = f"{context_str}\n\nUser question: {user_message}"
        messages.append({"role": "user", "content": full_message})
        
        return self._make_request(messages, max_tokens=800)
    
    def optimize_event_timing(self, event_details: Dict) -> Dict:
        """Suggest optimal timing and schedule for event"""
        
        prompt = f"""Analyze this event and suggest timing optimizations:

Event: {event_details.get('title', '')}
Date: {event_details.get('date', '')}
Type: {event_details.get('event_type', 'Not specified')}
Duration: {event_details.get('duration', 'Not specified')}
Attendees: {event_details.get('attendee_count', 'Not specified')}

Provide suggestions for:
1. Optimal start time
2. Recommended duration
3. Key timing considerations
4. Schedule recommendations

Format as JSON with keys: start_time_suggestion, duration_suggestion, considerations, schedule_tips

Return only valid JSON."""

        messages = [{"role": "user", "content": prompt}]
        try:
            response = self._make_request(messages, max_tokens=600)
            return json.loads(response.strip())
        except (json.JSONDecodeError, Exception):
            return {
                "start_time_suggestion": "Consider your audience's availability",
                "duration_suggestion": "Plan appropriate duration for your event type",
                "considerations": ["Check for conflicts", "Consider travel time"],
                "schedule_tips": ["Send reminders", "Plan buffer time"]
            }
            