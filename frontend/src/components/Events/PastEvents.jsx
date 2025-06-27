// frontend/src/components/Events/PastEvents.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const PastEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const response = await eventsAPI.getPastEvents();
      setEvents(response.data);
    } catch (err) {
      setError('Failed to fetch past events');
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h1>Past Events</h1>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</div>}

      {events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No past events found.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {events.map(event => (
            <div key={event.id} className="card" style={{ opacity: 0.8 }}>
              <h3>{event.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
              </p>
              {event.location && <p>📍 {event.location}</p>}
              <p style={{ marginBottom: '15px' }}>{event.description}</p>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                Created by {event.creator} • {event.tasks_count} tasks • {event.rsvps_count} RSVPs
              </div>
              <Link to={`/events/${event.id}`} className="btn btn-secondary">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastEvents;
