// frontend/src/components/Events/EventList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      setEvents(response.data);
    } catch (err) {
      setError('Failed to fetch events');
    }
    setLoading(false);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.deleteEvent(eventId);
        setEvents(events.filter(event => event.id !== eventId));
      } catch (err) {
        setError('Failed to delete event');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Upcoming Events</h1>
        <Link to="/create-event" className="btn btn-primary">Create Event</Link>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</div>}

      {events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No upcoming events found.</p>
          <Link to="/create-event" className="btn btn-primary">Create your first event</Link>
        </div>
      ) : (
        <div className="grid grid-2">
          {events.map(event => (
            <div key={event.id} className="card">
              <h3>{event.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
              </p>
              {event.location && <p>📍 {event.location}</p>}
              <p style={{ marginBottom: '15px' }}>{event.description}</p>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                Created by {event.creator} • {event.tasks_count} tasks • {event.rsvps_count} RSVPs
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/events/${event.id}`} className="btn btn-primary">View Details</Link>
                <Link to={`/events/${event.id}/edit`} className="btn btn-secondary">Edit</Link>
                <button 
                  onClick={() => handleDelete(event.id)} 
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
