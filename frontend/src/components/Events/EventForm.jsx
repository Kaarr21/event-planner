// frontend/src/components/Events/EventForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { eventsAPI } from '../../utils/api';

const EventSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  date: Yup.date()
    .min(new Date(), 'Event date must be in the future')
    .required('Date is required'),
  location: Yup.string()
    .max(200, 'Location must be less than 200 characters'),
});

const EventForm = () => {
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const eventData = {
        ...values,
        date: new Date(values.date).toISOString(),
      };

      if (isEditing) {
        await eventsAPI.updateEvent(id, eventData);
      } else {
        await eventsAPI.createEvent(eventData);
      }
      
      navigate('/events');
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
  } : {
    title: '',
    description: '',
    date: '',
    location: '',
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '30px' }}>
      <h1>{isEditing ? 'Edit Event' : 'Create Event'}</h1>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</div>}

      <div className="card">
        <Formik
          initialValues={initialValues}
          validationSchema={EventSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label className="form-label">Title</label>
                <Field name="title" type="text" className="form-control" />
                <ErrorMessage name="title" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <Field name="description" as="textarea" rows="4" className="form-control" />
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => navigate('/events')}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EventForm;
