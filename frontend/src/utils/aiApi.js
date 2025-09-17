// frontend/src/utils/aiApi.js
import api from './api';

export const aiAPI = {
  // Generate event description
  generateDescription: (data) => 
    api.post('/ai/generate-description', data),
  
  // Suggest tasks for an event
  suggestTasks: (data) => 
    api.post('/ai/suggest-tasks', data),
  
  // Generate RSVP message
  generateRSVPMessage: (data) => 
    api.post('/ai/generate-rsvp', data),
  
  // Chat with AI assistant
  chatAssistant: (data) => 
    api.post('/ai/chat', data),
  
  // Get timing optimization suggestions
  optimizeTiming: (data) => 
    api.post('/ai/optimize-timing', data),
};

export default aiAPI;
