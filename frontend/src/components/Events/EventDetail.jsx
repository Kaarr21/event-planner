// frontend/src/components/Events/EventDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, tasksAPI, rsvpAPI } from '../../utils/api';
import TaskList from '../Tasks/TaskList';
import TaskForm from '../Tasks/TaskForm';
import RSVPForm from '../RSVP/RSVPForm';
import LoadingSpinner from '../common/LoadingSpinner';

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [rsvps, setRSVPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      const [eventRes, tasksRes, rsvpRes] = await Promise.all([
        eventsAPI.getEvent(id),
        tasksAPI.getEventTasks(id),
        rsvpAPI.getEventRSVPs(id),
      ]);
      
      setEvent(eventRes.data);
      setTasks(tasksRes.data);
      setRSVPs(rsvpRes.data);
    } catch (err) {
      setError('Failed to fetch event data');
    }
    setLoading(false);
  };

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleRSVPCreated = (newRSVP) => {
    const existingIndex = rsvps.findIndex(rsvp => rsvp.user === newRSVP.user);
    if (existingIndex >= 0) {
      const updatedRSVPs = [...rsvps];
      updatedRSVPs[existingIndex] = newRSVP;
      setRSVPs(updatedRSVPs);
    } else {
      setRSVPs([...rsvps, newRSVP]);
    }
    setShowRSVPForm(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</div>}
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h1>{event.title}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
            </p>
            {event.location && <p>📍 {event.location}</p>}
          </div>
          <Link to={`/events/${event.id}/edit`} className="btn btn-secondary">Edit Event</Link>
        </div>
        
        <p>{event.description}</p>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Created by {event.creator}
        </div>
      </div>

      <div className="grid grid-2">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Tasks ({tasks.length})</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowTaskForm(!showTaskForm)}
            >
              {showTaskForm ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          {showTaskForm && (
            <TaskForm 
              eventId={id} 
              onTaskCreated={handleTaskCreated}
              onCancel={() => setShowTaskForm(false)}
            />
          )}

          <TaskList 
            tasks={tasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>RSVPs ({rsvps.length})</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowRSVPForm(!showRSVPForm)}
            >
              {showRSVPForm ? 'Cancel' : 'RSVP'}
            </button>
          </div>

          {showRSVPForm && (
            <RSVPForm 
              eventId={id} 
              onRSVPCreated={handleRSVPCreated}
              onCancel={() => setShowRSVPForm(false)}
            />
          )}

          <div>
            {rsvps.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No RSVPs yet</p>
            ) : (
              rsvps.map(rsvp => (
                <div key={rsvp.id} className="card" style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{rsvp.user}</strong>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      backgroundColor: rsvp.status === 'Going' ? 'var(--success)' : 
                                     rsvp.status === 'Maybe' ? 'var(--warning)' : 'var(--danger)',
                      color: 'white'
                    }}>
                      {rsvp.status}
                    </span>
                  </div>
                  {rsvp.message && <p style={{ margin: '5px 0 0', fontSize: '14px' }}>{rsvp.message}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
