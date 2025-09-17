// frontend/src/components/Events/AIEnhancedEventForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { eventsAPI } from '../../utils/api';
import { aiAPI } from '../../utils/aiApi';
import LoadingSpinner from '../common/LoadingSpinner';

const EventSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  date: Yup.string()
    .required('Date is required'),
  location: Yup.string()
    .max(200, 'Location must be less than 200 characters'),
});

const AIEnhancedEventForm = () => {
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [showTaskSuggestions, setShowTaskSuggestions] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getEvent(id);
      setEvent(response.data);
    } catch (err) {
      setError('Failed to fetch event');
    }
  };

  const generateDescription = async (formValues, setFieldValue) => {
    if (!formValues.title) {
      setError('Please enter an event title first');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const response = await aiAPI.generateDescription({
        title: formValues.title,
        event_type: formValues.event_type || '',
        location: formValues.location || '',
        additional_info: formValues.additional_info || ''
      });

      setFieldValue('description', response.data.description);
    } catch (err) {
      setError('Failed to generate description. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const suggestTasks = async (formValues) => {
    if (!formValues.title) {
      setError('Please enter an event title first');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const response = await aiAPI.suggestTasks({
        title: formValues.title,
        event_type: formValues.event_type || '',
        date: formValues.date || '',
        attendee_count: formValues.attendee_count || null
      });

      setSuggestedTasks(response.data.tasks);
      setShowTaskSuggestions(true);
    } catch (err) {
      setError('Failed to suggest tasks. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const eventData = {
        ...values,
        date: values.date,
      };

      let response;
      if (isEditing) {
        response = await eventsAPI.updateEvent(id, eventData);
      } else {
        response = await eventsAPI.createEvent(eventData);
      }
      
      // If we have task suggestions and this is a new event, navigate to the event detail page
      if (!isEditing && suggestedTasks.length > 0) {
        navigate(`/events/${response.data.id}?showTasks=true`, { 
          state: { suggestedTasks } 
        });
      } else {
        navigate('/events');
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} event`);
    }
    setSubmitting(false);
  };

  const initialValues = event ? {
    title: event.title,
    description: event.description || '',
    date: new Date(event.date).toISOString().slice(0, 16),
    location: event.location || '',
    event_type: event.event_type || '',
    attendee_count: event.attendee_count || '',
    additional_info: ''
  } : {
    title: '',
    description: '',
    date: '',
    location: '',
    event_type: '',
    attendee_count: '',
    additional_info: ''
  };

  return (
    <div className="container" style={{ maxWidth: '700px', marginTop: '30px' }}>
      <h1>{isEditing ? 'Edit Event' : 'Create Event'}</h1>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</div>}

      <div className="card">
        <Formik
          initialValues={initialValues}
          validationSchema={EventSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form>
              <div className="form-group">
                <label className="form-label">Title</label>
                <Field name="title" type="text" className="form-control" />
                <ErrorMessage name="title" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label">Event Type (Optional)</label>
                <Field name="event_type" as="select" className="form-control">
                  <option value="">Select event type...</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="social">Social Gathering</option>
                  <option value="charity">Charity Event</option>
                  <option value="other">Other</option>
                </Field>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <div style={{ position: 'relative' }}>
                  <Field name="description" as="textarea" rows="4" className="form-control" />
                  <button
                    type="button"
                    onClick={() => generateDescription(values, setFieldValue)}
                    disabled={aiLoading || !values.title}
                    className="btn btn-secondary"
                    style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      right: '8px',
                      padding: '4px 8px',
                      fontSize: '12px'
                    }}
                  >
                    {aiLoading ? 'Generating...' : '✨ AI Generate'}
                  </button>
                </div>
                <ErrorMessage name="description" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <Field name="date" type="datetime-local" className="form-control" />
                <ErrorMessage name="date" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <Field name="location" type="text" className="form-control" />
                <ErrorMessage name="location" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Attendees (Optional)</label>
                <Field name="attendee_count" type="number" className="form-control" />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Info for AI (Optional)</label>
                <Field 
                  name="additional_info" 
                  as="textarea" 
                  rows="2" 
                  className="form-control"
                  placeholder="Any special requirements, themes, or details that might help with suggestions..."
                />
              </div>

              {!isEditing && (
                <div className="form-group">
                  <button
                    type="button"
                    onClick={() => suggestTasks(values)}
                    disabled={aiLoading || !values.title}
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    {aiLoading ? 'Getting Suggestions...' : '🤖 Get AI Task Suggestions'}
                  </button>
                </div>
              )}

              {showTaskSuggestions && suggestedTasks.length > 0 && (
                <div className="card" style={{ backgroundColor: 'var(--background-secondary)', marginBottom: '20px' }}>
                  <h4>🎯 Suggested Tasks for Your Event:</h4>
                  <ul style={{ marginBottom: '10px' }}>
                    {suggestedTasks.map((task, index) => (
                      <li key={index} style={{ marginBottom: '5px' }}>{task}</li>
                    ))}
                  </ul>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    These tasks will be available to add after creating your event.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || aiLoading}>
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => navigate('/events')}
                  disabled={aiLoading}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {aiLoading && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1000
        }}>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default AIEnhancedEventForm;
