import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { rsvpAPI } from '../../utils/api';

const RSVPSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(['Going', 'Maybe', 'Not Going'], 'Please select a valid status')
    .required('Status is required'),
  message: Yup.string()
    .max(200, 'Message must be less than 200 characters'),
});

const RSVPForm = ({ eventId, onRSVPCreated, onCancel }) => {
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await rsvpAPI.createRSVP(eventId, values);
      onRSVPCreated(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to RSVP');
    }
    setSubmitting(false);
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3>RSVP to Event</h3>
      
      {error && (
        <div style={{ color: 'var(--danger)', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <Formik
        initialValues={{ status: 'Going', message: '' }}
        validationSchema={RSVPSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label className="form-label">Status</label>
              <Field name="status" as="select" className="form-control">
                <option value="Going">Going</option>
                <option value="Maybe">Maybe</option>
                <option value="Not Going">Not Going</option>
              </Field>
              <ErrorMessage name="status" component="div" className="form-error" />
            </div>

            <div className="form-group">
              <label className="form-label">Message (Optional)</label>
              <Field 
                name="message" 
                as="textarea" 
                rows="3" 
                className="form-control"
                placeholder="Any additional message..."
              />
              <ErrorMessage name="message" component="div" className="form-error" />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RSVPForm;
