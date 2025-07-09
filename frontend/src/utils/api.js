// frontend/src/utils/api.js
import axios from 'axios';

// Use /api prefix for production, full URL for development
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, {
    headers: config.headers,
    data: config.data
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const eventsAPI = {
  getEvents: () => api.get('/events'),
  getPastEvents: () => api.get('/events/past'),
  getInvitedEvents: () => api.get('/events/invited'),
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

export const inviteAPI = {
  sendInvite: (eventId, inviteData) => api.post(`/events/${eventId}/invite`, inviteData),
  getUserInvites: () => api.get('/invites'),
  respondToInvite: (inviteId, responseData) => api.post(`/invites/${inviteId}/respond`, responseData),
  cancelInvite: (inviteId) => api.delete(`/invites/${inviteId}/cancel`),
  getSentInvites: () => api.get('/invites/sent'),
};

export const notificationAPI = {
  getNotifications: () => api.get('/rsvps/notifications'),
  markAsRead: (notificationId) => api.put(`/rsvps/notifications/${notificationId}/read`),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
  changePassword: (passwordData) => api.put('/profile/change-password', passwordData),
  deleteAccount: () => api.delete('/profile/delete'),
};

export default api;
