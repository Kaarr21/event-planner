// frontend/src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const eventsAPI = {
  getEvents: () => api.get('/events'),
  getPastEvents: () => api.get('/events/past'),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

export const tasksAPI = {
  getEventTasks: (eventId) => api.get(`/tasks/event/${eventId}`),
  createTask: (eventId, taskData) => api.post(`/tasks/event/${eventId}`, taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const rsvpAPI = {
  getEventRSVPs: (eventId) => api.get(`/rsvps/event/${eventId}`),
  createRSVP: (eventId, rsvpData) => api.post(`/rsvps/event/${eventId}`, rsvpData),
};

export default api;
